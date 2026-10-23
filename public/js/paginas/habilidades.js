// "Habilidades": autoavaliação (hoje), meta e status. Salva a cada mudança.
import { buscar, atualizar } from "../api.js";
import { esc, avisar, meses } from "../ui.js";

// Mesmos valores aceitos pela API (src/constantes.js).
const NIVEIS = ["Júnior", "Pleno", "Sênior"];
const STATUS = ["Não iniciado", "Em andamento", "Concluído", "Atrasado", "N/A"];

function opcoes(valores, atual) {
  return valores.map(([valor, rotulo]) =>
    `<option value="${esc(valor)}" ${String(valor) === String(atual ?? "") ? "selected" : ""}>${esc(rotulo)}</option>`).join("");
}

const notas = (comVazio) => [...(comVazio ? [["", "—"]] : []), ...[1, 2, 3, 4, 5].map((n) => [n, n])];

function linha(s) {
  const campo = (nome, valores, atual, rotulo) => `<select data-acao="salvar" data-id="${s.id}" data-campo="${nome}"
    aria-label="${rotulo}: ${esc(s.nome)}">${opcoes(valores, atual)}</select>`;
  return `<tr>
    <td>${esc(s.nome)}<small>${esc(s.area)} · ${s.mes_inicio ? meses(s) : "sem prazo"}</small></td>
    <td>${campo("hoje", notas(true), s.hoje, "Hoje")}</td>
    <td>${campo("meta", notas(false), s.meta, "Meta")}</td>
    <td>${campo("status", STATUS.map((x) => [x, x]), s.status, "Status")}</td>
  </tr>`;
}

export default {
  titulo: "Habilidades",

  async render() {
    const skills = await buscar("/skills");
    const tabelas = NIVEIS.map((nivel) => `
      <h2>${nivel}</h2>
      <div class="tabela-rolagem"><table>
        <thead><tr><th>Habilidade</th><th>Hoje</th><th>Meta</th><th>Status</th></tr></thead>
        <tbody>${skills.filter((s) => s.nivel === nivel).map(linha).join("")}</tbody>
      </table></div>`).join("");

    return `<h1>Habilidades</h1>
      <p class="sub">Autoavaliação: <strong>1</strong> = nunca usei · <strong>3</strong> = faço sozinho em tarefa simples ·
        <strong>5</strong> = ensino outras pessoas. Quanto maior a distância até a meta, mais a habilidade sobe no Agora.</p>
      ${tabelas}`;
  },

  acoes: {
    async salvar(el) {
      const { id, campo } = el.dataset;
      const valor = campo === "status" ? el.value : el.value === "" ? null : Number(el.value);
      await atualizar(`/skills/${id}`, { [campo]: valor });
      avisar("Salvo.");
    },
  },
};
