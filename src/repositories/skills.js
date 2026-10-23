/** Acesso à tabela skills. Único lugar que escreve SQL sobre habilidades. */
export function skillsRepository(db) {
  const porId = db.prepare("SELECT * FROM skills WHERE id = ?");

  return {
    /** @param {{ nivel?: string, status?: string, area?: string }} filtros */
    listar({ nivel, status, area } = {}) {
      const filtros = [];
      const params = [];
      if (nivel) { filtros.push("nivel = ?"); params.push(nivel); }
      if (status) { filtros.push("status = ?"); params.push(status); }
      if (area) { filtros.push("area = ?"); params.push(area); }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      return db.prepare(`SELECT * FROM skills ${where} ORDER BY id`).all(...params);
    },

    buscar: (id) => porId.get(id),

    existe: (id) => Boolean(porId.get(id)),

    /** Atualiza só os campos enviados. Retorna a habilidade atualizada ou undefined se não existir. */
    atualizar(id, campos) {
      const atual = porId.get(id);
      if (!atual) return undefined;
      const novo = { ...atual, ...campos };
      db.prepare("UPDATE skills SET hoje = ?, meta = ?, status = ? WHERE id = ?")
        .run(novo.hoje, novo.meta, novo.status, id);
      return porId.get(id);
    },

    resumoPorNivel(nivel) {
      const r = db.prepare(`
        SELECT COUNT(*) AS total,
               SUM(status = 'Concluído') AS concluidas,
               ROUND(AVG(hoje), 1) AS media_hoje,
               ROUND(AVG(meta), 1) AS media_meta
        FROM skills WHERE nivel = ?`).get(nivel);
      return { ...r, concluidas: r.concluidas ?? 0 };
    },
  };
}
