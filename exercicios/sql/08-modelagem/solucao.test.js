import { describe, it, expect, beforeEach } from "vitest";
import { criarBancoLoja, lerSql } from "../_loja/banco.js";

let db;

beforeEach(() => {
  db = criarBancoLoja();
  db.exec(lerSql(new URL("./solucao.sql", import.meta.url)));
});

const avaliar = ({ cliente = 1, produto = 1, nota = 5, comentario = null, data = "2026-10-20" } = {}) =>
  db.prepare("INSERT INTO avaliacoes (cliente_id, produto_id, nota, comentario, data) VALUES (?, ?, ?, ?, ?)")
    .run(cliente, produto, nota, comentario, data);

const total = () => db.prepare("SELECT COUNT(*) AS n FROM avaliacoes").get().n;

describe("avaliacoes: dados válidos", () => {
  it("tem as colunas pedidas", () => {
    const colunas = db.prepare("PRAGMA table_info(avaliacoes)").all().map((c) => c.name);
    expect(colunas).toEqual(expect.arrayContaining(["id", "cliente_id", "produto_id", "nota", "comentario", "data"]));
  });

  it("aceita avaliação com e sem comentário", () => {
    avaliar({ comentario: "Mudou meu jeito de programar" });
    avaliar({ cliente: 2, nota: 1 });
    expect(total()).toBe(2);
  });
});

describe("avaliacoes: o banco recusa dados errados", () => {
  it.each([0, 6, null])("nota %s", (nota) => {
    expect(() => avaliar({ nota })).toThrow();
  });

  it("data ausente", () => {
    expect(() => avaliar({ data: null })).toThrow();
  });

  it("cliente ou produto inexistente", () => {
    expect(() => avaliar({ cliente: 999 })).toThrow();
    expect(() => avaliar({ produto: 999 })).toThrow();
  });

  it("o mesmo cliente avaliando o mesmo produto duas vezes", () => {
    avaliar();
    expect(() => avaliar({ nota: 3 })).toThrow();
    avaliar({ produto: 2 }); // outro produto pode
    expect(total()).toBe(2);
  });
});

describe("avaliacoes: ON DELETE", () => {
  it("apagar o produto apaga as avaliações dele", () => {
    db.exec("INSERT INTO produtos (id, nome, categoria, preco_centavos) VALUES (11, 'Produto teste', 'Teste', 100)");
    avaliar({ produto: 11 });
    avaliar({ produto: 1 });
    db.exec("DELETE FROM produtos WHERE id = 11");
    expect(db.prepare("SELECT produto_id FROM avaliacoes").all().map((a) => a.produto_id)).toEqual([1]);
  });
});
