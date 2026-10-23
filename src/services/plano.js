import { NIVEIS, PRIORIDADES } from "../db/database.js";

/**
 * Mês do plano (1 = mês de início). Antes do início, retorna 1.
 * @param {string} inicio data ISO do primeiro mês do plano (ex.: "2026-11-01")
 * @param {Date} hoje
 */
export function mesDoPlano(inicio, hoje = new Date()) {
  const [ano, mes] = inicio.split("-").map(Number);
  const diff = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() + 1 - mes);
  return Math.max(1, diff + 1);
}

const PESO_NIVEL = { Júnior: 3, Pleno: 2, Sênior: 1 };
const FECHADOS = new Set(["Concluído", "N/A"]);

/**
 * Pontua uma habilidade para decidir o que estudar agora.
 * Regras (ajuste à vontade, é o coração da API):
 *  - quanto maior a distância entre "hoje" e "meta", mais prioridade;
 *  - júnior vem antes de pleno, que vem antes de sênior;
 *  - habilidades atrasadas (mês de fim já passou) sobem;
 *  - o que já está "Em andamento" ganha um empurrão para você terminar.
 * Retorna null quando a habilidade não deve aparecer agora.
 */
export function pontuarSkill(skill, mes) {
  if (FECHADOS.has(skill.status)) return null;
  if (skill.mes_inicio != null && skill.mes_inicio > mes) return null;

  const motivos = [];
  const nivelAtual = skill.hoje ?? 1;
  const gap = Math.max(0, skill.meta - nivelAtual);
  const atraso = skill.mes_fim != null && mes > skill.mes_fim ? mes - skill.mes_fim : 0;

  let pontos = gap * 2 + (PESO_NIVEL[skill.nivel] ?? 0) * 2;

  if (skill.hoje == null) motivos.push("autoavaliação em branco (contei como 1)");
  if (gap > 0) motivos.push(`faltam ${gap} ponto(s) para a meta ${skill.meta}`);
  if (atraso > 0) {
    pontos += Math.min(atraso, 6);
    motivos.push(`prazo do plano terminou há ${atraso} mês(es)`);
  } else if (skill.mes_fim != null) {
    motivos.push(`dentro da janela do plano (meses ${skill.mes_inicio}–${skill.mes_fim})`);
  }
  if (skill.status === "Em andamento") {
    pontos += 2;
    motivos.push("já está em andamento");
  }
  if (gap === 0 && atraso === 0) return null; // meta atingida e sem atraso: nada a fazer

  return { pontos, motivos };
}

export function proximasPrioridades(skills, courses, mes, limite = 3) {
  const ranking = skills
    .map((s) => ({ skill: s, score: pontuarSkill(s, mes) }))
    .filter((x) => x.score)
    .sort((a, b) =>
      b.score.pontos - a.score.pontos ||
      // desempate: o que termina antes no plano é mais urgente
      (a.skill.mes_fim ?? Infinity) - (b.skill.mes_fim ?? Infinity) ||
      NIVEIS.indexOf(a.skill.nivel) - NIVEIS.indexOf(b.skill.nivel) ||
      a.skill.id - b.skill.id)
    .slice(0, limite)
    .map(({ skill, score }) => ({ ...skill, pontos: score.pontos, motivos: score.motivos }));

  const cursosDoMes = courses
    .filter((c) => !FECHADOS.has(c.status))
    .filter((c) => (c.mes_inicio ?? 1) <= mes && (c.mes_fim == null || c.mes_fim >= mes))
    .sort((a, b) => PRIORIDADES.indexOf(a.prioridade) - PRIORIDADES.indexOf(b.prioridade));

  return { mes_do_plano: mes, habilidades: ranking, cursos_do_mes: cursosDoMes };
}
