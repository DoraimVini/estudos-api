import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarNivel, validarNota, validarStatus, somenteCampos } from "../validators.js";

export function skillsRouter(repos) {
  const router = Router();

  // GET /skills?nivel=Júnior&status=Em andamento&area=Backend
  router.get("/", (req, res) => {
    const { nivel, status, area } = req.query;
    validarNivel(nivel);
    validarStatus(status);
    res.json(repos.skills.listar({ nivel, status, area }));
  });

  router.get("/:id", (req, res) => {
    const skill = repos.skills.buscar(parseId(req.params.id));
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

    const skill = repos.skills.atualizar(id, body);
    if (!skill) throw notFound("Habilidade");
    res.json(skill);
  });

  return router;
}
