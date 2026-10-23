// Ações usadas em mais de uma página (tópicos e exercícios).
import { atualizar } from "./api.js";
import { avisar, esc } from "./ui.js";
import { escolherTopico } from "./pomodoro.js";

const STATUS_TOPICO = ["Não iniciado", "Em andamento", "Concluído"];

/** Dados do tópico que o Pomodoro precisa, em atributos data-*. */
export const dadosDoTopico = (topico, nomeDoModulo) => `data-topico="${topico.id}" data-nome="${esc(topico.nome)}"
  data-modulo="${esc(nomeDoModulo)}" data-status="${esc(topico.status)}"`;

/** Botões de status (Não iniciado / Em andamento / Concluído) de um tópico. */
export function statusDoTopico(topico) {
  const botoes = STATUS_TOPICO.map((s) => `<button type="button" data-acao="status-topico"
    data-topico="${topico.id}" data-novo="${esc(s)}" aria-pressed="${s === topico.status}">${esc(s)}</button>`).join("");
  return `<div class="segmentado" role="group" aria-label="Status de ${esc(topico.nome)}">${botoes}</div>`;
}

/** Nas listas: "Estudar" abre a página do tópico; ao lado, o status. */
export function acoesDoTopico(topico) {
  return `<div class="acoes">
    <a class="botao primario" href="#/topico/${topico.id}">Estudar</a>
    ${statusDoTopico(topico)}
  </div>`;
}

/** Comando de um exercício com botão de copiar. */
export function comandoDoExercicio(exercicio) {
  const comando = `npm run exercicio ${exercicio.slug}`;
  return `<code>${esc(comando)}</code>
    <button type="button" data-acao="copiar" data-texto="${esc(comando)}">Copiar</button>`;
}

export const acoesComuns = {
  cronometrar(el) {
    const { topico, nome, modulo, status } = el.dataset;
    escolherTopico({ id: Number(topico), nome, modulo, status });
  },

  async "status-topico"(el, contexto) {
    await atualizar(`/topicos/${el.dataset.topico}`, { status: el.dataset.novo });
    avisar(`Tópico marcado como ${el.dataset.novo}.`);
    await contexto.recarregar();
  },

  async copiar(el) {
    await navigator.clipboard.writeText(el.dataset.texto);
    avisar("Comando copiado. Cole no terminal, na pasta do projeto.");
  },
};
