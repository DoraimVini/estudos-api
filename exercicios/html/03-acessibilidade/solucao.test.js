import { describe, it, expect } from "vitest";
import { lerPagina, rotuloDe, texto } from "../_html.js";

const pagina = lerPagina(new URL("./solucao.html", import.meta.url));
const imagem = (arquivo) => pagina.querySelectorAll("img").find((i) => i.getAttribute("src") === arquivo);
const TEXTOS_GENERICOS = ["clique aqui", "aqui", "clique", "saiba mais", "leia mais", "link", "veja", "acesse"];

/** Regras do <style>: [{ seletor, corpo }]. Só para conferir o outline; não é um leitor de CSS completo. */
const regras = pagina.querySelectorAll("style").flatMap((s) => s.text.replace(/\/\*[\s\S]*?\*\//g, "").split("}")
  .map((r) => r.split("{"))
  .filter((partes) => partes.length === 2)
  .map(([seletor, corpo]) => ({ seletor: seletor.trim(), corpo })));

describe("html/03 · os 7 problemas de acessibilidade", () => {
  it("1. o gráfico tem um texto alternativo que diz o que ele mostra", () => {
    const alt = imagem("grafico-horas.png")?.getAttribute("alt") ?? "";
    expect(alt.length, `alt do gráfico: "${alt}" (curto demais para descrever um gráfico)`).toBeGreaterThanOrEqual(15);
    expect(alt.toLowerCase(), "o alt não pode ser o nome do arquivo").not.toContain(".png");
  });

  it("2. o divisor é decorativo: alt vazio, para o leitor de tela pular", () => {
    const divisor = imagem("divisor.svg");
    expect(divisor?.hasAttribute("alt"), "sem alt nenhum, o leitor de tela lê o nome do arquivo").toBe(true);
    expect(divisor.getAttribute("alt"), "alt de imagem decorativa").toBe("");
  });

  it("3. o link da engrenagem diz para onde leva", () => {
    const link = pagina.querySelectorAll("a").find((a) => a.getAttribute("href") === "/configuracoes");
    const nome = `${texto(link)} ${link?.querySelector("img")?.getAttribute("alt") ?? ""}`.trim();
    expect(nome, "o link só tem uma imagem: o nome dele vem do alt").toMatch(/configura/i);
  });

  it('4. o link do relatório não é "clique aqui"', () => {
    const link = pagina.querySelectorAll("a").find((a) => a.getAttribute("href") === "/relatorio");
    const nome = texto(link).toLowerCase().replace(/[.!]$/, "");
    expect(nome.length, "texto do link do relatório").toBeGreaterThanOrEqual(10);
    expect(TEXTOS_GENERICOS, `"${nome}" não diz para onde o link leva`).not.toContain(nome);
  });

  it("5. buscar é um <button>, que funciona com teclado (div com onclick não funciona)", () => {
    const botao = pagina.querySelectorAll("button").find((b) => texto(b) === "Buscar");
    expect(botao, 'um <button> com o texto "Buscar"').toBeTruthy();
    const clicaveisErrados = pagina.querySelectorAll("[onclick]").filter((e) => e.tagName !== "BUTTON");
    expect(clicaveisErrados.map((e) => e.tagName.toLowerCase()), "elementos que não são <button> com onclick").toEqual([]);
  });

  it("6. o campo de busca tem um <label> (placeholder não é rótulo)", () => {
    const busca = pagina.querySelector("#busca");
    expect(busca, "o campo #busca").toBeTruthy();
    expect(rotuloDe(pagina, busca), "label do campo de busca").toBeTruthy();
  });

  it("7. o foco continua visível para quem usa teclado", () => {
    // Tirar o outline sem pôr outro indicador deixa quem navega com Tab sem saber onde está.
    const someComOFoco = regras.filter(({ seletor, corpo }) =>
      /:focus(?!-visible)/.test(seletor) && !/:not\(:focus-visible\)/.test(seletor)
      && /outline\s*:\s*(none|0)\b/.test(corpo));
    expect(someComOFoco.map((r) => r.seletor), "regras que escondem o foco").toEqual([]);
  });
});
