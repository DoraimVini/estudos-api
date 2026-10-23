import { it, expect } from "vitest";
import { criarBancoLoja, lerSql, consultar } from "../_loja/banco.js";

it("livros abaixo de R$ 80,00, do mais caro para o mais barato", () => {
  const linhas = consultar(criarBancoLoja(), lerSql(new URL("./solucao.sql", import.meta.url)));
  expect(linhas).toEqual([
    { nome: "O Programador Pragmático", preco_centavos: 7900 },
    { nome: "Entendendo Algoritmos", preco_centavos: 4500 },
    { nome: "Pense em Python", preco_centavos: 3990 },
  ]);
});
