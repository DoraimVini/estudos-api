import { describe, it, expect } from "vitest";
import { lerPagina, niveisDosTitulos, texto } from "../_html.js";

const pagina = lerPagina(new URL("./solucao.html", import.meta.url));
const um = (seletor) => pagina.querySelectorAll(seletor);

describe("html/01 · da sopa de div ao HTML semântico", () => {
  it("o <html> diz o idioma da página", () => {
    expect(pagina.querySelector("html")?.getAttribute("lang")?.toLowerCase(), 'lang do <html>').toBe("pt-br");
  });

  it("um <header> com o nome e um <nav> com os três links", () => {
    expect(um("header").length, "quantidade de <header>").toBe(1);
    expect(texto(pagina.querySelector("header")), "o nome do site no cabeçalho").toContain("Vini");
    const links = um("header nav a").map((a) => a.getAttribute("href"));
    expect(links, "links dentro do <nav>, no <header>").toEqual(["#projetos", "#sobre", "#contato"]);
  });

  it("um único <main>, com o único <h1> da página", () => {
    expect(um("main").length, "quantidade de <main>").toBe(1);
    expect(um("h1").length, "quantidade de <h1>").toBe(1);
    expect(texto(pagina.querySelector("main h1"))).toBe("Dev full stack em formação");
  });

  it("Projetos e Sobre são <section>, cada uma com o seu <h2>", () => {
    for (const [id, titulo] of [["projetos", "Projetos"], ["sobre", "Sobre"]]) {
      const secao = pagina.querySelector(`#${id}`);
      expect(secao?.tagName, `#${id} deveria ser <section>`).toBe("SECTION");
      expect(texto(secao.querySelector("h2")), `<h2> de #${id}`).toBe(titulo);
    }
  });

  it("cada projeto é um <article> com o título em <h3>", () => {
    const projetos = um("#projetos article").map((a) => texto(a.querySelector("h3")));
    expect(projetos).toEqual(["estudos-api", "clone-tabnews"]);
  });

  it("o contato está num <footer> (e o link #contato continua chegando nele)", () => {
    const rodape = pagina.querySelector("footer");
    expect(texto(rodape), "contato no <footer>").toContain("vini@exemplo.invalid");
    const alvo = pagina.querySelector("#contato");
    expect(alvo === rodape || rodape?.querySelector("#contato") !== null, "o id contato tem que estar no <footer>").toBe(true);
  });

  it("os títulos não pulam nível (h1 → h2 → h3, sem h1 → h3)", () => {
    const niveis = niveisDosTitulos(pagina);
    const pulos = niveis.filter((nivel, i) => i > 0 && nivel > niveis[i - 1] + 1);
    expect(niveis[0], "o primeiro título é o <h1>").toBe(1);
    expect(pulos, `ordem dos títulos: ${niveis.join(" → ")}`).toEqual([]);
  });

  it("nenhum texto da página se perdeu", () => {
    const tudo = texto(pagina.querySelector("body"));
    for (const trecho of ["API que diz o que estudar agora.", "Projeto do Curso.dev.", "Game dev migrando para a web, no Rio de Janeiro."]) {
      expect(tudo).toContain(trecho);
    }
  });
});
