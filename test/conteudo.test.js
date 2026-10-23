import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { TRILHA } from "../src/db/trilha.js";
import { listarConteudos } from "../src/db/conteudo.js";

let app;
let db;

beforeEach(() => {
  db = openDatabase(":memory:");
  app = createApp(db);
});

const idDoTopico = (moduloId, ordem) =>
  db.prepare("SELECT id FROM topicos WHERE modulo_id = ? AND ordem = ?").get(moduloId, ordem).id;

// O padrão de todo tópico: explicação, fontes oficiais e perguntas para conferir.
const SECOES_OBRIGATORIAS = ["## Em poucas palavras", "## Leia na documentação oficial", "## Confira se entendeu"];

describe("arquivos de conteúdo (conteudo/)", () => {
  const conteudos = listarConteudos();

  it("existe conteúdo escrito", () => {
    expect(conteudos.length).toBeGreaterThan(0);
  });

  it("todo arquivo corresponde a um tópico que existe na trilha", () => {
    for (const c of conteudos) {
      const modulo = TRILHA.modulos.find((m) => m.id === c.modulo);
      expect(modulo, `${c.caminho.pathname}`).toBeDefined();
      expect(c.ordem, `${c.caminho.pathname}`).toBeLessThanOrEqual(modulo.topicos.length);
    }
  });

  it("todo arquivo tem as seções obrigatórias e ao menos 2 links oficiais", () => {
    for (const c of conteudos) {
      const texto = readFileSync(c.caminho, "utf8");
      for (const secao of SECOES_OBRIGATORIAS) expect(texto, `${c.modulo}.${c.ordem}: ${secao}`).toContain(secao);
      const fontes = texto.split("## Leia na documentação oficial")[1].split("\n## ")[0];
      expect(fontes.match(/\]\(https:\/\//g)?.length ?? 0, `${c.modulo}.${c.ordem}: links`).toBeGreaterThanOrEqual(2);
    }
  });

  it("não começa com título (# ...): o nome do tópico já vem da trilha", () => {
    for (const c of conteudos) expect(readFileSync(c.caminho, "utf8")).not.toMatch(/^# /);
  });
});

describe("GET /topicos/:id com conteúdo", () => {
  it("devolve o conteúdo em Markdown e os vizinhos no módulo", async () => {
    const res = await request(app).get(`/api/v1/topicos/${idDoTopico(2, 2)}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Escopo e closures");
    expect(res.body.conteudo).toContain("## Em poucas palavras");
    expect(res.body.anterior).toEqual({ id: idDoTopico(2, 1), nome: "Tipos e coerção" });
    expect(res.body.proximo).toEqual({ id: idDoTopico(2, 3), nome: "Funções" });
  });

  it("tópico sem conteúdo escrito devolve conteudo null", async () => {
    const res = await request(app).get(`/api/v1/topicos/${idDoTopico(13, 1)}`);
    expect(res.body.conteudo).toBeNull();
  });

  it("primeiro tópico não tem anterior", async () => {
    const res = await request(app).get(`/api/v1/topicos/${idDoTopico(1, 1)}`);
    expect(res.body.anterior).toBeNull();
    expect(res.body.proximo.nome).toBe("Commits bons");
  });

  it("GET /modulos/:id marca quais tópicos têm conteúdo", async () => {
    const git = await request(app).get("/api/v1/modulos/1");
    expect(git.body.topicos.every((t) => t.tem_conteudo)).toBe(true);
    const aws = await request(app).get("/api/v1/modulos/13");
    expect(aws.body.topicos.some((t) => t.tem_conteudo)).toBe(false);
  });
});
