import { Router } from "express";
import { getConfig, NIVEIS } from "../db/database.js";
import { mesDoPlano, proximasPrioridades } from "../services/plano.js";
import { badRequest } from "../errors.js";

function lerMes(db, query, agora) {
  if (query.mes === undefined) return mesDoPlano(getConfig(db, "plano_inicio"), agora());
  const mes = Number(query.mes);
  if (!Number.isInteger(mes) || mes < 1) throw badRequest("mes deve ser um inteiro >= 1.");
  return mes;
}

export function planoRouter(db, { agora = () => new Date() } = {}) {
  const router = Router();

  // GET /proximo?limite=3&mes=7  -> o que estudar agora, em ordem de prioridade
  router.get("/proximo", (req, res) => {
    const mes = lerMes(db, req.query, agora);
    const limite = req.query.limite === undefined ? 3 : Number(req.query.limite);
    if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
      throw badRequest("limite deve ser um inteiro de 1 a 20.");
    }
    const skills = db.prepare("SELECT * FROM skills").all();
    const courses = db.prepare("SELECT * FROM courses").all();
    res.json(proximasPrioridades(skills, courses, mes, limite));
  });

  // GET /progresso -> resumo por nível e horas estudadas
  router.get("/progresso", (req, res) => {
    const mes = lerMes(db, req.query, agora);
    const porNivel = NIVEIS.map((nivel) => {
      const r = db.prepare(`
        SELECT COUNT(*) AS total,
               SUM(status = 'Concluído') AS concluidas,
               ROUND(AVG(hoje), 1) AS media_hoje,
               ROUND(AVG(meta), 1) AS media_meta
        FROM skills WHERE nivel = ?`).get(nivel);
      return { nivel, ...r, concluidas: r.concluidas ?? 0 };
    });

    const hoje = agora();
    const seteDiasAtras = new Date(hoje.getTime() - 6 * 86400000).toISOString().slice(0, 10);
    const { minutos } = db.prepare(
      "SELECT COALESCE(SUM(minutos), 0) AS minutos FROM sessions WHERE data >= ?",
    ).get(seteDiasAtras);

    const topSkills = db.prepare(`
      SELECT sk.id, sk.nome, SUM(s.minutos) AS minutos
      FROM sessions s JOIN skills sk ON sk.id = s.skill_id
      GROUP BY sk.id ORDER BY minutos DESC LIMIT 5`).all();

    res.json({
      mes_do_plano: mes,
      por_nivel: porNivel,
      minutos_ultimos_7_dias: minutos,
      horas_ultimos_7_dias: Math.round((minutos / 60) * 10) / 10,
      habilidades_mais_estudadas: topSkills,
    });
  });

  return router;
}
