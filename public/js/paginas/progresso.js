// "Progresso": números gerais e sessões recentes (com opção de apagar).
import { buscar, apagar } from "../api.js";
import { esc, avisar, dataLocal, dataBR } from "../ui.js";

const numero = (valor, rotulo) => `<div class="card numero"><strong>${valor}</strong><span>${rotulo}</span></div>`;
const media = (v) => (v == null ? "—" : v.toLocaleString("pt-BR"));
const horas = (minutos) => `${(Math.round((minutos / 60) * 10) / 10).toLocaleString("pt-BR")} h`;

export default {
  titulo: "Progresso",

  async render() {
    const [p, sessoes] = await Promise.all([
      buscar("/progresso"),
      buscar(`/sessions?de=${dataLocal(-13)}`),
    ]);

    const niveis = p.por_nivel.map((n) => `
      <tr><td>${esc(n.nivel)}</td><td>${n.total}</td><td>${n.concluidas}</td>
        <td>${media(n.media_hoje)}</td><td>${media(n.media_meta)}</td></tr>`).join("");

    const maisEstudadas = p.habilidades_mais_estudadas.length
      ? `<ul class="lista">${p.habilidades_mais_estudadas.map((h) =>
        `<li><span>${esc(h.nome)}</span><strong>${horas(h.minutos)}</strong></li>`).join("")}</ul>`
      : `<p class="vazio">Nenhuma sessão registrada ainda.</p>`;

    const linhasSessoes = sessoes.map((s) => `
      <tr>
        <td>${dataBR(s.data)}</td>
        <td>${s.minutos} min</td>
        <td>${esc(s.topico_nome ?? s.skill_nome ?? s.course_nome ?? "—")}</td>
        <td>${esc(s.notas ?? "")}</td>
        <td><button type="button" class="perigo" data-acao="apagar-sessao" data-id="${s.id}"
          aria-label="Apagar sessão de ${dataBR(s.data)}">Apagar</button></td>
      </tr>`).join("");

    return `<h1>Progresso</h1>
      <p class="sub">Mês ${p.mes_do_plano} do plano.</p>
      <div class="numeros">
        ${numero(`${p.trilha.concluidos}/${p.trilha.total_topicos}`, "tópicos concluídos")}
        ${numero(p.trilha.em_andamento, "tópicos em andamento")}
        ${numero(`${p.exercicios.resolvidos}/${p.exercicios.total}`, "exercícios resolvidos")}
        ${numero(horas(p.minutos_ultimos_7_dias), "nos últimos 7 dias")}
      </div>

      <h2>Mais estudadas</h2>
      ${maisEstudadas}

      <h2>Habilidades por nível</h2>
      <div class="tabela-rolagem"><table>
        <thead><tr><th>Nível</th><th>Total</th><th>Concluídas</th><th>Média hoje</th><th>Média meta</th></tr></thead>
        <tbody>${niveis}</tbody>
      </table></div>

      <h2>Sessões dos últimos 14 dias</h2>
      ${sessoes.length ? `<div class="tabela-rolagem"><table>
        <thead><tr><th>Data</th><th>Tempo</th><th>Tópico</th><th>Notas</th><th><span class="pular">Ações</span></th></tr></thead>
        <tbody>${linhasSessoes}</tbody>
      </table></div>` : `<p class="vazio">Nenhuma sessão nos últimos 14 dias.</p>`}`;
  },

  acoes: {
    async "apagar-sessao"(el, contexto) {
      if (!confirm("Apagar esta sessão de estudo?")) return;
      await apagar(`/sessions/${el.dataset.id}`);
      avisar("Sessão apagada.");
      await contexto.recarregar();
    },
  },
};
