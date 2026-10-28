// Ferramentas dos exercícios de HTML: lê o solucao.html como árvore (sem navegador) para conferir a estrutura.
// O que depende de desenhar a página (layout, contraste, nota do Lighthouse) fica com o DevTools.
import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";

/** Lê o HTML do exercício. `url` é new URL("./solucao.html", import.meta.url). */
export const lerPagina = (url) => parse(readFileSync(url, "utf8"));

/** Texto visível de um elemento, com os espaços normalizados. */
export const texto = (elemento) => (elemento ? elemento.text.replace(/\s+/g, " ").trim() : "");

/**
 * Texto do <label> ligado ao campo, ou null se não houver.
 * Vale o label com for="id do campo" e o label que envolve o campo.
 */
export function rotuloDe(raiz, campo) {
  const id = campo.getAttribute("id");
  const porFor = id ? raiz.querySelectorAll("label").find((l) => l.getAttribute("for") === id) : undefined;
  if (porFor) return texto(porFor) || null;
  for (let pai = campo.parentNode; pai; pai = pai.parentNode) {
    if (pai.tagName === "LABEL") return texto(pai) || null;
  }
  return null;
}

/** Níveis dos títulos na ordem da página: <h1><h2><h3><h2> -> [1, 2, 3, 2]. */
export const niveisDosTitulos = (raiz) =>
  raiz.querySelectorAll("h1, h2, h3, h4, h5, h6").map((h) => Number(h.tagName[1]));
