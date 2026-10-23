import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { criarApp } from "./solucao.js";

let app;

beforeEach(() => {
  app = criarApp();
});

const criar = (titulo) => request(app).post("/tarefas").send({ titulo });

describe("POST /tarefas", () => {
  it("cria com 201, Location e feita: false", async () => {
    const res = await criar("Estudar Express");
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, titulo: "Estudar Express", feita: false });
    expect(res.headers.location).toBe("/tarefas/1");
  });

  it.each([{}, { titulo: "" }, { titulo: "   " }, { titulo: 5 }])("recusa corpo inválido %j", async (corpo) => {
    const res = await request(app).post("/tarefas").send(corpo);
    expect(res.status).toBe(400);
    expect(typeof res.body.erro).toBe("string");
  });
});

describe("GET /tarefas", () => {
  it("lista em ordem de id", async () => {
    await criar("A");
    await criar("B");
    const res = await request(app).get("/tarefas");
    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.titulo)).toEqual(["A", "B"]);
  });

  it("começa vazia a cada criarApp()", async () => {
    await criar("A");
    expect((await request(criarApp()).get("/tarefas")).body).toEqual([]);
  });

  it("filtra por feita", async () => {
    await criar("A");
    await criar("B");
    await request(app).patch("/tarefas/2").send({ feita: true });
    expect((await request(app).get("/tarefas?feita=true")).body.map((t) => t.id)).toEqual([2]);
    expect((await request(app).get("/tarefas?feita=false")).body.map((t) => t.id)).toEqual([1]);
    expect((await request(app).get("/tarefas?feita=talvez")).status).toBe(400);
  });
});

describe("GET /tarefas/:id", () => {
  it("devolve a tarefa", async () => {
    await criar("A");
    const res = await request(app).get("/tarefas/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, titulo: "A", feita: false });
  });

  it("404 se não existe, 400 se o id é inválido", async () => {
    expect((await request(app).get("/tarefas/99")).status).toBe(404);
    expect((await request(app).get("/tarefas/abc")).status).toBe(400);
    expect((await request(app).get("/tarefas/0")).status).toBe(400);
  });
});

describe("PATCH /tarefas/:id", () => {
  it("atualiza só os campos enviados", async () => {
    await criar("A");
    const feita = await request(app).patch("/tarefas/1").send({ feita: true });
    expect(feita.status).toBe(200);
    expect(feita.body).toEqual({ id: 1, titulo: "A", feita: true });

    const renomeada = await request(app).patch("/tarefas/1").send({ titulo: "A2" });
    expect(renomeada.body).toEqual({ id: 1, titulo: "A2", feita: true });
  });

  it("valida os campos e a existência", async () => {
    await criar("A");
    expect((await request(app).patch("/tarefas/1").send({ feita: "sim" })).status).toBe(400);
    expect((await request(app).patch("/tarefas/1").send({ titulo: "" })).status).toBe(400);
    expect((await request(app).patch("/tarefas/99").send({ feita: true })).status).toBe(404);
  });
});

describe("DELETE /tarefas/:id", () => {
  it("apaga com 204 e depois responde 404", async () => {
    await criar("A");
    const res = await request(app).delete("/tarefas/1");
    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect((await request(app).delete("/tarefas/1")).status).toBe(404);
    expect((await request(app).get("/tarefas/1")).status).toBe(404);
  });

  it("não reaproveita ids apagados", async () => {
    await criar("A");
    await request(app).delete("/tarefas/1");
    expect((await criar("B")).body.id).toBe(2);
  });
});
