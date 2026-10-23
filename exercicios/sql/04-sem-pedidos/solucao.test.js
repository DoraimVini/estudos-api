import { it, expect } from "vitest";
import { criarBancoLoja, lerSql, consultar } from "../_loja/banco.js";

it("clientes sem nenhum pedido, em ordem alfabética", () => {
  const linhas = consultar(criarBancoLoja(), lerSql(new URL("./solucao.sql", import.meta.url)));
  expect(linhas).toEqual([{ nome: "Elisa" }, { nome: "Fábio" }]);
});
