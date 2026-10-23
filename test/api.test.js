import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";
import { mesDoPlano, pontuarSkill } from "../src/services/plano.js";

// Data congelada: 15/02/2027 = mês 4 do plano (início em nov/2026).
const AGORA = new Date("2027-02-15T12:00:00Z");
let app;
let db;

beforeEach(() => {
  db = openDatabase(":memory:");
  app = createApp(db, { agora: () => AGORA });
});

describe("GET /api/v1/status", () => {
  it("responde ok", async () => {
    const res = await request(app).get("/api/v1/status");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("skills", () => {
  it("lista as 28 habilidades da planilha", async () => {
    const res = await request(app).get("/api/v1/skills");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(28);
  });

  it("filtra por nível", async () => {
    const res = await request(app).get("/api/v1/skills").query({ nivel: "Júnior" });
    expect(res.body.every((s) => s.nivel === "Júnior")).toBe(true);
    expect(res.body).toHaveLength(13);
  });

  it("rejeita nível inválido", async () => {
    const res = await request(app).get("/api/v1/skills").query({ nivel: "Estagiário" });
    expect(res.status).toBe(400);
  });

  it("atualiza autoavaliação e status", async () => {
    const res = await request(app).patch("/api/v1/skills/3").send({ hoje: 3, status: "Em andamento" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 3, hoje: 3, status: "Em andamento" });
  });

  it("valida nota fora de 1–5 e campos desconhecidos", async () => {
    expect((await request(app).patch("/api/v1/skills/3").send({ hoje: 7 })).status).toBe(400);
    expect((await request(app).patch("/api/v1/skills/3").send({ nota: 3 })).status).toBe(400);
  });

  it("404 para habilidade inexistente", async () => {
    expect((await request(app).get("/api/v1/skills/999")).status).toBe(404);
  });
});

describe("courses", () => {
  it("lista cursos e filtra por prioridade", async () => {
    const res = await request(app).get("/api/v1/courses").query({ prioridade: "Alta" });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((c) => c.prioridade === "Alta")).toBe(true);
  });
});

describe("sessions", () => {
  it("registra e lista uma sessão de estudo", async () => {
    const criada = await request(app)
      .post("/api/v1/sessions")
      .send({ skill_id: 3, minutos: 50, data: "2027-02-14", notas: "Tipos genéricos" });
    expect(criada.status).toBe(201);

    const lista = await request(app).get("/api/v1/sessions").query({ de: "2027-02-01", ate: "2027-02-28" });
    expect(lista.body).toHaveLength(1);
    expect(lista.body[0].skill_nome).toMatch(/TypeScript/);
  });

  it("exige skill_id ou course_id e minutos válidos", async () => {
    expect((await request(app).post("/api/v1/sessions").send({ minutos: 30 })).status).toBe(400);
    expect((await request(app).post("/api/v1/sessions").send({ skill_id: 1, minutos: 0 })).status).toBe(400);
    expect((await request(app).post("/api/v1/sessions").send({ skill_id: 999, minutos: 30 })).status).toBe(404);
  });

  it("rejeita JSON malformado", async () => {
    const res = await request(app).post("/api/v1/sessions")
      .set("Content-Type", "application/json").send("{ruim");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/proximo", () => {
  it("usa o mês do plano e só sugere o que já começou", async () => {
    const res = await request(app).get("/api/v1/proximo");
    expect(res.status).toBe(200);
    expect(res.body.mes_do_plano).toBe(4);
    expect(res.body.habilidades).toHaveLength(3);
    for (const s of res.body.habilidades) {
      expect(s.mes_inicio).toBeLessThanOrEqual(4);
      expect(s.motivos.length).toBeGreaterThan(0);
    }
  });

  it("prioriza habilidade atrasada e em andamento", async () => {
    // Git (id 8) termina no mês 2; no mês 4 está atrasado.
    await request(app).patch("/api/v1/skills/8").send({ status: "Em andamento" });
    const res = await request(app).get("/api/v1/proximo").query({ limite: 1 });
    expect(res.body.habilidades[0].id).toBe(8);
  });

  it("some da lista quando concluída", async () => {
    await request(app).patch("/api/v1/skills/8").send({ status: "Concluído" });
    const res = await request(app).get("/api/v1/proximo").query({ limite: 20 });
    expect(res.body.habilidades.find((s) => s.id === 8)).toBeUndefined();
  });

  it("inclui o Curso.dev nos cursos do mês", async () => {
    const res = await request(app).get("/api/v1/proximo");
    expect(res.body.cursos_do_mes.map((c) => c.nome)).toContain("Curso.dev");
  });
});

describe("GET /api/v1/progresso", () => {
  it("soma minutos dos últimos 7 dias", async () => {
    await request(app).post("/api/v1/sessions").send({ skill_id: 3, minutos: 60, data: "2027-02-14" });
    await request(app).post("/api/v1/sessions").send({ skill_id: 3, minutos: 30, data: "2027-01-01" });
    const res = await request(app).get("/api/v1/progresso");
    expect(res.body.minutos_ultimos_7_dias).toBe(60);
    expect(res.body.por_nivel.map((n) => n.nivel)).toEqual(["Júnior", "Pleno", "Sênior"]);
  });
});

describe("regras de prioridade (unidade)", () => {
  it("calcula o mês do plano", () => {
    expect(mesDoPlano("2026-11-01", new Date("2026-10-23"))).toBe(1);
    expect(mesDoPlano("2026-11-01", new Date("2026-11-20"))).toBe(1);
    expect(mesDoPlano("2026-11-01", new Date("2027-11-02"))).toBe(13);
  });

  it("ignora habilidades futuras e meta atingida", () => {
    const base = { nivel: "Júnior", meta: 4, hoje: 2, status: "Não iniciado", mes_inicio: 1, mes_fim: 6 };
    expect(pontuarSkill({ ...base, mes_inicio: 10 }, 4)).toBeNull();
    expect(pontuarSkill({ ...base, hoje: 4 }, 4)).toBeNull();
    expect(pontuarSkill(base, 4).pontos).toBeGreaterThan(0);
  });
});
