import { NIVEIS, PRIORIDADES } from "../constantes.ts";
import { hojeISO } from "../datas.ts";
import type { Course, Skill } from "../tipos.ts";

/**
 * Mês do plano (1 = mês de início), contado no calendário de São Paulo. Antes do início, retorna 1.
 * @param inicio data ISO do primeiro mês do plano (ex.: "2026-11-01")
 */
export function mesDoPlano(inicio: string, agora: Date = new Date()): number {
  const [anoInicio, mesInicio] = inicio.split("-").map(Number);
  const [ano, mes] = hojeISO(agora).split("-").map(Number);
  const diff = (ano - anoInicio) * 12 + (mes - mesInicio);
  return Math.max(1, diff + 1);
}

const PESO_NIVEL: Record<string, number> = { Júnior: 3, Pleno: 2, Sênior: 1 };
const FECHADOS = new Set<string>(["Concluído", "N/A"]);

export interface Pontuacao { pontos: number; motivos: string[] }

/**
 * Pontua uma habilidade para decidir o que estudar agora.
 * Regras (ajuste à vontade, é o coração da API):
 *  - quanto maior a distância entre "hoje" e "meta", mais prioridade;
 *  - júnior vem antes de pleno, que vem antes de sênior;
 *  - habilidades atrasadas (mês de fim já passou) sobem;
 *  - o que já está "Em andamento" ganha um empurrão para você terminar.
 * Retorna null quando a habilidade não deve aparecer agora.
 */
export function pontuarSkill(skill: Skill, mes: number): Pontuacao | null {
  if (FECHADOS.has(skill.status)) return null;
  if (skill.mes_inicio != null && skill.mes_inicio > mes) return null;

  const motivos: string[] = [];
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

export function proximasPrioridades(skills: Skill[], courses: Course[], mes: number, limite = 3) {
  const ranking = skills
    .map((s) => ({ skill: s, score: pontuarSkill(s, mes) }))
    // O "x is ..." diz ao TypeScript que, depois do filtro, score nunca é null.
    .filter((x): x is { skill: Skill; score: Pontuacao } => x.score !== null)
    .sort((a, b) =>
      b.score.pontos - a.score.pontos ||
      // desempate: o que termina antes no plano é mais urgente
      (a.skill.mes_fim ?? Infinity) - (b.skill.mes_fim ?? Infinity) ||
      posicao(NIVEIS, a.skill.nivel) - posicao(NIVEIS, b.skill.nivel) ||
      a.skill.id - b.skill.id)
    .slice(0, limite)
    .map(({ skill, score }) => ({ ...skill, pontos: score.pontos, motivos: score.motivos }));

  const cursosDoMes = courses
    .filter((c) => !FECHADOS.has(c.status))
    .filter((c) => (c.mes_inicio ?? 1) <= mes && (c.mes_fim == null || c.mes_fim >= mes))
    .sort((a, b) => posicao(PRIORIDADES, a.prioridade) - posicao(PRIORIDADES, b.prioridade));

  return { mes_do_plano: mes, habilidades: ranking, cursos_do_mes: cursosDoMes };
}

/** Posição de um texto numa lista de valores conhecidos (-1 se não estiver). */
function posicao(lista: readonly string[], valor: string): number {
  return lista.indexOf(valor);
}
