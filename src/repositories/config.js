/** Configurações gerais e informações do banco. */
export function configRepository(db) {
  return {
    /** Data de início do plano (AAAA-MM-DD), vinda do trilha.json. */
    planoInicio: () =>
      db.prepare("SELECT valor FROM config WHERE chave = 'plano_inicio'").get()?.valor,

    versaoBanco: () => ({
      sqlite: db.prepare("SELECT sqlite_version() AS v").get().v,
      schema: db.prepare("PRAGMA user_version").get().user_version,
    }),
  };
}
