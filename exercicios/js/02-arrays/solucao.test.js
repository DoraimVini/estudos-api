import { describe, it, expect } from "vitest";
import { totalDeMinutos, minutosPorTopico, topicosMaisEstudados, sessoesEntre } from "./solucao.js";

// Congela a lista e cada sessão: qualquer tentativa de mutar vira TypeError.
const congelar = (lista) => Object.freeze(lista.map((s) => Object.freeze({ ...s })));

const SESSOES = congelar([
  { data: "2026-11-03", minutos: 50, topico: "Closures" },
  { data: "2026-11-01", minutos: 25, topico: "Arrays" },
  { data: "2026-11-02", minutos: 40, topico: "Closures" },
  { data: "2026-11-05", minutos: 30, topico: "Promises" },
  { data: "2026-11-04", minutos: 25, topico: "Arrays" },
  { data: "2026-11-07", minutos: 50, topico: "Promises" },
]);

describe("totalDeMinutos", () => {
  it("soma os minutos", () => {
    expect(totalDeMinutos(SESSOES)).toBe(220);
  });

  it("lista vazia dá 0", () => {
    expect(totalDeMinutos([])).toBe(0);
  });
});

describe("minutosPorTopico", () => {
  it("agrupa os minutos por tópico", () => {
    expect(minutosPorTopico(SESSOES)).toEqual({ Closures: 90, Arrays: 50, Promises: 80 });
  });

  it("lista vazia dá objeto vazio", () => {
    expect(minutosPorTopico([])).toEqual({});
  });
});

describe("topicosMaisEstudados", () => {
  it("devolve os n maiores, do maior para o menor", () => {
    expect(topicosMaisEstudados(SESSOES, 2)).toEqual([
      { topico: "Closures", minutos: 90 },
      { topico: "Promises", minutos: 80 },
    ]);
  });

  it("n maior que a quantidade devolve todos", () => {
    expect(topicosMaisEstudados(SESSOES, 10)).toHaveLength(3);
  });

  it("empate é decidido pela ordem alfabética", () => {
    const empate = congelar([
      { data: "2026-11-01", minutos: 10, topico: "Grid" },
      { data: "2026-11-01", minutos: 10, topico: "Flexbox" },
      { data: "2026-11-01", minutos: 30, topico: "Arrays" },
    ]);
    expect(topicosMaisEstudados(empate, 3).map((t) => t.topico)).toEqual(["Arrays", "Flexbox", "Grid"]);
  });
});

describe("sessoesEntre", () => {
  it("filtra pelo período (inclusive) e ordena por data", () => {
    expect(sessoesEntre(SESSOES, "2026-11-02", "2026-11-05")).toEqual([
      { data: "2026-11-02", minutos: 40, topico: "Closures" },
      { data: "2026-11-03", minutos: 50, topico: "Closures" },
      { data: "2026-11-04", minutos: 25, topico: "Arrays" },
      { data: "2026-11-05", minutos: 30, topico: "Promises" },
    ]);
  });

  it("período sem sessões devolve lista vazia", () => {
    expect(sessoesEntre(SESSOES, "2026-12-01", "2026-12-31")).toEqual([]);
  });
});
