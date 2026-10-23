// Confere se todos os links da trilha e do conteúdo continuam no ar.  Uso: npm run links
// Fica fora do npm test e do CI de propósito: depende da internet e de sites de terceiros.
import { readFileSync } from "node:fs";
import { TRILHA } from "../db/trilha.js";
import { listarConteudos } from "../db/conteudo.js";

const LINK_MARKDOWN = /\]\((https?:\/\/[^)\s]+)\)/g;
// Sites em que o #algo é lido pelo JavaScript da página (ex.: idioma do jogo), e não é uma seção do HTML.
const ANCORA_DE_APLICATIVO = ["flexboxfroggy.com", "cssgridgarden.com"];

function coletarLinks() {
  const links = new Map(); // url -> onde aparece
  const anotar = (url, onde) => links.set(url, [...(links.get(url) ?? []), onde]);
  for (const m of TRILHA.modulos) {
    for (const r of m.recursos) anotar(r.url, `trilha.json, módulo ${m.id}`);
  }
  for (const c of listarConteudos()) {
    for (const [, url] of readFileSync(c.caminho, "utf8").matchAll(LINK_MARKDOWN)) {
      anotar(url, `conteúdo ${c.modulo}.${c.ordem}`);
    }
  }
  return links;
}

/** Abre a página; se o link tem âncora (#secao), confere se ela existe no HTML. */
async function verificar(url) {
  try {
    const resposta = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: { "User-Agent": "estudos-api link checker" },
    });
    if (!resposta.ok) return `HTTP ${resposta.status}`;
    const { hash, hostname } = new URL(url);
    const ancora = hash.slice(1);
    if (ancora && !ANCORA_DE_APLICATIVO.includes(hostname)) {
      const html = await resposta.text();
      if (!html.includes(`id="${ancora}"`) && !html.includes(`name="${ancora}"`)) return `âncora #${ancora} não encontrada`;
    }
    return null;
  } catch (erro) {
    return erro.name === "TimeoutError" ? "tempo esgotado" : erro.message;
  }
}

const links = [...coletarLinks()];
console.log(`Verificando ${links.length} links...\n`);

const problemas = [];
const LOTE = 6; // poucas requisições ao mesmo tempo, para não sobrecarregar os sites
for (let i = 0; i < links.length; i += LOTE) {
  const lote = links.slice(i, i + LOTE);
  const resultados = await Promise.all(lote.map(([url]) => verificar(url)));
  lote.forEach(([url, onde], j) => {
    const erro = resultados[j];
    console.log(`${erro ? "❌" : "✅"} ${url}${erro ? `  (${erro})` : ""}`);
    if (erro) problemas.push({ url, erro, onde });
  });
}

if (problemas.length) {
  console.log(`\n${problemas.length} link(s) com problema:`);
  for (const p of problemas) console.log(`- ${p.url}\n  ${p.erro} · usado em: ${p.onde.join("; ")}`);
  process.exitCode = 1;
} else {
  console.log("\nTodos os links funcionam.");
}
