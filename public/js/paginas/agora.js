// "Agora": o que estudar hoje, vindo do GET /proximo.
import { buscar } from "../api.js";
import { esc, md, meses, chipAtraso, barra } from "../ui.js";
import { acoesDoTopico, comandoDoExercicio } from "../acoes-comuns.js";

function cardModulo(m) {
  const { concluidos, total } = m.progresso;
  const topicos = m.proximos_topicos.map((t) => `
    <li>
      <div>
        <div class="titulo"><strong>${esc(t.nome)}</strong></div>
        <p>${md(t.descricao)}</p>
      </div>
      ${acoesDoTopico(t, m.nome)}
    </li>`).join("");

  return `<article class="card">
    <div class="card-cabecalho">
      <h3><a href="#/trilha/${m.id}">${m.id}. ${esc(m.nome)}</a></h3>
      <span class="meses">${meses(m)}</span> ${chipAtraso(m)}
    </div>
    ${barra(concluidos, total, `Progresso em ${m.nome}`)}
    <p class="progresso-texto">${concluidos} de ${total} tópicos concluídos</p>
    <ul class="lista">${topicos}</ul>
  </article>`;
}

function secaoExercicios(exercicios) {
  if (!exercicios.length) return "";
  const itens = exercicios.map((e) => `
    <li>
      <div>
        <div class="titulo"><strong>${esc(e.titulo)}</strong></div>
        <p>Tópico: ${esc(e.topico_nome ?? "—")}</p>
      </div>
      <div class="acoes">${comandoDoExercicio(e)}</div>
    </li>`).join("");
  return `<h2>Exercícios sugeridos</h2><ul class="lista">${itens}</ul>`;
}

function secaoHabilidades(habilidades) {
  if (!habilidades.length) return "";
  const itens = habilidades.map((h) => `
    <li><div><strong>${esc(h.nome)}</strong><p>${h.motivos.map(esc).join(" · ")}</p></div></li>`).join("");
  return `<h2>Habilidades prioritárias</h2><ul class="lista">${itens}</ul>
    <p class="sub">Atualize a autoavaliação em <a href="#/habilidades">Habilidades</a> para a prioridade ficar certa.</p>`;
}

export default {
  titulo: "Agora",

  async render() {
    const p = await buscar("/proximo?limite=3");
    const modulos = p.modulos.length
      ? `<div class="cards">${p.modulos.map(cardModulo).join("")}</div>`
      : `<p class="vazio">Nenhum módulo pendente neste mês. 🎉</p>`;
    const cursos = p.cursos_do_mes.length
      ? `<h2>Em paralelo</h2><p>${p.cursos_do_mes.map((c) => esc(c.nome)).join(" · ")}</p>`
      : "";

    return `<h1>Agora</h1>
      <p class="sub">Mês ${p.mes_do_plano} do plano. Clique em <strong>Estudar</strong> num tópico e inicie o Pomodoro.</p>
      <h2>Módulos em foco</h2>
      ${modulos}
      ${secaoExercicios(p.exercicios)}
      ${secaoHabilidades(p.habilidades)}
      ${cursos}`;
  },
};
