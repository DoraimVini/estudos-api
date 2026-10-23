/** Acesso à tabela exercicios. */
export function exerciciosRepository(db) {
  const SELECT_COM_NOMES = `
    SELECT e.*, m.nome AS modulo_nome, t.nome AS topico_nome
    FROM exercicios e
    JOIN modulos m ON m.id = e.modulo_id
    LEFT JOIN topicos t ON t.id = e.topico_id`;
  const porSlug = db.prepare(`${SELECT_COM_NOMES} WHERE e.slug = ?`);

  return {
    /** @param {{ modulo?: number, status?: string }} filtros */
    listar({ modulo, status } = {}) {
      const filtros = [];
      const params = [];
      if (modulo !== undefined) { filtros.push("e.modulo_id = ?"); params.push(modulo); }
      if (status) { filtros.push("e.status = ?"); params.push(status); }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      return db.prepare(`${SELECT_COM_NOMES} ${where} ORDER BY e.ordem`).all(...params);
    },

    buscar: (id) => db.prepare(`${SELECT_COM_NOMES} WHERE e.id = ?`).get(id),

    buscarPorSlug: (slug) => porSlug.get(slug),

    /**
     * Registra uma tentativa vinda de npm run exercicio.
     * Passou: vira 'Resolvido' (a data da primeira vez fica). Falhou: só soma a tentativa.
     * @param {string} hoje data AAAA-MM-DD
     */
    registrarTentativa(slug, passou, hoje) {
      db.prepare(`
        UPDATE exercicios SET
          tentativas = tentativas + 1,
          status = CASE WHEN ? THEN 'Resolvido' ELSE status END,
          resolvido_em = CASE WHEN ? AND resolvido_em IS NULL THEN ? ELSE resolvido_em END
        WHERE slug = ?`).run(passou ? 1 : 0, passou ? 1 : 0, hoje, slug);
      return porSlug.get(slug);
    },

    resumo() {
      return db.prepare(`
        SELECT COUNT(*) AS total, COALESCE(SUM(status = 'Resolvido'), 0) AS resolvidos
        FROM exercicios`).get();
    },
  };
}
