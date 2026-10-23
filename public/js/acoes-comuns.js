// Ações usadas em mais de uma página (tópicos e exercícios).
import { atualizar } from "./api.js";
import { avisar, esc } from "./ui.js";
import { escolherTopico } from "./pomodoro.js";

const STATUS_TOPICO = ["Não iniciado", "Em andamento", "Concluído"];

/** Botão "Estudar" + seletor de status de um tópico. */
export function acoesDoTopico(topico, nomeDoModulo) {
  const dados = `data-topico="${topico.id}" data-nome="${esc(topico.nome)}"
    data-modulo="${esc(nomeDoModulo)}" data-status="${esc(topico.status)}"`;
  const botoesStatus = STATUS_TOPICO.map((s) => `<button type="button" data-acao="status-topico"
    data-topico="${topico.id}" data-novo="${esc(s)}" aria-pressed="${s === topico.status}">${esc(s)}</button>`).join("");
  return `<div class="acoes">
    <button type="button" class="primario" data-acao="estudar" ${dados}>Estudar</button>
    <div class="segmentado" role="group" aria-label="Status de ${esc(topico.nome)}">${botoesStatus}</div>
  </div>`;
}

/** Comando de um exercício com botão de copiar. */
export function comandoDoExercicio(exercicio) {
  const comando = `npm run exercicio ${exercicio.slug}`;
  return `<code>${esc(comando)}</code>
    <button type="button" data-acao="copiar" data-texto="${esc(comando)}">Copiar</button>`;
}

export const acoesComuns = {
  estudar(el) {
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
