// Ponto de entrada: roteamento por hash (#/agora, #/trilha/5…) e despacho das ações das páginas.
import { avisar, esc } from "./ui.js";
import { iniciarPomodoro } from "./pomodoro.js";
import { acoesComuns } from "./acoes-comuns.js";
import agora from "./paginas/agora.js";
import trilha from "./paginas/trilha.js";
import progresso from "./paginas/progresso.js";
import habilidades from "./paginas/habilidades.js";

const PAGINAS = { agora, trilha, progresso, habilidades };
const conteudo = document.getElementById("conteudo");
let paginaAtual = agora;

/** "#/trilha/5" -> { nome: "trilha", parametro: "5" } */
function lerRota() {
  const [, nome, parametro] = location.hash.split("/");
  return { nome: PAGINAS[nome] ? nome : "agora", parametro };
}

/** Desenha a página da rota atual. Ao navegar (e não ao recarregar dados), leva o foco para o conteúdo. */
async function mostrar({ navegando = false } = {}) {
  const { nome, parametro } = lerRota();
  paginaAtual = PAGINAS[nome];
  document.querySelectorAll("[data-rota]").forEach((link) => {
    if (link.dataset.rota === nome) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (navegando) conteudo.innerHTML = `<p class="carregando">Carregando…</p>`;

  try {
    conteudo.innerHTML = await paginaAtual.render(parametro);
    document.title = `${paginaAtual.titulo} · Estudos`;
  } catch (erro) {
    conteudo.innerHTML = `<p class="erro-pagina">Não consegui carregar a página: ${esc(erro.message)}.
      A API está rodando?</p>`;
  }
  if (navegando) {
    conteudo.focus();
    window.scrollTo(0, 0);
  }
}

const contexto = { recarregar: () => mostrar() };

/** Um único ouvinte para todos os botões e selects: cada um diz a ação em data-acao. */
async function despachar(evento) {
  const alvo = evento.target.closest("[data-acao]");
  if (!alvo || !conteudo.contains(alvo)) return;
  const ehCampo = alvo.matches("select, input");
  if ((evento.type === "change") !== ehCampo) return; // botões no click, campos no change

  const acao = paginaAtual.acoes?.[alvo.dataset.acao] ?? acoesComuns[alvo.dataset.acao];
  if (!acao) return;
  try {
    await acao(alvo, contexto);
  } catch (erro) {
    avisar(erro.message, "erro");
  }
}

conteudo.addEventListener("click", despachar);
conteudo.addEventListener("change", despachar);
window.addEventListener("hashchange", () => mostrar({ navegando: true }));
document.addEventListener("sessao-registrada", () => mostrar());

iniciarPomodoro();
if (!location.hash) history.replaceState(null, "", "#/agora");
mostrar();
