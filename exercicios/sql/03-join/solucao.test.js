import { it, expect } from "vitest";
import { criarBancoLoja, lerSql, consultar } from "../_loja/banco.js";

it("pedidos entregues com o nome do cliente, por data", () => {
  const linhas = consultar(criarBancoLoja(), lerSql(new URL("./solucao.sql", import.meta.url)));
  expect(linhas).toEqual([
    { pedido: 1, data: "2026-09-02", cliente: "Ana" },
    { pedido: 2, data: "2026-09-05", cliente: "Bruno" },
    { pedido: 3, data: "2026-09-20", cliente: "Ana" },
    { pedido: 6, data: "2026-10-10", cliente: "Bruno" },
    { pedido: 7, data: "2026-10-15", cliente: "Carla" },
  ]);
});
