import { describe, it, expect } from "vitest";
import { DatabaseSync } from "node:sqlite";
import request from "supertest";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { listarMigracoes, migrar } from "../src/db/migrate.js";
import { hojeISO, somarDias } from "../src/datas.js";
import { mesDoPlano } from "../src/services/plano.js";

const versaoDoBanco = (db) => db.prepare("PRAGMA user_version").get().user_version;

describe("migrações", () => {
  it("banco novo fica na versão da última migração", () => {
    const db = openDatabase(":memory:");
    const ultima = listarMigracoes().at(-1).versao;
    expect(versaoDoBanco(db)).toBe(ultima);
  });

  it("não reaplica migrações já feitas", () => {
    const db = new DatabaseSync(":memory:");
    expect(migrar(db).length).toBeGreaterThan(0);
    expect(migrar(db)).toEqual([]);
  });

  it("migrações têm números únicos e em sequência", () => {
    const versoes = listarMigracoes().map((m) => m.versao);
    expect(versoes).toEqual(versoes.map((_, i) => i + 1));
  });

  it("/status mostra a versão do schema", async () => {
    const app = createApp(openDatabase(":memory:"));
    const res = await request(app).get("/api/v1/status");
    expect(res.body.banco.schema).toBe(listarMigracoes().at(-1).versao);
  });
});

describe("datas no fuso de São Paulo", () => {
  // 02/11/2026 01:30 UTC = 01/11/2026 22:30 em São Paulo (UTC-3)
  const NOITE_DE_1_NOV = new Date("2026-11-02T01:30:00Z");

  it("hojeISO usa o calendário de São Paulo, não UTC", () => {
    expect(NOITE_DE_1_NOV.toISOString().slice(0, 10)).toBe("2026-11-02");
    expect(hojeISO(NOITE_DE_1_NOV)).toBe("2026-11-01");
  });

  it("somarDias atravessa meses e anos", () => {
    expect(somarDias("2026-11-01", -6)).toBe("2026-10-26");
    expect(somarDias("2026-12-30", 3)).toBe("2027-01-02");
  });

  it("mês do plano só vira à meia-noite de São Paulo", () => {
    // 01/12/2026 02:00 UTC ainda é 30/11 em São Paulo: mês 1
    expect(mesDoPlano("2026-11-01", new Date("2026-12-01T02:00:00Z"))).toBe(1);
    expect(mesDoPlano("2026-11-01", new Date("2026-12-01T03:00:00Z"))).toBe(2);
  });

  it("sessão sem data registrada à noite fica no dia certo", async () => {
    const app = createApp(openDatabase(":memory:"), { agora: () => NOITE_DE_1_NOV });
    const res = await request(app).post("/api/v1/sessions").send({ skill_id: 8, minutos: 25 });
    expect(res.status).toBe(201);
    expect(res.body.data).toBe("2026-11-01");
  });

  it("últimos 7 dias contam no calendário de São Paulo", async () => {
    const app = createApp(openDatabase(":memory:"), { agora: () => NOITE_DE_1_NOV });
    // 26/10 é o 7º dia contando de 01/11 para trás; 25/10 fica de fora.
    await request(app).post("/api/v1/sessions").send({ skill_id: 8, minutos: 40, data: "2026-10-26" });
    await request(app).post("/api/v1/sessions").send({ skill_id: 8, minutos: 15, data: "2026-10-25" });
    const res = await request(app).get("/api/v1/progresso");
    expect(res.body.minutos_ultimos_7_dias).toBe(40);
  });
});
