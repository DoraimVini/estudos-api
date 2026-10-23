// Pedaços de interface reaproveitados pelas páginas.

/** Escapa texto antes de colocar em HTML. Sem isso, um "<" num título quebraria (ou injetaria) a página. */
export function esc(texto) {
  const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto ?? "").replace(/[&<>"']/g, (c) => mapa[c]);
}

/** Markdown mínimo das descrições da trilha: `código` e **negrito**. Escapa primeiro. */
export function md(texto) {
  return esc(texto)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export const meses = ({ mes_inicio, mes_fim }) =>
  mes_inicio === mes_fim ? `mês ${mes_inicio}` : `meses ${mes_inicio}–${mes_fim}`;

export const chip = (status) => `<span class="chip" data-status="${esc(status)}">${esc(status)}</span>`;

export function chipAtraso(modulo) {
  if (!modulo.atrasado) return "";
  const n = modulo.meses_de_atraso;
  return `<span class="chip atraso">${n} ${n === 1 ? "mês" : "meses"} de atraso</span>`;
}

/** Barra de progresso acessível (leitores de tela anunciam o valor). */
export function barra(feitos, total, rotulo = "Progresso") {
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  return `<div class="barra" role="progressbar" aria-label="${esc(rotulo)}"
    aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${feitos}"><span style="width:${pct}%"></span></div>`;
}

let temporizadorAviso;
/** Mensagem curta no rodapé, anunciada para leitores de tela (role="status"). */
export function avisar(mensagem, tipo = "ok") {
  const aviso = document.getElementById("aviso");
  aviso.textContent = mensagem;
  aviso.dataset.tipo = tipo;
  aviso.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { aviso.hidden = true; }, tipo === "erro" ? 6000 : 3500);
}

/** Data de hoje (AAAA-MM-DD) no fuso do navegador, somando ou subtraindo dias. */
export function dataLocal(diasAMais = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasAMais);
  return d.toLocaleDateString("en-CA");
}

export const dataBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
