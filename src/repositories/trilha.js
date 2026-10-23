/** Acesso a modulos, topicos e recursos. */
export function trilhaRepository(db) {
  const topicoPorId = db.prepare(`
    SELECT t.*, m.nome AS modulo_nome, m.skill_id
    FROM topicos t JOIN modulos m ON m.id = t.modulo_id
    WHERE t.id = ?`);

  // Contagem de tópicos por status, junto com cada módulo.
  const MODULOS_COM_CONTAGEM = `
    SELECT m.*, sk.nome AS skill_nome,
           COUNT(t.id) AS total_topicos,
           COALESCE(SUM(t.status = 'Concluído'), 0) AS concluidos,
           COALESCE(SUM(t.status = 'Em andamento'), 0) AS em_andamento
    FROM modulos m
    LEFT JOIN topicos t ON t.modulo_id = m.id
    LEFT JOIN skills sk ON sk.id = m.skill_id`;

  return {
    /** @param {{ fase?: number }} filtros */
    listarModulos({ fase } = {}) {
      const where = fase === undefined ? "" : "WHERE m.fase = ?";
      const params = fase === undefined ? [] : [fase];
      return db.prepare(`${MODULOS_COM_CONTAGEM} ${where} GROUP BY m.id ORDER BY m.id`).all(...params);
    },

    buscarModulo(id) {
      return db.prepare(`${MODULOS_COM_CONTAGEM} WHERE m.id = ? GROUP BY m.id`).get(id);
    },

    topicosDoModulo(moduloId) {
      return db.prepare("SELECT * FROM topicos WHERE modulo_id = ? ORDER BY ordem").all(moduloId);
    },

    recursosDoModulo(moduloId) {
      return db.prepare("SELECT * FROM recursos WHERE modulo_id = ? ORDER BY ordem").all(moduloId);
    },

    /** Todos os tópicos, agrupados por módulo: Map(modulo_id -> tópicos em ordem). */
    topicosPorModulo() {
      const mapa = new Map();
      for (const t of db.prepare("SELECT * FROM topicos ORDER BY modulo_id, ordem").all()) {
        if (!mapa.has(t.modulo_id)) mapa.set(t.modulo_id, []);
        mapa.get(t.modulo_id).push(t);
      }
      return mapa;
    },

    /** Tópico com o nome do módulo e a habilidade ligada a ele. */
    buscarTopico: (id) => topicoPorId.get(id),

    atualizarTopico(id, { status, concluido_em }) {
      db.prepare("UPDATE topicos SET status = ?, concluido_em = ? WHERE id = ?").run(status, concluido_em, id);
      return topicoPorId.get(id);
    },

    resumo() {
      return db.prepare(`
        SELECT COUNT(*) AS total_topicos,
               COALESCE(SUM(status = 'Concluído'), 0) AS concluidos,
               COALESCE(SUM(status = 'Em andamento'), 0) AS em_andamento
        FROM topicos`).get();
    },
  };
}
