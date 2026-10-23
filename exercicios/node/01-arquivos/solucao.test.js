import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { contarLinhas, lerJson, listarArquivos } from "./solucao.js";

const dados = (nome = "") => fileURLToPath(new URL(`./dados/${nome}`, import.meta.url));

describe("contarLinhas", () => {
  it("conta só as linhas com conteúdo", async () => {
    expect(await contarLinhas(dados("notas.txt"))).toBe(4);
  });
});

describe("lerJson", () => {
  it("devolve o objeto do arquivo", async () => {
    expect(await lerJson(dados("config.json"))).toEqual({ porta: 3000, fuso: "America/Sao_Paulo" });
  });

  it("arquivo inexistente tem mensagem clara", async () => {
    await expect(lerJson(dados("nao-existe.json"))).rejects.toThrow("Arquivo não encontrado: nao-existe.json");
  });

  it("JSON quebrado tem mensagem clara", async () => {
    await expect(lerJson(dados("quebrado.json"))).rejects.toThrow("JSON inválido em quebrado.json");
  });
});

describe("listarArquivos", () => {
  it("filtra pela extensão e ordena", async () => {
    expect(await listarArquivos(dados(), ".json")).toEqual(["config.json", "quebrado.json"]);
    expect(await listarArquivos(dados(), ".txt")).toEqual(["notas.txt"]);
  });

  it("extensão sem arquivos devolve lista vazia", async () => {
    expect(await listarArquivos(dados(), ".csv")).toEqual([]);
  });
});
