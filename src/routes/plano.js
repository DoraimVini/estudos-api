import { Router } from "express";
import { NIVEIS } from "../constantes.js";
import { mesDoPlano, proximasPrioridades } from "../services/plano.js";
import { hojeISO, somarDias } from "../datas.js";
import { badRequest } from "../errors.js";

function lerMes(repos, query, agora) {
  if (query.mes === undefined) return mesDoPlano(repos.config.planoInicio(), agora());
  const mes = Number(query.mes);
  if (!Number.isInteger(mes) || mes < 1) throw badRequest("mes deve ser um inteiro >= 1.");
  return mes;
}

export function planoRouter(repos, { agora = () => new Date() } = {}) {
  const router = Router();

  // GET /proximo?limite=3&mes=7  -> o que estudar agora, em ordem de prioridade
  router.get("/proximo", (req, res) => {
    const mes = lerMes(repos, req.query, agora);
    const limite = req.query.limite === undefined ? 3 : Number(req.query.limite);
    if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
      throw badRequest("limite deve ser um inteiro de 1 a 20.");
    }
    res.json(proximasPrioridades(repos.skills.listar(), repos.courses.listar(), mes, limite));
  });

  // GET /progresso -> resumo por nível e horas estudadas
  router.get("/progresso", (req, res) => {
    const mes = lerMes(repos, req.query, agora);
    const porNivel = NIVEIS.map((nivel) => ({ nivel, ...repos.skills.resumoPorNivel(nivel) }));

    // "Últimos 7 dias" = hoje e os 6 dias anteriores, no calendário de São Paulo.
    const minutos = repos.sessions.minutosDesde(somarDias(hojeISO(agora()), -6));

    res.json({
      mes_do_plano: mes,
      por_nivel: porNivel,
      minutos_ultimos_7_dias: minutos,
      horas_ultimos_7_dias: Math.round((minutos / 60) * 10) / 10,
      habilidades_mais_estudadas: repos.sessions.habilidadesMaisEstudadas(5),
    });
  });

  return router;
}
