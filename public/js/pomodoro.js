// Pomodoro: cronômetro + formulário que registra a sessão de estudo no tópico escolhido.
import { criar, atualizar } from "./api.js";
import { avisar, esc } from "./ui.js";

const $ = (id) => document.getElementById(id);

let duracaoMin = 25;
let restanteSeg = duracaoMin * 60;
let fimEm = null; // timestamp (ms) em que o pomodoro acaba; null = parado
let intervalo = null;
let topico = null; // { id, nome, modulo, status }

const rodando = () => fimEm !== null;

function formatar(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, "0");
  const s = String(segundos % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/** Título da aba sem o prefixo do cronômetro ("12:34 · "). */
const tituloBase = () => document.title.replace(/^(\d\d:\d\d|⏰) · /, "");

function desenhar() {
  const tempo = $("pomo-tempo");
  tempo.textContent = formatar(restanteSeg);
  tempo.classList.toggle("rodando", rodando());
  const iniciado = restanteSeg < duracaoMin * 60;
  $("pomo-iniciar").textContent = rodando() ? "Pausar" : iniciado && restanteSeg > 0 ? "Continuar" : "Iniciar";
  if (rodando()) document.title = `${formatar(restanteSeg)} · ${tituloBase()}`;
}

/** Coloca no formulário os minutos já estudados (a partir de 30 segundos). */
function preencherMinutos() {
  const estudadoSeg = duracaoMin * 60 - restanteSeg;
  if (estudadoSeg >= 30) $("pomo-minutos").value = Math.max(1, Math.round(estudadoSeg / 60));
}

function tique() {
  // Calcula pelo relógio, e não contando tiques: setInterval atrasa quando a aba fica em segundo plano.
  restanteSeg = Math.max(0, Math.ceil((fimEm - Date.now()) / 1000));
  if (restanteSeg === 0) concluir();
  else desenhar();
}

function pausar() {
  clearInterval(intervalo);
  fimEm = null;
  document.title = tituloBase();
  preencherMinutos();
  desenhar();
}

function iniciarOuPausar() {
  if (rodando()) return pausar();
  if (restanteSeg === 0) restanteSeg = duracaoMin * 60;
  fimEm = Date.now() + restanteSeg * 1000;
  intervalo = setInterval(tique, 250);
  desenhar();
}

function concluir() {
  pausar();
  document.title = `⏰ · ${tituloBase()}`;
  tocarAlarme();
  avisar("Pomodoro concluído! Registre a sessão e faça uma pausa.");
}

function zerar() {
  pausar();
  restanteSeg = duracaoMin * 60;
  $("pomo-minutos").value = "";
  desenhar();
}

function escolherDuracao(botao) {
  if (rodando()) return avisar("Pause o pomodoro antes de trocar a duração.", "erro");
  duracaoMin = Number(botao.dataset.min);
  document.querySelectorAll(".pomo-presets button")
    .forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
  zerar();
}

function tocarAlarme() {
  try {
    const audio = new AudioContext();
    const oscilador = audio.createOscillator();
    const volume = audio.createGain();
    oscilador.frequency.value = 880;
    volume.gain.value = 0.1;
    oscilador.connect(volume).connect(audio.destination);
    oscilador.start();
    oscilador.stop(audio.currentTime + 0.6);
  } catch {
    // Sem áudio (navegador bloqueou): o aviso na tela já basta.
  }
}

/** Chamado pelos botões "Estudar" das páginas. */
export function escolherTopico(novo) {
  topico = novo;
  $("pomo-topico").innerHTML = `Estudando: <strong>${esc(novo.nome)}</strong><br><small>${esc(novo.modulo)}</small>`;
  $("pomo-iniciar").focus();
  avisar(`Tópico escolhido: ${novo.nome}. Clique em Iniciar.`);
}

async function registrar(evento) {
  evento.preventDefault();
  if (!topico) return avisar("Escolha um tópico com o botão Estudar antes de registrar.", "erro");
  const minutos = Number($("pomo-minutos").value);
  const notas = $("pomo-notas").value.trim();
  try {
    await criar("/sessions", { topico_id: topico.id, minutos, ...(notas && { notas }) });
    if (topico.status === "Não iniciado") {
      await atualizar(`/topicos/${topico.id}`, { status: "Em andamento" });
      topico.status = "Em andamento";
    }
    avisar(`Sessão de ${minutos} min registrada em ${topico.nome}.`);
    $("pomo-notas").value = "";
    zerar();
    document.dispatchEvent(new CustomEvent("sessao-registrada"));
  } catch (erro) {
    avisar(erro.message, "erro");
  }
}

export function iniciarPomodoro() {
  $("pomo-iniciar").addEventListener("click", iniciarOuPausar);
  $("pomo-zerar").addEventListener("click", zerar);
  $("pomo-form").addEventListener("submit", registrar);
  document.querySelectorAll(".pomo-presets button")
    .forEach((b) => b.addEventListener("click", () => escolherDuracao(b)));
  // Evita perder o pomodoro fechando a aba sem querer.
  window.addEventListener("beforeunload", (e) => { if (rodando()) e.preventDefault(); });
  desenhar();
}
