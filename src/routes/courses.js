import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarPrioridade, validarStatus, somenteCampos } from "../validators.js";

export function coursesRouter(db) {
  const router = Router();

  // GET /courses?prioridade=Alta&status=Não iniciado
  router.get("/", (req, res) => {
    const { prioridade, status } = req.query;
    validarPrioridade(prioridade);
    validarStatus(status);

    const filtros = [];
    const params = [];
    if (prioridade) { filtros.push("prioridade = ?"); params.push(prioridade); }
    if (status) { filtros.push("status = ?"); params.push(status); }
    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    res.json(db.prepare(`SELECT * FROM courses ${where} ORDER BY mes_inicio, id`).all(...params));
  });

  router.get("/:id", (req, res) => {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(parseId(req.params.id));
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

    const atual = db.prepare("SELECT * FROM courses WHERE id = ?").get(id);
    if (!atual) throw notFound("Curso");
    const novo = { ...atual, ...body };
    db.prepare("UPDATE courses SET status = ?, prioridade = ? WHERE id = ?")
      .run(novo.status, novo.prioridade, id);
    res.json(db.prepare("SELECT * FROM courses WHERE id = ?").get(id));
  });

  return router;
}
