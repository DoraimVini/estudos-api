import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { CATALOGO, pastaDoExercicio, sincronizarExercicios } from "../src/db/exercicios.js";
import { TRILHA } from "../src/db/trilha.js";
import { criarRepositorios } from "../src/repositories/index.js";

// Mesma data dos outros testes: 15/02/2027 = mês 4 do plano.
const AGORA = new Date("2027-02-15T12:00:00Z");
let app;
let db;
let repos;

beforeEach(() => {
  db = openDatabase(":memory:");
  repos = criarRepositorios(db);
  app = createApp(db, { agora: () => AGORA });
});

const arquivo = (slug, nome) => new URL(nome, pastaDoExercicio(slug));
const idDe = (slug) => repos.exercicios.buscarPorSlug(slug).id;

describe("catálogo de exercícios (consistência)", () => {
  it("slugs são únicos", () => {
    const slugs = CATALOGO.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("toda entrada aponta para módulo e tópico que existem na trilha", () => {
    for (const e of CATALOGO) {
      const modulo = TRILHA.modulos.find((m) => m.id === e.modulo);
      expect(modulo, e.slug).toBeDefined();
      expect(e.topico, e.slug).toBeLessThanOrEqual(modulo.topicos.length);
    }
  });

  it("toda entrada tem README, esqueleto e teste", () => {
    for (const { slug } of CATALOGO) {
      expect(existsSync(arquivo(slug, "README.md")), `${slug}/README.md`).toBe(true);
      expect(existsSync(arquivo(slug, "solucao.test.js")), `${slug}/solucao.test.js`).toBe(true);
      const temEsqueleto = existsSync(arquivo(slug, "solucao.js")) || existsSync(arquivo(slug, "solucao.sql"));
      expect(temEsqueleto, `${slug}/solucao.*`).toBe(true);
    }
  });

  it("toda pasta de exercício está no catálogo", () => {
    const raiz = new URL("../exercicios/", import.meta.url);
    const pastas = ["js", "node", "sql"].flatMap((grupo) =>
      readdirSync(new URL(`${grupo}/`, raiz), { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
        .map((d) => `${grupo}/${d.name}`));
    expect(pastas.sort()).toEqual(CATALOGO.map((e) => e.slug).sort());
  });

  it("nenhuma solução foi commitada: os esqueletos continuam vazios", () => {
    for (const { slug } of CATALOGO) {
      if (existsSync(arquivo(slug, "solucao.sql"))) {
        const sql = readFileSync(arquivo(slug, "solucao.sql"), "utf8").replace(/--.*$/gm, "").trim();
        expect(sql, `${slug}/solucao.sql`).toBe("");
      } else {
        expect(readFileSync(arquivo(slug, "solucao.js"), "utf8"), `${slug}/solucao.js`).toMatch(/TODO/);
      }
    }
  });
});

describe("GET /exercicios", () => {
  it("lista todos, em ordem de catálogo, com módulo e tópico", async () => {
    const res = await request(app).get("/api/v1/exercicios");
    expect(res.status).toBe(200);
    expect(res.body.map((e) => e.slug)).toEqual(CATALOGO.map((e) => e.slug));
    expect(res.body[0]).toMatchObject({
      slug: "js/01-closures", modulo_nome: "JavaScript moderno", topico_nome: "Escopo e closures",
      status: "Pendente", tentativas: 0, resolvido_em: null,
    });
  });

  it("filtra por módulo e status, e valida os filtros", async () => {
    const sql = await request(app).get("/api/v1/exercicios").query({ modulo: 6 });
    expect(sql.body.every((e) => e.slug.startsWith("sql/"))).toBe(true);
    expect(sql.body).toHaveLength(CATALOGO.filter((e) => e.modulo === 6).length);

    expect((await request(app).get("/api/v1/exercicios").query({ status: "Resolvido" })).body).toEqual([]);
    expect((await request(app).get("/api/v1/exercicios").query({ status: "feito" })).status).toBe(400);
    expect((await request(app).get("/api/v1/exercicios").query({ modulo: "x" })).status).toBe(400);
  });

  it("detalha um exercício com enunciado e comando", async () => {
    const res = await request(app).get(`/api/v1/exercicios/${idDe("sql/03-join")}`);
    expect(res.status).toBe(200);
    expect(res.body.comando).toBe("npm run exercicio sql/03-join");
    expect(res.body.enunciado).toMatch(/^# Pedidos com o nome do cliente/);
  });

  it("404 para exercício inexistente", async () => {
    expect((await request(app).get("/api/v1/exercicios/9999")).status).toBe(404);
  });

  it("GET /modulos/:id lista os exercícios do módulo", async () => {
    const res = await request(app).get("/api/v1/modulos/4");
    expect(res.body.exercicios.map((e) => e.slug)).toEqual(
      CATALOGO.filter((e) => e.modulo === 4).map((e) => e.slug));
  });
});

describe("tentativas (npm run exercicio)", () => {
  it("falha só soma tentativa", () => {
    const e = repos.exercicios.registrarTentativa("js/01-closures", false, "2027-02-10");
    expect(e).toMatchObject({ status: "Pendente", tentativas: 1, resolvido_em: null });
  });

  it("sucesso resolve e guarda a data da primeira vez", () => {
    repos.exercicios.registrarTentativa("js/01-closures", false, "2027-02-10");
    repos.exercicios.registrarTentativa("js/01-closures", true, "2027-02-11");
    const e = repos.exercicios.registrarTentativa("js/01-closures", true, "2027-02-20");
    expect(e).toMatchObject({ status: "Resolvido", tentativas: 3, resolvido_em: "2027-02-11" });
  });
});

describe("exercícios no /proximo e no /progresso", () => {
  it("sugere os pendentes dos módulos em foco, na ordem deles", async () => {
    // Mês 4: o primeiro módulo em foco com exercícios é o 2 (JavaScript, atrasado).
    const res = await request(app).get("/api/v1/proximo");
    expect(res.body.exercicios.map((e) => e.slug)).toEqual(["js/01-closures", "js/02-arrays", "js/03-objetos"]);
    expect(res.body.exercicios[0].comando).toBe("npm run exercicio js/01-closures");
  });

  it("resolvido sai da sugestão", async () => {
    repos.exercicios.registrarTentativa("js/01-closures", true, "2027-02-11");
    const res = await request(app).get("/api/v1/proximo");
    expect(res.body.exercicios[0].slug).toBe("js/02-arrays");
  });

  it("/progresso conta os resolvidos", async () => {
    repos.exercicios.registrarTentativa("sql/01-select", true, "2027-02-11");
    const res = await request(app).get("/api/v1/progresso");
    expect(res.body.exercicios).toEqual({ total: CATALOGO.length, resolvidos: 1 });
  });
});

describe("sincronizarExercicios", () => {
  it("atualiza o título sem perder o status", () => {
    repos.exercicios.registrarTentativa("sql/01-select", true, "2027-02-11");
    const catalogo = structuredClone(CATALOGO);
    catalogo.find((e) => e.slug === "sql/01-select").titulo = "Novo título";
    sincronizarExercicios(db, catalogo);
    expect(repos.exercicios.buscarPorSlug("sql/01-select"))
      .toMatchObject({ titulo: "Novo título", status: "Resolvido", resolvido_em: "2027-02-11" });
  });

  it("apaga o que saiu do catálogo", () => {
    sincronizarExercicios(db, CATALOGO.filter((e) => e.slug !== "sql/08-modelagem"));
    expect(repos.exercicios.buscarPorSlug("sql/08-modelagem")).toBeUndefined();
  });

  it("recusa tópico inexistente e não altera nada", () => {
    const catalogo = structuredClone(CATALOGO);
    catalogo[0].topico = 99;
    catalogo[1].titulo = "Não deveria mudar";
    expect(() => sincronizarExercicios(db, catalogo)).toThrow(/tópico 99/);
    expect(repos.exercicios.buscarPorSlug(catalogo[1].slug).titulo).toBe(CATALOGO[1].titulo);
  });
});
