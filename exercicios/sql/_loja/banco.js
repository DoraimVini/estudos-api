// Apoio dos testes de SQL: cria o banco da loja em memória e roda o seu arquivo .sql.
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

/** Banco novo, em memória, com o schema e os dados de loja.sql. */
export function criarBancoLoja() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(readFileSync(new URL("./loja.sql", import.meta.url), "utf8"));
  return db;
}

/** Lê o seu SQL. Falha com mensagem clara se o arquivo ainda só tiver comentários. */
export function lerSql(urlDoArquivo) {
  const sql = readFileSync(urlDoArquivo, "utf8");
  const semComentarios = sql.replace(/--.*$/gm, "").trim();
  if (!semComentarios) throw new Error("Escreva seu SQL no arquivo antes de rodar os testes.");
  return sql;
}

/** Roda uma consulta (SELECT) e devolve as linhas como objetos simples. */
export function consultar(db, sql) {
  return db.prepare(sql).all().map((linha) => ({ ...linha }));
}
