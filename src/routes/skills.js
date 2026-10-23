import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarNivel, validarNota, validarStatus, somenteCampos } from "../validators.js";

export function skillsRouter(db) {
  const router = Router();

  // GET /skills?nivel=Júnior&status=Em andamento&area=Backend
  router.get("/", (req, res) => {
    const { nivel, status, area } = req.query;
    validarNivel(nivel);
    validarStatus(status);

    const filtros = [];
    const params = [];
    if (nivel) { filtros.push("nivel = ?"); params.push(nivel); }
    if (status) { filtros.push("status = ?"); params.push(status); }
    if (area) { filtros.push("area = ?"); params.push(area); }

    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
    const rows = db.prepare(`SELECT * FROM skills ${where} ORDER BY id`).all(...params);
    res.json(rows);
  });

  router.get("/:id", (req, res) => {
    const skill = db.prepare("SELECT * FROM skills WHERE id = ?").get(parseId(req.params.id));
    if (!skill) throw notFound("Habilidade");
    res.json(skill);
  });

  // PATCH /skills/:id  { "hoje": 3, "status": "Em andamento" }
  router.patch("/:id", (req, res) => {
    const id = parseId(req.params.id);
    const body = req.body ?? {};
    somenteCampos(body, ["hoje", "meta", "status"]);
    if (!Object.keys(body).length) throw badRequest("Envie ao menos um campo: hoje, meta ou status.");
    validarNota("hoje", body.hoje, { permiteNull: true });
    validarNota("meta", body.meta);
    validarStatus(body.status);

    const atual = db.prepare("SELECT * FROM skills WHERE id = ?").get(id);
    if (!atual) throw notFound("Habilidade");

    const novo = { ...atual, ...body };
    db.prepare("UPDATE skills SET hoje = ?, meta = ?, status = ? WHERE id = ?")
      .run(novo.hoje, novo.meta, novo.status, id);
    res.json(db.prepare("SELECT * FROM skills WHERE id = ?").get(id));
  });

  return router;
}
