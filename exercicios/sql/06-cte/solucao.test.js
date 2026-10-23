import { it, expect } from "vitest";
import { criarBancoLoja, lerSql, consultar } from "../_loja/banco.js";

it("produtos acima da média da própria categoria", () => {
  const linhas = consultar(criarBancoLoja(), lerSql(new URL("./solucao.sql", import.meta.url)));
  expect(linhas).toEqual([
    { nome: "Mochila para notebook", categoria: "Acessórios", preco_centavos: 18000 },
    { nome: 'Monitor 24"', categoria: "Eletrônicos", preco_centavos: 89900 },
    { nome: "Clean Code", categoria: "Livros", preco_centavos: 8990 },
    { nome: "O Programador Pragmático", categoria: "Livros", preco_centavos: 7900 },
  ]);
});
