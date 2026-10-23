import { readdirSync, readFileSync, existsSync } from "node:fs";

// Conteúdo de estudo de cada tópico: conteudo/<módulo>-<nome>/<ordem>-<nome>.md
// Ex.: conteudo/02-javascript/02-escopo-e-closures.md = módulo 2, tópico de ordem 2.
const PASTA = new URL("../../conteudo/", import.meta.url);

const numero = (nome) => Number(nome.split("-")[0]);

function pastaDoModulo(moduloId) {
  if (!existsSync(PASTA)) return null;
  const pasta = readdirSync(PASTA, { withFileTypes: true })
    .find((d) => d.isDirectory() && numero(d.name) === moduloId);
  return pasta ? new URL(`${pasta.name}/`, PASTA) : null;
}

/** Ordens dos tópicos do módulo que já têm conteúdo escrito. */
export function ordensComConteudo(moduloId) {
  const pasta = pastaDoModulo(moduloId);
  if (!pasta) return new Set();
  return new Set(readdirSync(pasta).filter((n) => n.endsWith(".md")).map(numero));
}

/** Markdown do tópico, ou null se ainda não foi escrito. */
export function lerConteudo(moduloId, ordem) {
  const pasta = pastaDoModulo(moduloId);
  if (!pasta) return null;
  const arquivo = readdirSync(pasta).find((n) => n.endsWith(".md") && numero(n) === ordem);
  return arquivo ? readFileSync(new URL(arquivo, pasta), "utf8") : null;
}

/** Todos os arquivos de conteúdo: [{ modulo, ordem, caminho }] (usado por testes e pelo verificador de links). */
export function listarConteudos() {
  if (!existsSync(PASTA)) return [];
  return readdirSync(PASTA, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => readdirSync(new URL(`${d.name}/`, PASTA))
      .filter((n) => n.endsWith(".md"))
      .map((n) => ({ modulo: numero(d.name), ordem: numero(n), caminho: new URL(`${d.name}/${n}`, PASTA) })));
}
