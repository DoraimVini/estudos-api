import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarPrioridade, validarStatus, somenteCampos } from "../validators.js";

export function coursesRouter(repos) {
  const router = Router();

  // GET /courses?prioridade=Alta&status=Não iniciado
  router.get("/", (req, res) => {
    const { prioridade, status } = req.query;
    validarPrioridade(prioridade);
    validarStatus(status);
    res.json(repos.courses.listar({ prioridade, status }));
  });

  router.get("/:id", (req, res) => {
    const course = repos.courses.buscar(parseId(req.params.id));
    if (!course) throw notFound("Curso");
    res.json(course);
  });

  // PATCH /courses/:id  { "status": "Concluído" }
  router.patch("/:id", (req, res) => {
    const id = parseId(req.params.id);
    const body = req.body ?? {};
    somenteCampos(body, ["status", "prioridade"]);
    if (!Object.keys(body).length) throw badRequest("Envie status e/ou prioridade.");
    validarStatus(body.status);
    validarPrioridade(body.prioridade);

    const course = repos.courses.atualizar(id, body);
    if (!course) throw notFound("Curso");
    res.json(course);
  });

  return router;
}
