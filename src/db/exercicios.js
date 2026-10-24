import { readFileSync } from "node:fs";

const PASTA = new URL("../../exercicios/", import.meta.url);

/** Catálogo oficial dos exercícios (fonte única: exercicios/catalogo.json). */
export const CATALOGO = JSON.parse(readFileSync(new URL("catalogo.json", PASTA), "utf8")).exercicios;

/** URL da pasta de um exercício, ex.: pastaDoExercicio("sql/03-join"). */
export const pastaDoExercicio = (slug) => new URL(`${slug}/`, PASTA);

/** Enunciado (README.md) de um exercício, ou null se a pasta não existir. */
export function lerEnunciado(slug) {
  try {
    return readFileSync(new URL("README.md", pastaDoExercicio(slug)), "utf8");
  } catch {
    return null;
  }
}

/**
 * Deixa a tabela exercicios igual ao catálogo, sem perder status e tentativas.
 * Exercício é identificado pelo slug e aponta para o slug do tópico; o módulo vem do tópico.
 * Roda depois da trilha (precisa de modulos e topicos).
 */
export function sincronizarExercicios(db, catalogo = CATALOGO) {
  const topicoPorSlug = db.prepare("SELECT id, modulo_id FROM topicos WHERE slug = ?");
  const upsert = db.prepare(`
    INSERT INTO exercicios (slug, modulo_id, topico_id, ordem, titulo) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (slug) DO UPDATE SET
      modulo_id = excluded.modulo_id, topico_id = excluded.topico_id,
      ordem = excluded.ordem, titulo = excluded.titulo`);

  db.exec("BEGIN");
  try {
    catalogo.forEach((e, i) => {
      const topico = topicoPorSlug.get(e.topico);
      if (!topico) throw new Error(`Exercício ${e.slug}: tópico "${e.topico}" não existe na trilha.`);
      upsert.run(e.slug, topico.modulo_id, topico.id, i + 1, e.titulo);
    });
    const slugs = catalogo.map((e) => e.slug);
    db.prepare(`DELETE FROM exercicios WHERE slug NOT IN (${slugs.map(() => "?").join(", ")})`).run(...slugs);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
