import type { ExercicioComNomes, ModuloComContagem, Topico } from "../tipos.ts";

type Contagem = Pick<ModuloComContagem, "total_topicos" | "concluidos" | "em_andamento">;

/**
 * Status de um módulo, calculado a partir dos tópicos (não fica guardado no banco).
 */
export function statusDoModulo({ total_topicos, concluidos, em_andamento }: Contagem): string {
  if (total_topicos > 0 && concluidos === total_topicos) return "Concluído";
  if (concluidos > 0 || em_andamento > 0) return "Em andamento";
  return "Não iniciado";
}

/** Módulo pronto para responder na API: status calculado e progresso. */
export function resumirModulo(modulo: ModuloComContagem, mes?: number) {
  const { total_topicos, concluidos, em_andamento, ...dados } = modulo;
  const status = statusDoModulo(modulo);
  const mesesDeAtraso = mes !== undefined && status !== "Concluído" ? Math.max(0, mes - modulo.mes_fim) : 0;
  return {
    ...dados,
    status,
    progresso: { concluidos, em_andamento, total: total_topicos },
    ...(mes !== undefined && { atrasado: mesesDeAtraso > 0, meses_de_atraso: mesesDeAtraso }),
  };
}

/**
 * Próximos exercícios pendentes, na ordem dos módulos em foco (atrasados primeiro).
 * @param modulosFoco  resultado de modulosEmFoco
 * @param pendentes  exercícios com status 'Pendente', em ordem de catálogo
 */
export function exerciciosEmFoco(
  modulosFoco: { id: number }[], pendentes: ExercicioComNomes[], limite = 3,
): ExercicioComNomes[] {
  return modulosFoco
    .flatMap((m) => pendentes.filter((e) => e.modulo_id === m.id))
    .slice(0, limite);
}

/**
 * Módulos para estudar no mês: os que estão na janela do mês e os atrasados ainda não concluídos.
 * Cada um traz os próximos tópicos a estudar (os em andamento primeiro, depois na ordem da trilha).
 * Atrasados vêm antes; depois, quem termina antes no plano.
 * @param modulos  linhas de listarModulos()
 */
export function modulosEmFoco(
  modulos: ModuloComContagem[], topicosPorModulo: Map<number, Topico[]>, mes: number, limiteTopicos = 3,
) {
  return modulos
    .filter((m) => m.mes_inicio <= mes && statusDoModulo(m) !== "Concluído")
    .map((m) => {
      const pendentes = (topicosPorModulo.get(m.id) ?? [])
        .filter((t) => t.status !== "Concluído")
        .sort((a, b) =>
          Number(b.status === "Em andamento") - Number(a.status === "Em andamento") || a.ordem - b.ordem);
      return {
        ...resumirModulo(m, mes),
        proximos_topicos: pendentes.slice(0, limiteTopicos)
          .map(({ id, ordem, nome, descricao, status }) => ({ id, ordem, nome, descricao, status })),
      };
    })
    .sort((a, b) => (b.meses_de_atraso ?? 0) - (a.meses_de_atraso ?? 0) || a.mes_fim - b.mes_fim || a.id - b.id);
}
