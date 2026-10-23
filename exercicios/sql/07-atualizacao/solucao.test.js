import { it, expect, beforeEach } from "vitest";
import { criarBancoLoja, lerSql, consultar } from "../_loja/banco.js";

let db;
let antes;

beforeEach(() => {
  db = criarBancoLoja();
  antes = {
    outros: consultar(db, "SELECT * FROM produtos WHERE categoria <> 'Eletrônicos' ORDER BY id"),
    itens: consultar(db, "SELECT * FROM itens_pedido ORDER BY pedido_id, produto_id"),
  };
  db.exec(lerSql(new URL("./solucao.sql", import.meta.url)));
});

it("Eletrônicos ficam 10% mais caros", () => {
  expect(consultar(db, "SELECT id, preco_centavos FROM produtos WHERE categoria = 'Eletrônicos' ORDER BY id"))
    .toEqual([
      { id: 5, preco_centavos: 38500 },
      { id: 6, preco_centavos: 13200 },
      { id: 7, preco_centavos: 98890 },
    ]);
});

it("os preços continuam inteiros (sem ponto flutuante no banco)", () => {
  const tipos = consultar(db, "SELECT DISTINCT typeof(preco_centavos) AS tipo FROM produtos");
  expect(tipos).toEqual([{ tipo: "integer" }]);
});

it("as outras categorias não mudam", () => {
  expect(consultar(db, "SELECT * FROM produtos WHERE categoria <> 'Eletrônicos' ORDER BY id")).toEqual(antes.outros);
});

it("o preço dos pedidos antigos não muda", () => {
  expect(consultar(db, "SELECT * FROM itens_pedido ORDER BY pedido_id, produto_id")).toEqual(antes.itens);
});
