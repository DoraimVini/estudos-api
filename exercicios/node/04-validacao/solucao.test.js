import { describe, it, expect } from "vitest";
import { validarTarefa } from "./solucao.js";

/** Campos com erro, em ordem alfabética (a ordem dos erros é livre). */
const camposComErro = (resultado) => resultado.erros.map((e) => e.campo).sort();

describe("validarTarefa: casos válidos", () => {
  it("aceita só o título e aplica os padrões", () => {
    expect(validarTarefa({ titulo: "Estudar closures" })).toEqual({
      ok: true,
      valor: { titulo: "Estudar closures", prazo: null, prioridade: "media" },
    });
  });

  it("aceita todos os campos e tira espaços do título", () => {
    expect(validarTarefa({ titulo: "  Revisar SQL  ", prazo: "2027-02-28", prioridade: "alta" })).toEqual({
      ok: true,
      valor: { titulo: "Revisar SQL", prazo: "2027-02-28", prioridade: "alta" },
    });
  });
});

describe("validarTarefa: título", () => {
  it.each([
    ["ausente", {}],
    ["não é texto", { titulo: 42 }],
    ["curto demais", { titulo: "ab" }],
    ["só espaços", { titulo: "     " }],
    ["longo demais", { titulo: "x".repeat(101) }],
  ])("recusa título %s", (_, corpo) => {
    const r = validarTarefa(corpo);
    expect(r.ok).toBe(false);
    expect(camposComErro(r)).toEqual(["titulo"]);
  });

  it("aceita os limites: 3 e 100 caracteres", () => {
    expect(validarTarefa({ titulo: "abc" }).ok).toBe(true);
    expect(validarTarefa({ titulo: "x".repeat(100) }).ok).toBe(true);
  });
});

describe("validarTarefa: prazo e prioridade", () => {
  it.each(["2026-02-30", "2026-13-01", "01/11/2026", "amanhã", 20261101])("recusa prazo %s", (prazo) => {
    expect(camposComErro(validarTarefa({ titulo: "Válido", prazo }))).toEqual(["prazo"]);
  });

  it("aceita 29 de fevereiro em ano bissexto", () => {
    expect(validarTarefa({ titulo: "Válido", prazo: "2028-02-29" }).ok).toBe(true);
  });

  it("recusa prioridade fora da lista", () => {
    expect(camposComErro(validarTarefa({ titulo: "Válido", prioridade: "urgente" }))).toEqual(["prioridade"]);
  });
});

describe("validarTarefa: corpo e campos extras", () => {
  it.each([null, [], "texto", 10])("recusa corpo que não é objeto: %j", (corpo) => {
    expect(camposComErro(validarTarefa(corpo))).toEqual(["corpo"]);
  });

  it("recusa campos extras, um erro para cada", () => {
    expect(camposComErro(validarTarefa({ titulo: "Válido", id: 7, feita: true }))).toEqual(["feita", "id"]);
  });

  it("devolve todos os erros de uma vez, com mensagens", () => {
    const r = validarTarefa({ titulo: "x", prazo: "ontem", prioridade: "máxima", extra: 1 });
    expect(camposComErro(r)).toEqual(["extra", "prazo", "prioridade", "titulo"]);
    for (const erro of r.erros) {
      expect(typeof erro.mensagem).toBe("string");
      expect(erro.mensagem.length).toBeGreaterThan(0);
    }
  });
});
