const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Confere se o slug é válido e ainda não apareceu em `vistos` (e o registra lá).
 * Slug é a identidade fixa de um item vindo de JSON: é por ele que o progresso é encontrado.
 */
export function conferirSlug(slug, onde, vistos) {
  if (!SLUG.test(slug ?? "")) throw new Error(`${onde}: slug "${slug}" inválido (use letras minúsculas, números e hífens).`);
  if (vistos.has(slug)) throw new Error(`${onde}: slug "${slug}" repetido.`);
  vistos.add(slug);
}
