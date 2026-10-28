import { describe, it, expect } from "vitest";
import { lerPagina, rotuloDe, texto } from "../_html.js";

const pagina = lerPagina(new URL("./solucao.html", import.meta.url));
const campo = (nome) => pagina.querySelector(`form [name="${nome}"]`);
const tem = (elemento, atributo) => elemento?.hasAttribute(atributo) ?? false;

/** O navegador testa o pattern como ^(?:pattern)$ com a flag v. */
function aceita(pattern, valor) {
  return new RegExp(`^(?:${pattern})$`, "v").test(valor);
}

describe("html/02 · formulário acessível com validação nativa", () => {
  it("todo campo tem um <label> ligado a ele (placeholder não serve)", () => {
    const campos = pagina.querySelectorAll("form input").filter((i) => !["hidden", "submit"].includes(i.getAttribute("type")));
    const semRotulo = campos
      .filter((i) => !rotuloDe(pagina, i))
      .map((i) => `${i.getAttribute("name")}${i.getAttribute("value") ? `=${i.getAttribute("value")}` : ""}`);
    expect(semRotulo, "campos sem <label>").toEqual([]);
  });

  it("nome é obrigatório", () => {
    expect(tem(campo("nome"), "required")).toBe(true);
  });

  it("e-mail usa o tipo certo e é obrigatório", () => {
    expect(campo("email")?.getAttribute("type")).toBe("email");
    expect(tem(campo("email"), "required")).toBe(true);
  });

  it("telefone usa o tipo certo (no celular, abre o teclado numérico)", () => {
    expect(campo("telefone")?.getAttribute("type")).toBe("tel");
  });

  it("CEP é obrigatório e o pattern aceita só 5 dígitos, hífen opcional e 3 dígitos", () => {
    const cep = campo("cep");
    expect(tem(cep, "required"), "CEP obrigatório").toBe(true);
    const pattern = cep?.getAttribute("pattern");
    expect(pattern, "CEP sem pattern").toBeTruthy();
    for (const valido of ["20000-000", "20000000"]) expect(aceita(pattern, valido), `deveria aceitar ${valido}`).toBe(true);
    for (const invalido of ["2000-000", "20000-0000", "abcde-fgh", "20000 000", ""]) {
      expect(aceita(pattern, invalido), `não deveria aceitar "${invalido}"`).toBe(false);
    }
  });

  it("o grupo de nível fica num <fieldset> com <legend>, e é obrigatório", () => {
    const radios = pagina.querySelectorAll('input[type="radio"][name="nivel"]');
    expect(radios.length).toBe(3);
    for (const radio of radios) {
      let fieldset = radio.parentNode;
      while (fieldset && fieldset.tagName !== "FIELDSET") fieldset = fieldset.parentNode;
      expect(fieldset, `o radio ${radio.getAttribute("value")} está fora de um <fieldset>`).toBeTruthy();
      expect(texto(fieldset.querySelector("legend")), "a <legend> do grupo").toMatch(/nível/i);
    }
    expect(radios.some((r) => tem(r, "required")), "nenhum radio do grupo é required").toBe(true);
  });

  it("aceitar os termos é obrigatório", () => {
    expect(tem(campo("termos"), "required")).toBe(true);
  });

  it("enviar é um <button type=\"submit\">, e nada mais depende de onclick", () => {
    const botao = pagina.querySelectorAll("form button").find((b) => texto(b) === "Enviar");
    expect(botao, 'um <button> com o texto "Enviar"').toBeTruthy();
    expect(botao.getAttribute("type"), "o type do botão").toBe("submit");
    expect(pagina.querySelectorAll("[onclick]").length, "elementos com onclick").toBe(0);
  });
});
