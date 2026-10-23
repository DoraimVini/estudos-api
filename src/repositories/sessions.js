/** Acesso à tabela sessions (sessões de estudo). */
export function sessionsRepository(db) {
  return {
    /** Sessões entre duas datas AAAA-MM-DD (inclusive), mais recentes primeiro. */
    listar({ de = "0000-01-01", ate = "9999-12-31" } = {}) {
      return db.prepare(`
        SELECT s.*, sk.nome AS skill_nome, c.nome AS course_nome,
               t.nome AS topico_nome, t.modulo_id
        FROM sessions s
        LEFT JOIN skills sk ON sk.id = s.skill_id
        LEFT JOIN courses c ON c.id = s.course_id
        LEFT JOIN topicos t ON t.id = s.topico_id
        WHERE s.data >= ? AND s.data <= ?
        ORDER BY s.data DESC, s.id DESC`).all(de, ate);
    },

    criar({ skill_id, course_id, topico_id, data, minutos, notas }) {
      const { lastInsertRowid } = db.prepare(`
        INSERT INTO sessions (skill_id, course_id, topico_id, data, minutos, notas)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run(skill_id, course_id, topico_id, data, minutos, notas);
      return db.prepare("SELECT * FROM sessions WHERE id = ?").get(lastInsertRowid);
    },

    /** @returns {boolean} true se apagou */
    apagar(id) {
      return db.prepare("DELETE FROM sessions WHERE id = ?").run(id).changes > 0;
    },

    minutosDesde(data) {
      return db.prepare(
        "SELECT COALESCE(SUM(minutos), 0) AS minutos FROM sessions WHERE data >= ?",
      ).get(data).minutos;
    },

    habilidadesMaisEstudadas(limite = 5) {
      return db.prepare(`
        SELECT sk.id, sk.nome, SUM(s.minutos) AS minutos
        FROM sessions s JOIN skills sk ON sk.id = s.skill_id
        GROUP BY sk.id ORDER BY minutos DESC LIMIT ?`).all(limite);
    },
  };
}
