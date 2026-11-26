import { readdirSync, readFileSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { linhaUnica } from "./sql.ts";

const PASTA = new URL("./migrations/", import.meta.url);

/** Lista as migrações em ordem: [{ versao: 1, nome: "001_inicial.sql" }, ...] */
export function listarMigracoes() {
  return readdirSync(PASTA)
    .filter((nome) => /^\d{3}_.+\.sql$/.test(nome))
    .sort()
    .map((nome) => ({ versao: Number(nome.slice(0, 3)), nome }));
}

/**
 * Aplica as migrações que o banco ainda não tem.
 * A versão atual fica no próprio arquivo do SQLite (PRAGMA user_version), começando em 0.
 * Cada migração roda numa transação: se falhar, o banco fica como estava.
 * @returns versões aplicadas nesta execução
 */
export function migrar(db: DatabaseSync): number[] {
  const { user_version: atual } = linhaUnica<{ user_version: number }>(db, "PRAGMA user_version");
  const aplicadas: number[] = [];

  for (const { versao, nome } of listarMigracoes()) {
    if (versao <= atual) continue;
    const sql = readFileSync(new URL(nome, PASTA), "utf8");
    db.exec("BEGIN");
    try {
      db.exec(sql);
      // PRAGMA não aceita parâmetro (?); versao é sempre um inteiro vindo do nome do arquivo.
      db.exec(`PRAGMA user_version = ${versao}`);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      const motivo = err instanceof Error ? err.message : String(err);
      throw new Error(`Falha na migração ${nome}: ${motivo}`, { cause: err });
    }
    aplicadas.push(versao);
  }
  return aplicadas;
}
