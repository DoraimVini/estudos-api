import { Router } from "express";
import type { Request } from "express";
import type { Repositorios } from "../repositories/index.ts";
import type { OpcoesApp } from "../app.ts";
import { NIVEIS } from "../constantes.ts";
import { mesDoPlano, proximasPrioridades } from "../services/plano.ts";
import { modulosEmFoco, exerciciosEmFoco } from "../services/trilha.ts";
import { hojeISO, somarDias } from "../datas.ts";
import { badRequest } from "../errors.ts";

/** Mês do plano: o informado em ?mes= ou o mês atual. */
export function lerMes(repos: Repositorios, query: Request["query"], agora: () => Date): number {
  if (query.mes === undefined) {
    const inicio = repos.config.planoInicio();
    // O início vem do trilha.json na abertura do banco; sem ele, o banco não foi sincronizado.
    if (inicio === undefined) throw new Error("plano_inicio não está no banco.");
    return mesDoPlano(inicio, agora());
  }
  const mes = Number(query.mes);
  if (!Number.isInteger(mes) || mes < 1) throw badRequest("mes deve ser um inteiro >= 1.");
  return mes;
}

export function planoRouter(repos: Repositorios, { agora = () => new Date() }: OpcoesApp = {}) {
  const router = Router();

  // GET /proximo?limite=3&mes=7  -> o que estudar agora: módulos da trilha, habilidades e cursos
  router.get("/proximo", (req, res) => {
    const mes = lerMes(repos, req.query, agora);
    const limite = req.query.limite === undefined ? 3 : Number(req.query.limite);
    if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
      throw badRequest("limite deve ser um inteiro de 1 a 20.");
    }
    const { habilidades, cursos_do_mes } =
      proximasPrioridades(repos.skills.listar(), repos.courses.listar(), mes, limite);
    const modulos = modulosEmFoco(repos.trilha.listarModulos(), repos.trilha.topicosPorModulo(), mes, limite);
    const exercicios = exerciciosEmFoco(modulos, repos.exercicios.listar({ status: "Pendente" }), limite)
      .map(({ id, slug, titulo, modulo_id, topico_nome }) =>
        ({ id, slug, titulo, modulo_id, topico_nome, comando: `npm run exercicio ${slug}` }));
    res.json({ mes_do_plano: mes, modulos, exercicios, habilidades, cursos_do_mes });
  });

  // GET /progresso -> resumo por nível e horas estudadas
  router.get("/progresso", (req, res) => {
    const mes = lerMes(repos, req.query, agora);
    const porNivel = NIVEIS.map((nivel) => ({ nivel, ...repos.skills.resumoPorNivel(nivel) }));

    // "Últimos 7 dias" = hoje e os 6 dias anteriores, no calendário de São Paulo.
    const minutos = repos.sessions.minutosDesde(somarDias(hojeISO(agora()), -6));

    res.json({
      mes_do_plano: mes,
      trilha: repos.trilha.resumo(),
      exercicios: repos.exercicios.resumo(),
      por_nivel: porNivel,
      minutos_ultimos_7_dias: minutos,
      horas_ultimos_7_dias: Math.round((minutos / 60) * 10) / 10,
      habilidades_mais_estudadas: repos.sessions.habilidadesMaisEstudadas(5),
    });
  });

  return router;
}
