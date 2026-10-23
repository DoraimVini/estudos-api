// "Tópico" (#/topico/12): o conteúdo de estudo, escrito em Markdown em conteudo/.
import { marked } from "/vendor/marked/marked.esm.js";
import { buscar } from "../api.js";
import { esc, md } from "../ui.js";
import { dadosDoTopico, statusDoTopico } from "../acoes-comuns.js";
import { escolherTopico, temTopico } from "../pomodoro.js";

/** Links externos abrem em outra aba, para não perder o Pomodoro. */
const abrirForaEmNovaAba = (html) =>
  html.replaceAll('<a href="http', '<a target="_blank" rel="noopener noreferrer" href="http');

function navegacao(t) {
  const link = (vizinho, texto) => (vizinho
    ? `<a class="botao" href="#/topico/${vizinho.id}">${texto}</a>` : "<span></span>");
  return `<nav class="vizinhos" aria-label="Tópicos vizinhos">
    ${link(t.anterior, `← ${esc(t.anterior?.nome ?? "")}`)}
    ${link(t.proximo, `${esc(t.proximo?.nome ?? "")} →`)}
  </nav>`;
}

export default {
  titulo: "Tópico",

  async render(id) {
    const t = await buscar(`/topicos/${encodeURIComponent(id)}`);
    // Abriu um tópico e o Pomodoro está livre: já deixa este tópico escolhido.
    if (!temTopico()) {
      escolherTopico({ id: t.id, nome: t.nome, modulo: t.modulo_nome, status: t.status }, { silencioso: true });
    }

    const conteudo = t.conteudo
      ? `<article class="conteudo">${abrirForaEmNovaAba(marked.parse(t.conteudo))}</article>`
      : `<p class="card vazio">O conteúdo deste tópico ainda não foi escrito. Por enquanto, use os
          <a href="#/trilha/${t.modulo_id}">recursos do módulo</a>.</p>`;

    return `<nav class="caminho" aria-label="Caminho">
        <a href="#/trilha">Trilha</a> › <a href="#/trilha/${t.modulo_id}">${esc(t.modulo_nome)}</a>
      </nav>
      <h1>${t.ordem}. ${esc(t.nome)}</h1>
      <p class="sub">${md(t.descricao)}</p>
      <div class="acoes-topico">
        <button type="button" class="primario" data-acao="cronometrar" ${dadosDoTopico(t, t.modulo_nome)}>
          ⏱ Cronometrar este tópico</button>
        ${statusDoTopico(t)}
      </div>
      ${conteudo}
      ${navegacao(t)}`;
  },
};
