import { it, expect } from "vitest";
import { criarBancoLoja, lerSql, consultar } from "../_loja/banco.js";

it("clientes com mais de R$ 250,00 em pedidos não cancelados", () => {
  const linhas = consultar(criarBancoLoja(), lerSql(new URL("./solucao.sql", import.meta.url)));
  expect(linhas).toEqual([
    { nome: "Carla", total_centavos: 101380 },
    { nome: "Bruno", total_centavos: 59400 },
  ]);
});
