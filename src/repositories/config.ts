import type { DatabaseSync } from "node:sqlite";
import { linhaUnica, umaLinha } from "../db/sql.ts";

/** Configurações gerais e informações do banco. */
export function configRepository(db: DatabaseSync) {
  return {
    /** Data de início do plano (AAAA-MM-DD), vinda do trilha.json. */
    planoInicio: (): string | undefined =>
      umaLinha<{ valor: string }>(db, "SELECT valor FROM config WHERE chave = 'plano_inicio'")?.valor,

    versaoBanco: () => ({
      sqlite: linhaUnica<{ v: string }>(db, "SELECT sqlite_version() AS v").v,
      schema: linhaUnica<{ user_version: number }>(db, "PRAGMA user_version").user_version,
    }),
  };
}
