import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import request from "supertest";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { migrar } from "../src/db/migrate.js";
import { TRILHA, sincronizarTrilha } from "../src/db/trilha.js";
import { trilhaEmMarkdown } from "../src/services/markdown.js";
import { statusDoModulo } from "../src/services/trilha.js";

// Mesma data dos outros testes: 15/02/2027 = mês 4 do plano.
const AGORA = new Date("2027-02-15T12:00:00Z");
const TOTAL_TOPICOS = TRILHA.modulos.reduce((soma, m) => soma + m.topicos.length, 0);
let app;
let db;

beforeEach(() => {
  db = openDatabase(":memory:");
  app = createApp(db, { agora: () => AGORA });
});

const idDoTopico = (moduloId, ordem) =>
  db.prepare("SELECT id FROM topicos WHERE modulo_id = ? AND ordem = ?").get(moduloId, ordem).id;

describe("trilha.json (consistência do conteúdo)", () => {
  it("tem os 13 módulos numerados em sequência", () => {
    expect(TRILHA.modulos.map((m) => m.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it("toda habilidade júnior com prazo no plano tem módulo", () => {
    // Exceções: habilidades contínuas, praticadas no dia a dia e não estudadas em módulo.
    const continuas = [/^Usar IA/, /^Pedir ajuda/];
    const comModulo = new Set(TRILHA.modulos.map((m) => m.skill));
    const semModulo = db.prepare("SELECT nome FROM skills WHERE nivel = 'Júnior'").all()
      .map((s) => s.nome)
      .filter((nome) => !comModulo.has(nome) && !continuas.some((re) => re.test(nome)));
    expect(semModulo).toEqual([]);
  });

  it("os meses de cada módulo cabem na janela da habilidade ligada", () => {
    const skill = new Map(db.prepare("SELECT * FROM skills").all().map((s) => [s.nome, s]));
    const foraDaJanela = TRILHA.modulos
      .filter((m) => {
        const s = skill.get(m.skill);
        return m.mes_inicio < s.mes_inicio || m.mes_fim > s.mes_fim;
      })
      .map((m) => `${m.id}. ${m.nome} (meses ${m.mes_inicio}–${m.mes_fim})`);
    expect(foraDaJanela).toEqual([]);
  });

  it("todo módulo está completo", () => {
    for (const m of TRILHA.modulos) {
      expect(m.topicos.length, `módulo ${m.id}`).toBeGreaterThanOrEqual(5);
      expect(m.recursos.length, `módulo ${m.id}`).toBeGreaterThanOrEqual(1);
      expect(m.objetivo && m.mini_projeto && m.pronto_quando, `módulo ${m.id}`).toBeTruthy();
      expect(m.mes_fim).toBeGreaterThanOrEqual(m.mes_inicio);
      expect(Object.keys(TRILHA.fases)).toContain(String(m.fase));
      for (const t of m.topicos) expect(t.descricao, `${m.id}: ${t.nome}`).toBeTruthy();
      for (const r of m.recursos) expect(r.url).toMatch(/^https:\/\//);
    }
  });

  it("os meses seguem a ordem dos módulos", () => {
    const inicios = TRILHA.modulos.map((m) => m.mes_inicio);
    expect(inicios).toEqual([...inicios].sort((a, b) => a - b));
  });

  it("PLANO.md está atualizado (rode npm run plano se falhar)", () => {
    const noDisco = readFileSync(new URL("../PLANO.md", import.meta.url), "utf8").replace(/\r\n/g, "\n");
    expect(noDisco).toBe(trilhaEmMarkdown(TRILHA));
  });
});

describe("GET /modulos", () => {
  it("lista os 13 módulos com status e progresso calculados", async () => {
    const res = await request(app).get("/api/v1/modulos");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(13);
    expect(res.body[0]).toMatchObject({
      id: 1, nome: "Git e GitHub", status: "Não iniciado",
      progresso: { concluidos: 0, em_andamento: 0, total: TRILHA.modulos[0].topicos.length },
    });
  });

  it("marca como atrasado o módulo cujo prazo já passou", async () => {
    const res = await request(app).get("/api/v1/modulos");
    const git = res.body.find((m) => m.id === 1);
    const sql = res.body.find((m) => m.id === 5);
    const ts = res.body.find((m) => m.id === 6);
    expect(git).toMatchObject({ atrasado: true, meses_de_atraso: 3 });
    expect(sql).toMatchObject({ atrasado: true, meses_de_atraso: 1 });
    expect(ts).toMatchObject({ atrasado: false, meses_de_atraso: 0 });
  });

  it("filtra por fase e valida o filtro", async () => {
    const fase2 = await request(app).get("/api/v1/modulos").query({ fase: 2 });
    expect(fase2.body.map((m) => m.id)).toEqual([9, 10, 11, 12, 13]);
    expect((await request(app).get("/api/v1/modulos").query({ fase: 3 })).status).toBe(400);
  });

  it("detalha um módulo com tópicos, recursos e habilidade", async () => {
    const res = await request(app).get("/api/v1/modulos/5");
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("SQL e PostgreSQL");
    expect(res.body.topicos).toHaveLength(TRILHA.modulos[4].topicos.length);
    expect(res.body.topicos.map((t) => t.ordem)).toEqual(res.body.topicos.map((_, i) => i + 1));
    expect(res.body.recursos.length).toBeGreaterThan(0);
    expect(res.body.skill_nome).toMatch(/^SQL/);
  });

  it("404 para módulo inexistente", async () => {
    expect((await request(app).get("/api/v1/modulos/99")).status).toBe(404);
  });
});

describe("PATCH /topicos/:id", () => {
  it("conclui um tópico com a data de hoje e muda o status do módulo", async () => {
    const id = idDoTopico(1, 1);
    const res = await request(app).patch(`/api/v1/topicos/${id}`).send({ status: "Concluído" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "Concluído", concluido_em: "2027-02-15" });

    const modulo = await request(app).get("/api/v1/modulos/1");
    expect(modulo.body.status).toBe("Em andamento");
    expect(modulo.body.progresso.concluidos).toBe(1);
  });

  it("voltar para em andamento limpa a data de conclusão", async () => {
    const id = idDoTopico(1, 1);
    await request(app).patch(`/api/v1/topicos/${id}`).send({ status: "Concluído" });
    const res = await request(app).patch(`/api/v1/topicos/${id}`).send({ status: "Em andamento" });
    expect(res.body.concluido_em).toBeNull();
  });

  it("valida status, campos e existência", async () => {
    const id = idDoTopico(1, 1);
    expect((await request(app).patch(`/api/v1/topicos/${id}`).send({ status: "Atrasado" })).status).toBe(400);
    expect((await request(app).patch(`/api/v1/topicos/${id}`).send({})).status).toBe(400);
    expect((await request(app).patch(`/api/v1/topicos/${id}`).send({ status: "Concluído", nota: 5 })).status).toBe(400);
    expect((await request(app).patch("/api/v1/topicos/99999").send({ status: "Concluído" })).status).toBe(404);
  });
});

describe("GET /proximo com a trilha", () => {
  it("mostra atrasados primeiro, depois quem termina antes", async () => {
    const res = await request(app).get("/api/v1/proximo");
    // Mês 4. Atrasados: Git (3 meses), JS e Node (2), SQL (1).
    // No prazo: TypeScript (termina no mês 4) e HTML/CSS (termina no 6). CS50 (7) só começa no mês 5.
    expect(res.body.modulos.map((m) => m.id)).toEqual([1, 2, 4, 5, 6, 3]);
    expect(res.body.modulos.at(-1)).toMatchObject({ id: 3, atrasado: false });
  });

  it("sugere tópicos em andamento antes dos outros", async () => {
    await request(app).patch(`/api/v1/topicos/${idDoTopico(5, 1)}`).send({ status: "Concluído" });
    await request(app).patch(`/api/v1/topicos/${idDoTopico(5, 4)}`).send({ status: "Em andamento" });
    const res = await request(app).get("/api/v1/proximo");
    const sql = res.body.modulos.find((m) => m.id === 5);
    expect(sql.proximos_topicos.map((t) => t.ordem)).toEqual([4, 2, 3]);
  });

  it("módulo concluído sai da lista", async () => {
    for (let ordem = 1; ordem <= TRILHA.modulos[0].topicos.length; ordem++) {
      await request(app).patch(`/api/v1/topicos/${idDoTopico(1, ordem)}`).send({ status: "Concluído" });
    }
    const res = await request(app).get("/api/v1/proximo");
    expect(res.body.modulos.map((m) => m.id)).not.toContain(1);
  });
});

describe("sessões ligadas a tópicos", () => {
  it("herda a habilidade do módulo e aparece na listagem", async () => {
    const topicoId = idDoTopico(5, 4);
    const criada = await request(app).post("/api/v1/sessions")
      .send({ topico_id: topicoId, minutos: 50, data: "2027-02-14" });
    expect(criada.status).toBe(201);
    const skillSql = db.prepare("SELECT skill_id FROM modulos WHERE id = 5").get().skill_id;
    expect(criada.body).toMatchObject({ topico_id: topicoId, skill_id: skillSql });

    const lista = await request(app).get("/api/v1/sessions");
    expect(lista.body[0]).toMatchObject({ topico_nome: "JOINs", modulo_id: 5 });
  });

  it("404 para tópico inexistente", async () => {
    const res = await request(app).post("/api/v1/sessions").send({ topico_id: 99999, minutos: 30 });
    expect(res.status).toBe(404);
  });

  it("/progresso resume a trilha", async () => {
    await request(app).patch(`/api/v1/topicos/${idDoTopico(1, 1)}`).send({ status: "Concluído" });
    const res = await request(app).get("/api/v1/progresso");
    expect(res.body.trilha).toEqual({ total_topicos: TOTAL_TOPICOS, concluidos: 1, em_andamento: 0 });
  });
});

describe("sincronizarTrilha", () => {
  const copia = () => structuredClone(TRILHA);

  it("atualiza o texto sem perder o progresso", () => {
    const id = idDoTopico(2, 1);
    db.prepare("UPDATE topicos SET status = 'Concluído', concluido_em = '2026-11-10' WHERE id = ?").run(id);

    const trilha = copia();
    trilha.modulos[1].topicos[0].nome = "Tipos, coerção e igualdade";
    sincronizarTrilha(db, trilha);

    const topico = db.prepare("SELECT * FROM topicos WHERE id = ?").get(id);
    expect(topico).toMatchObject({ nome: "Tipos, coerção e igualdade", status: "Concluído", concluido_em: "2026-11-10" });
  });

  it("apaga tópicos e módulos que saíram do JSON", () => {
    const trilha = copia();
    trilha.modulos[0].topicos.pop();
    trilha.modulos.pop();
    sincronizarTrilha(db, trilha);

    expect(db.prepare("SELECT COUNT(*) AS n FROM modulos").get().n).toBe(TRILHA.modulos.length - 1);
    expect(db.prepare("SELECT COUNT(*) AS n FROM topicos WHERE modulo_id = 1").get().n)
      .toBe(TRILHA.modulos[0].topicos.length - 1);
  });

  it("recusa habilidade inexistente e não altera nada", () => {
    const trilha = copia();
    trilha.modulos[0].nome = "Outro nome";
    trilha.modulos[0].skill = "Habilidade que não existe";
    expect(() => sincronizarTrilha(db, trilha)).toThrow(/não existe/);
    expect(db.prepare("SELECT nome FROM modulos WHERE id = 1").get().nome).toBe("Git e GitHub");
  });

  it("status do módulo é derivado dos tópicos", () => {
    expect(statusDoModulo({ total_topicos: 3, concluidos: 3, em_andamento: 0 })).toBe("Concluído");
    expect(statusDoModulo({ total_topicos: 3, concluidos: 0, em_andamento: 1 })).toBe("Em andamento");
    expect(statusDoModulo({ total_topicos: 3, concluidos: 0, em_andamento: 0 })).toBe("Não iniciado");
    expect(statusDoModulo({ total_topicos: 0, concluidos: 0, em_andamento: 0 })).toBe("Não iniciado");
  });
});

describe("cursos externos (migração 003)", () => {
  const REMOVIDOS = ["Git e GitHub avançado", "TypeScript", "CS50", "React / Next.js"];

  it("banco novo só tem cursos externos", async () => {
    const res = await request(app).get("/api/v1/courses");
    const nomes = res.body.map((c) => c.nome);
    expect(nomes).toContain("Curso.dev");
    for (const nome of REMOVIDOS) expect(nomes).not.toContain(nome);
  });

  it("banco antigo perde os cursos que viraram módulos", () => {
    const antigo = new DatabaseSync(":memory:");
    antigo.exec(readFileSync(new URL("../src/db/migrations/001_inicial.sql", import.meta.url), "utf8"));
    antigo.exec("PRAGMA user_version = 1");
    antigo.exec("INSERT INTO courses (nome) VALUES ('CS50'), ('Curso.dev')");

    migrar(antigo);
    const nomes = antigo.prepare("SELECT nome FROM courses").all().map((c) => c.nome);
    expect(nomes).toEqual(["Curso.dev"]);
  });

  it("migração 005 ajusta as janelas das habilidades em banco antigo", () => {
    const antigo = new DatabaseSync(":memory:");
    antigo.exec(readFileSync(new URL("../src/db/migrations/001_inicial.sql", import.meta.url), "utf8"));
    antigo.exec("PRAGMA user_version = 1");
    antigo.exec(`INSERT INTO skills (nivel, area, nome, mes_inicio, mes_fim, meta) VALUES
      ('Júnior', 'Dados', 'SQL / PostgreSQL (SELECT, JOIN, modelagem simples, migrations)', 4, 4, 4),
      ('Júnior', 'Entrega', 'Deploy, variáveis de ambiente, Docker básico', 9, 9, 4)`);

    migrar(antigo);
    const janelas = antigo.prepare("SELECT mes_inicio, mes_fim FROM skills ORDER BY id").all().map((s) => ({ ...s }));
    expect(janelas).toEqual([{ mes_inicio: 3, mes_fim: 3 }, { mes_inicio: 9, mes_fim: 10 }]);
  });
});
