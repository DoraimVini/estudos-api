import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarData, somenteCampos } from "../validators.js";
import { hojeISO } from "../datas.js";

export function sessionsRouter(repos, { agora = () => new Date() } = {}) {
  const router = Router();

  // GET /sessions?de=2026-11-01&ate=2026-11-30
  router.get("/", (req, res) => {
    const { de, ate } = req.query;
    validarData("de", de);
    validarData("ate", ate);
    res.json(repos.sessions.listar({ de, ate }));
  });

  // POST /sessions  { "skill_id": 3, "minutos": 50, "data": "2026-11-03", "notas": "..." }
  router.post("/", (req, res) => {
    const body = req.body ?? {};
    somenteCampos(body, ["skill_id", "course_id", "data", "minutos", "notas"]);
    const { notas } = body;
    const data = body.data ?? hojeISO(agora());

    if (body.skill_id == null && body.course_id == null) {
      throw badRequest("Informe skill_id e/ou course_id.");
    }
    const skill_id = body.skill_id == null ? null : parseId(body.skill_id);
    const course_id = body.course_id == null ? null : parseId(body.course_id);
    if (!Number.isInteger(body.minutos) || body.minutos <= 0 || body.minutos > 24 * 60) {
      throw badRequest("minutos deve ser um inteiro entre 1 e 1440.");
    }
    validarData("data", data);
    if (notas != null && typeof notas !== "string") throw badRequest("notas deve ser texto.");

    if (skill_id != null && !repos.skills.existe(skill_id)) throw notFound("Habilidade");
    if (course_id != null && !repos.courses.existe(course_id)) throw notFound("Curso");

    const sessao = repos.sessions.criar({ skill_id, course_id, data, minutos: body.minutos, notas: notas ?? null });
    res.status(201).json(sessao);
  });

  router.delete("/:id", (req, res) => {
    if (!repos.sessions.apagar(parseId(req.params.id))) throw notFound("Sessão");
    res.status(204).end();
  });

  return router;
}
