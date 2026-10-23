// "Trilha": todos os módulos (#/trilha) e o detalhe de um módulo (#/trilha/5).
import { buscar } from "../api.js";
import { esc, md, meses, chip, chipAtraso, barra } from "../ui.js";
import { acoesDoTopico, comandoDoExercicio } from "../acoes-comuns.js";

function cardResumo(m) {
  const { concluidos, total } = m.progresso;
  return `<article class="card">
    <div class="card-cabecalho">
      <h3><a href="#/trilha/${m.id}">${m.id}. ${esc(m.nome)}</a></h3>
    </div>
    <p class="meses">${meses(m)} ${chip(m.status)} ${chipAtraso(m)}</p>
    ${barra(concluidos, total, `Progresso em ${m.nome}`)}
    <p class="progresso-texto">${concluidos} de ${total} tópicos</p>
  </article>`;
}

async function lista() {
  const modulos = await buscar("/modulos");
  const fases = [...new Set(modulos.map((m) => m.fase))];
  const secoes = fases.map((fase) => `
    <h2>Fase ${fase}</h2>
    <div class="cards-grade">${modulos.filter((m) => m.fase === fase).map(cardResumo).join("")}</div>`);
  return `<h1>Trilha</h1>
    <p class="sub">Os ${modulos.length} módulos do plano. Abra um módulo para ver tópicos, recursos e exercícios.</p>
    ${secoes.join("")}`;
}

async function detalhe(id) {
  const m = await buscar(`/modulos/${encodeURIComponent(id)}`);
  const { concluidos, total } = m.progresso;

  const topicos = m.topicos.map((t) => `
    <li>
      <div>
        <div class="titulo"><strong>${t.ordem}. ${esc(t.nome)}</strong>
          ${t.tem_conteudo ? "" : `<span class="chip">só resumo</span>`}</div>
        <p>${md(t.descricao)}</p>
      </div>
      ${acoesDoTopico(t)}
    </li>`).join("");

  const recursos = m.recursos.map((r) => `
    <li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.titulo)}</a>
      <span class="meses">(${esc(r.tipo)})</span></li>`).join("");

  const exercicios = m.exercicios.length ? `
    <h2>Exercícios</h2>
    <ul class="lista">${m.exercicios.map((e) => `
      <li>
        <div>
          <div class="titulo"><strong>${esc(e.titulo)}</strong> ${chip(e.status)}</div>
          <p>Tópico: ${esc(e.topico_nome ?? "—")}${e.tentativas ? ` · ${e.tentativas} tentativa(s)` : ""}</p>
          <div id="enunciado-${e.id}"></div>
        </div>
        <div class="acoes">
          ${comandoDoExercicio(e)}
          <button type="button" data-acao="enunciado" data-id="${e.id}" aria-expanded="false"
            aria-controls="enunciado-${e.id}">Ver enunciado</button>
        </div>
      </li>`).join("")}
    </ul>` : "";

  return `<p><a href="#/trilha">← Trilha</a></p>
    <h1>${m.id}. ${esc(m.nome)}</h1>
    <p class="sub">${meses(m)} ${chip(m.status)} ${chipAtraso(m)}
      ${m.skill_nome ? `· Habilidade: ${esc(m.skill_nome)}` : ""}</p>
    <article class="card">
      <dl class="texto-modulo">
        <dt>Objetivo</dt><dd>${md(m.objetivo)}</dd>
        <dt>Mini-projeto</dt><dd>${md(m.mini_projeto)}</dd>
        <dt>Pronto quando</dt><dd>${md(m.pronto_quando)}</dd>
      </dl>
    </article>
    <h2>Tópicos</h2>
    ${barra(concluidos, total, `Progresso em ${m.nome}`)}
    <p class="progresso-texto">${concluidos} de ${total} tópicos concluídos</p>
    <ul class="lista">${topicos}</ul>
    <h2>Recursos</h2>
    <ul>${recursos}</ul>
    ${exercicios}`;
}

export default {
  titulo: "Trilha",

  render(id) {
    return id ? detalhe(id) : lista();
  },

  acoes: {
    // Mostra/esconde o README do exercício, buscando só na primeira vez.
    async enunciado(el) {
      const caixa = document.getElementById(`enunciado-${el.dataset.id}`);
      const aberto = el.getAttribute("aria-expanded") === "true";
      if (!aberto && !caixa.innerHTML) {
        const exercicio = await buscar(`/exercicios/${el.dataset.id}`);
        caixa.innerHTML = `<pre>${esc(exercicio.enunciado)}</pre>`;
      }
      caixa.hidden = aberto;
      el.setAttribute("aria-expanded", String(!aberto));
      el.textContent = aberto ? "Ver enunciado" : "Esconder enunciado";
    },
  },
};
