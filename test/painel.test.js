import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";

const app = createApp(openDatabase(":memory:"));
const PUBLICO = new URL("../public/", import.meta.url);

describe("painel web (public/)", () => {
  it("serve o index.html na raiz", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain('<main id="conteudo"');
  });

  it("serve o CSS e os módulos JavaScript", async () => {
    expect((await request(app).get("/styles.css")).headers["content-type"]).toMatch(/text\/css/);
    const js = await request(app).get("/js/app.js");
    expect(js.status).toBe(200);
    expect(js.headers["content-type"]).toMatch(/javascript/);
  });

  it("todo import relativo dos módulos aponta para um arquivo que existe", async () => {
    // O navegador não avisa no build (não há build): um import quebrado só apareceria em produção.
    const arquivos = ["js/", "js/paginas/"].flatMap((pasta) =>
      readdirSync(new URL(pasta, PUBLICO)).filter((n) => n.endsWith(".js")).map((n) => pasta + n));
    for (const arquivo of arquivos) {
      const codigo = readFileSync(new URL(arquivo, PUBLICO), "utf8");
      for (const [, caminho] of codigo.matchAll(/from "(\.{1,2}\/[^"]+)"/g)) {
        const alvo = new URL(caminho, new URL(arquivo, PUBLICO)).pathname.replace(/^.*\/public\//, "/");
        const res = await request(app).get(alvo);
        expect(res.status, `${arquivo} importa ${caminho}`).toBe(200);
      }
    }
  });

  it("a API continua respondendo JSON, inclusive no 404", async () => {
    expect((await request(app).get("/api/v1/status")).body.ok).toBe(true);
    const res = await request(app).get("/api/v1/nao-existe");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: "Rota não encontrada." });
  });
});
