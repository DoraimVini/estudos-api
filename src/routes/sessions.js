import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarData, somenteCampos } from "../validators.js";

const hojeISO = () => new Date().toISOString().slice(0, 10);

export function sessionsRouter(db) {
  const router = Router();

  // GET /sessions?de=2026-11-01&ate=2026-11-30
  router.get("/", (req, res) => {
    const { de, ate } = req.query;
    validarData("de", de);
    validarData("ate", ate);
    const rows = db.prepare(`
      SELECT s.*, sk.nome AS skill_nome, c.nome AS course_nome
      FROM sessions s
      LEFT JOIN skills sk ON sk.id = s.skill_id
      LEFT JOIN courses c ON c.id = s.course_id
      WHERE s.data >= ? AND s.data <= ?
      ORDER BY s.data DESC, s.id DESC`).all(de ?? "0000-01-01", ate ?? "9999-12-31");
    res.json(rows);
  });

  // POST /sessions  { "skill_id": 3, "minutos": 50, "data": "2026-11-03", "notas": "..." }
  router.post("/", (req, res) => {
    const body = req.body ?? {};
    somenteCampos(body, ["skill_id", "course_id", "data", "minutos", "notas"]);
    const { notas } = body;
    const data = body.data ?? hojeISO();

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

    if (skill_id != null && !db.prepare("SELECT 1 FROM skills WHERE id = ?").get(skill_id)) {
      throw notFound("Habilidade");
    }
    if (course_id != null && !db.prepare("SELECT 1 FROM courses WHERE id = ?").get(course_id)) {
      throw notFound("Curso");
    }

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO sessions (skill_id, course_id, data, minutos, notas) VALUES (?, ?, ?, ?, ?)`)
      .run(skill_id, course_id, data, body.minutos, notas ?? null);

    res.status(201).json(db.prepare("SELECT * FROM sessions WHERE id = ?").get(lastInsertRowid));
  });

  router.delete("/:id", (req, res) => {
    const { changes } = db.prepare("DELETE FROM sessions WHERE id = ?").run(parseId(req.params.id));
    if (!changes) throw notFound("Sessão");
    res.status(204).end();
  });

  return router;
}
