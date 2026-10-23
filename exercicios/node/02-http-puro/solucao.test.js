import { describe, it, expect } from "vitest";
import request from "supertest";
import { criarServidor } from "./solucao.js";

describe("servidor HTTP sem Express", () => {
  it("GET /ping responde 200 em JSON", async () => {
    const res = await request(criarServidor()).get("/ping");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({ ok: true });
  });

  it("POST /eco devolve o mesmo JSON", async () => {
    const corpo = { mensagem: "olá", lista: [1, 2, 3] };
    const res = await request(criarServidor()).post("/eco").send(corpo);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(corpo);
  });

  it("POST /eco com JSON inválido responde 400", async () => {
    const res = await request(criarServidor())
      .post("/eco").set("Content-Type", "application/json").send("{quebrado");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ erro: "JSON inválido" });
  });

  it("método errado em /ping responde 405 com Allow", async () => {
    const res = await request(criarServidor()).post("/ping");
    expect(res.status).toBe(405);
    expect(res.headers.allow).toBe("GET");
    expect(res.body).toEqual({ erro: "Método não permitido" });
  });

  it("rota desconhecida responde 404 em JSON", async () => {
    const res = await request(criarServidor()).get("/nada");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({ erro: "Rota não encontrada" });
  });
});
