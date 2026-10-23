import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { registrarRequisicoes, exigirJson, naoEncontrado, tratarErros } from "./solucao.js";

let app;
let log;

beforeEach(() => {
  log = [];
  app = express();
  app.use(registrarRequisicoes(log));
  app.use(exigirJson);
  app.use(express.json());
  app.get("/ok", (req, res) => res.json({ ok: true }));
  app.post("/itens", (req, res) => res.status(201).json(req.body));
  app.get("/quebra", () => { throw new Error("SELECT * FROM senhas falhou"); });
  app.get("/proibido", () => {
    const erro = new Error("Sem permissão");
    erro.status = 403;
    throw erro;
  });
  app.use(naoEncontrado);
  app.use(tratarErros);
});

describe("registrarRequisicoes", () => {
  it("registra método, url e status", async () => {
    await request(app).get("/ok");
    await request(app).get("/nao-existe");
    expect(log).toEqual(["GET /ok 200", "GET /nao-existe 404"]);
  });
});

describe("exigirJson", () => {
  it("aceita POST com JSON", async () => {
    const res = await request(app).post("/itens").send({ nome: "caneca" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ nome: "caneca" });
  });

  it("recusa POST sem JSON com 415", async () => {
    const res = await request(app).post("/itens").set("Content-Type", "text/plain").send("nome=caneca");
    expect(res.status).toBe(415);
    expect(res.body).toEqual({ erro: "Use Content-Type: application/json" });
  });

  it("não interfere em GET", async () => {
    expect((await request(app).get("/ok")).status).toBe(200);
  });
});

describe("naoEncontrado", () => {
  it("responde 404 em JSON", async () => {
    const res = await request(app).get("/nada");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: "Rota não encontrada" });
  });
});

describe("tratarErros", () => {
  it("usa o status e a mensagem de erros esperados", async () => {
    const res = await request(app).get("/proibido");
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ erro: "Sem permissão" });
  });

  it("esconde a mensagem de erros internos", async () => {
    const res = await request(app).get("/quebra");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ erro: "Erro interno" });
  });

  it("JSON malformado vira 400 (o express.json define err.status)", async () => {
    const res = await request(app).post("/itens").set("Content-Type", "application/json").send("{ruim");
    expect(res.status).toBe(400);
    expect(typeof res.body.erro).toBe("string");
  });
});
