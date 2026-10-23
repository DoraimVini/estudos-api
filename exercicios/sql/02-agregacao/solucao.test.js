import { it, expect } from "vitest";
import { criarBancoLoja, lerSql, consultar } from "../_loja/banco.js";

it("quantidade e preço médio por categoria", () => {
  const linhas = consultar(criarBancoLoja(), lerSql(new URL("./solucao.sql", import.meta.url)));
  expect(linhas).toEqual([
    { categoria: "Acessórios", produtos: 3, preco_medio: 7667 },
    { categoria: "Eletrônicos", produtos: 3, preco_medio: 45633 },
    { categoria: "Livros", produtos: 4, preco_medio: 6345 },
  ]);
});
