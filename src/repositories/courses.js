/** Acesso à tabela courses. */
export function coursesRepository(db) {
  const porId = db.prepare("SELECT * FROM courses WHERE id = ?");

  return {
    /** @param {{ prioridade?: string, status?: string }} filtros */
    listar({ prioridade, status } = {}) {
      const filtros = [];
      const params = [];
      if (prioridade) { filtros.push("prioridade = ?"); params.push(prioridade); }
      if (status) { filtros.push("status = ?"); params.push(status); }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      return db.prepare(`SELECT * FROM courses ${where} ORDER BY mes_inicio, id`).all(...params);
    },

    buscar: (id) => porId.get(id),

    existe: (id) => Boolean(porId.get(id)),

    /** Atualiza só os campos enviados. Retorna o curso atualizado ou undefined se não existir. */
    atualizar(id, campos) {
      const atual = porId.get(id);
      if (!atual) return undefined;
      const novo = { ...atual, ...campos };
      db.prepare("UPDATE courses SET status = ?, prioridade = ? WHERE id = ?")
        .run(novo.status, novo.prioridade, id);
      return porId.get(id);
    },
  };
}
