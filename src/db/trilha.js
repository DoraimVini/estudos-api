import { readFileSync } from "node:fs";

/** Conteúdo da trilha (fonte única: src/db/trilha.json). */
export const TRILHA = JSON.parse(
  readFileSync(new URL("./trilha.json", import.meta.url), "utf8"),
);

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Todo módulo e tópico precisa de um slug válido e único (é por ele que o progresso é encontrado). */
function validarSlugs(trilha) {
  const vistos = new Set();
  const conferir = (slug, onde) => {
    if (!SLUG.test(slug ?? "")) throw new Error(`${onde}: slug "${slug}" inválido (use letras minúsculas, números e hífens).`);
    if (vistos.has(slug)) throw new Error(`${onde}: slug "${slug}" repetido.`);
    vistos.add(slug);
  };
  for (const m of trilha.modulos) conferir(m.slug, `Módulo ${m.id}`);
  vistos.clear(); // módulos e tópicos são conjuntos separados
  for (const m of trilha.modulos) m.topicos.forEach((t, i) => conferir(t.slug, `Tópico ${m.id}.${i + 1}`));
}

/**
 * Deixa as tabelas da trilha iguais ao trilha.json, sem perder o progresso.
 * - Módulos: identificados pelo id (número do módulo). Não guardam progresso.
 * - Tópicos: identificados pelo slug. Mudar a ordem, o nome ou até o módulo de um tópico
 *   não mexe no status, no concluido_em nem nas sessões e exercícios ligados a ele.
 * - Recursos: não têm progresso, então são recriados.
 * O que saiu do JSON é apagado do banco.
 */
export function sincronizarTrilha(db, trilha = TRILHA) {
  validarSlugs(trilha);
  const skillPorNome = new Map(
    db.prepare("SELECT id, nome FROM skills").all().map((s) => [s.nome, s.id]),
  );

  const upsertModulo = db.prepare(`
    INSERT INTO modulos (id, slug, nome, fase, mes_inicio, mes_fim, objetivo, mini_projeto, pronto_quando, skill_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      slug = excluded.slug, nome = excluded.nome, fase = excluded.fase, mes_inicio = excluded.mes_inicio,
      mes_fim = excluded.mes_fim, objetivo = excluded.objetivo, mini_projeto = excluded.mini_projeto,
      pronto_quando = excluded.pronto_quando, skill_id = excluded.skill_id`);
  const topicoPorSlug = db.prepare("SELECT id FROM topicos WHERE slug = ?");
  // Bancos criados antes da migração 006: o tópico ainda não tem slug, então casa pela posição.
  // Só acontece uma vez: depois disso todo tópico do banco tem slug.
  const topicoSemSlug = db.prepare("SELECT id FROM topicos WHERE slug IS NULL AND modulo_id = ? AND ordem = ?");
  const atualizarTopico = db.prepare(
    "UPDATE topicos SET slug = ?, modulo_id = ?, ordem = ?, nome = ?, descricao = ? WHERE id = ?",
  );
  const inserirTopico = db.prepare(
    "INSERT INTO topicos (slug, modulo_id, ordem, nome, descricao) VALUES (?, ?, ?, ?, ?)",
  );
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
      upsertModulo.run(m.id, m.slug, m.nome, m.fase, m.mes_inicio, m.mes_fim, m.objetivo,
        m.mini_projeto ?? null, m.pronto_quando ?? null, skillId ?? null);

      apagarRecursos.run(m.id);
      m.recursos.forEach((r, i) => inserirRecurso.run(m.id, i + 1, r.titulo, r.url, r.tipo));
    }

    // 1. Descobre qual linha do banco é cada tópico do JSON, antes de mexer em qualquer uma.
    const topicos = trilha.modulos.flatMap((m) => m.topicos.map((t, i) => ({
      ...t,
      modulo_id: m.id,
      ordem: i + 1,
      id: (topicoPorSlug.get(t.slug) ?? topicoSemSlug.get(m.id, i + 1))?.id,
    })));

    // 2. Apaga os que saíram do JSON (sessões e exercícios ligados a eles ficam com topico_id NULL).
    const manter = topicos.filter((t) => t.id !== undefined).map((t) => t.id);
    db.prepare(`DELETE FROM topicos WHERE id NOT IN (${manter.map(() => "?").join(", ")})`).run(...manter);

    // 3. Ordem provisória negativa: se dois tópicos trocam de lugar, o UNIQUE (modulo_id, ordem)
    //    não pode ver os dois na mesma posição no meio da troca.
    db.exec("UPDATE topicos SET ordem = -id");

    // 4. Grava posição e texto; status e concluido_em não são tocados.
    for (const t of topicos) {
      if (t.id === undefined) inserirTopico.run(t.slug, t.modulo_id, t.ordem, t.nome, t.descricao ?? null);
      else atualizarTopico.run(t.slug, t.modulo_id, t.ordem, t.nome, t.descricao ?? null, t.id);
    }

    const ids = trilha.modulos.map((m) => m.id);
    db.prepare(`DELETE FROM modulos WHERE id NOT IN (${ids.map(() => "?").join(", ")})`).run(...ids);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
