import { readFileSync } from "node:fs";

/** Conteúdo da trilha (fonte única: src/db/trilha.json). */
export const TRILHA = JSON.parse(
  readFileSync(new URL("./trilha.json", import.meta.url), "utf8"),
);

/**
 * Deixa as tabelas da trilha iguais ao trilha.json, sem perder o progresso.
 * - Módulos: identificados pelo id (número do módulo).
 * - Tópicos: identificados por (módulo, ordem). Texto atualiza; status e concluido_em ficam.
 * - Recursos: não têm progresso, então são recriados.
 * O que saiu do JSON é apagado do banco.
 */
export function sincronizarTrilha(db, trilha = TRILHA) {
  const skillPorNome = new Map(
    db.prepare("SELECT id, nome FROM skills").all().map((s) => [s.nome, s.id]),
  );

  const upsertModulo = db.prepare(`
    INSERT INTO modulos (id, nome, fase, mes_inicio, mes_fim, objetivo, mini_projeto, pronto_quando, skill_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      nome = excluded.nome, fase = excluded.fase, mes_inicio = excluded.mes_inicio,
      mes_fim = excluded.mes_fim, objetivo = excluded.objetivo, mini_projeto = excluded.mini_projeto,
      pronto_quando = excluded.pronto_quando, skill_id = excluded.skill_id`);
  const upsertTopico = db.prepare(`
    INSERT INTO topicos (modulo_id, ordem, nome, descricao) VALUES (?, ?, ?, ?)
    ON CONFLICT (modulo_id, ordem) DO UPDATE SET nome = excluded.nome, descricao = excluded.descricao`);
  const apagarTopicosExtras = db.prepare("DELETE FROM topicos WHERE modulo_id = ? AND ordem > ?");
  const apagarRecursos = db.prepare("DELETE FROM recursos WHERE modulo_id = ?");
  const inserirRecurso = db.prepare(
    "INSERT INTO recursos (modulo_id, ordem, titulo, url, tipo) VALUES (?, ?, ?, ?, ?)",
  );

  db.exec("BEGIN");
  try {
    for (const m of trilha.modulos) {
      const skillId = skillPorNome.get(m.skill);
      if (m.skill && skillId === undefined) {
        throw new Error(`Módulo ${m.id}: habilidade "${m.skill}" não existe em skills.`);
      }
      upsertModulo.run(m.id, m.nome, m.fase, m.mes_inicio, m.mes_fim, m.objetivo,
        m.mini_projeto ?? null, m.pronto_quando ?? null, skillId ?? null);

      m.topicos.forEach((t, i) => upsertTopico.run(m.id, i + 1, t.nome, t.descricao ?? null));
      apagarTopicosExtras.run(m.id, m.topicos.length);

      apagarRecursos.run(m.id);
      m.recursos.forEach((r, i) => inserirRecurso.run(m.id, i + 1, r.titulo, r.url, r.tipo));
    }

    const ids = trilha.modulos.map((m) => m.id);
    db.prepare(`DELETE FROM modulos WHERE id NOT IN (${ids.map(() => "?").join(", ")})`).run(...ids);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
