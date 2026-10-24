import { readdirSync, readFileSync, existsSync } from "node:fs";

// Conteúdo de estudo de cada tópico: conteudo/<slug do módulo>/<slug do tópico>.md
// Ex.: conteudo/javascript/escopo-e-closures.md. A ordem vem do trilha.json, não do nome do arquivo:
// assim, reordenar a trilha não obriga a renomear arquivos.
const PASTA = new URL("../../conteudo/", import.meta.url);

const semExtensao = (nome) => nome.slice(0, -".md".length);

/** Slugs dos tópicos do módulo que já têm conteúdo escrito. */
export function slugsComConteudo(moduloSlug) {
  const pasta = new URL(`${moduloSlug}/`, PASTA);
  if (!existsSync(pasta)) return new Set();
  return new Set(readdirSync(pasta).filter((n) => n.endsWith(".md")).map(semExtensao));
}

/** Markdown do tópico, ou null se ainda não foi escrito. */
export function lerConteudo(moduloSlug, topicoSlug) {
  try {
    return readFileSync(new URL(`${moduloSlug}/${topicoSlug}.md`, PASTA), "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

/** Todos os arquivos de conteúdo: [{ modulo, topico, caminho }] com os slugs (usado por testes e pelo verificador de links). */
export function listarConteudos() {
  if (!existsSync(PASTA)) return [];
  return readdirSync(PASTA, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => readdirSync(new URL(`${d.name}/`, PASTA))
      .filter((n) => n.endsWith(".md"))
      .map((n) => ({ modulo: d.name, topico: semExtensao(n), caminho: new URL(`${d.name}/${n}`, PASTA) })));
}
