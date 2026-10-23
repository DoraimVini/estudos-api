import { describe, it, expect } from "vitest";
import { mesclarProfundo, selecionar, semCampos } from "./solucao.js";

// Congela o objeto e tudo dentro dele.
function congelarTudo(valor) {
  if (typeof valor === "object" && valor !== null) {
    Object.values(valor).forEach(congelarTudo);
    Object.freeze(valor);
  }
  return valor;
}

const perfil = () => congelarTudo({
  nome: "Vini",
  preferencias: { tema: "escuro", idioma: "pt", pomodoro: { foco: 25, pausa: 5 } },
  tags: ["js", "node"],
});

describe("mesclarProfundo", () => {
  it("mescla objetos aninhados e mantém o resto", () => {
    const resultado = mesclarProfundo(perfil(), congelarTudo({
      preferencias: { tema: "claro", pomodoro: { foco: 50 } },
    }));
    expect(resultado).toEqual({
      nome: "Vini",
      preferencias: { tema: "claro", idioma: "pt", pomodoro: { foco: 50, pausa: 5 } },
      tags: ["js", "node"],
    });
  });

  it("arrays e valores simples são substituídos, não mesclados", () => {
    const resultado = mesclarProfundo(perfil(), congelarTudo({ tags: ["sql"], nome: "Vinicius" }));
    expect(resultado.tags).toEqual(["sql"]);
    expect(resultado.nome).toBe("Vinicius");
  });

  it("null em extra substitui o objeto", () => {
    expect(mesclarProfundo(perfil(), { preferencias: null }).preferencias).toBeNull();
  });

  it("chaves novas são adicionadas", () => {
    expect(mesclarProfundo({ a: 1 }, { b: { c: 2 } })).toEqual({ a: 1, b: { c: 2 } });
  });

  it("objetos aninhados do resultado são novos", () => {
    const base = perfil();
    const resultado = mesclarProfundo(base, { nome: "Outro" });
    expect(resultado).not.toBe(base);
    expect(resultado.preferencias).not.toBe(base.preferencias);
    expect(resultado.preferencias.pomodoro).not.toBe(base.preferencias.pomodoro);
    resultado.preferencias.pomodoro.foco = 99; // o resultado não está congelado...
    expect(base.preferencias.pomodoro.foco).toBe(25); // ...e o original não muda
  });
});

describe("selecionar", () => {
  it("fica só com as chaves pedidas que existem", () => {
    expect(selecionar(perfil(), ["nome", "tags", "inexistente"])).toEqual({ nome: "Vini", tags: ["js", "node"] });
  });

  it("sem chaves devolve objeto vazio", () => {
    expect(selecionar(perfil(), [])).toEqual({});
  });
});

describe("semCampos", () => {
  it("remove as chaves pedidas", () => {
    expect(semCampos({ id: 1, senha: "x", nome: "Vini" }, ["senha"])).toEqual({ id: 1, nome: "Vini" });
  });

  it("chave inexistente é ignorada", () => {
    expect(semCampos(congelarTudo({ a: 1 }), ["b"])).toEqual({ a: 1 });
  });
});
