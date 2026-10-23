import express from "express";
import { skillsRouter } from "./routes/skills.js";
import { coursesRouter } from "./routes/courses.js";
import { sessionsRouter } from "./routes/sessions.js";
import { planoRouter } from "./routes/plano.js";
import { errorHandler } from "./errors.js";

/**
 * Monta o app sem abrir porta: os testes usam esta função com um banco em memória.
 * @param {import("node:sqlite").DatabaseSync} db
 * @param {{ agora?: () => Date }} opcoes  permite "congelar" a data nos testes
 */
export function createApp(db, opcoes = {}) {
  const app = express();
  app.use(express.json());

  const v1 = express.Router();
  v1.get("/status", (req, res) => {
    const { versao } = db.prepare("SELECT sqlite_version() AS versao").get();
    res.json({ ok: true, atualizado_em: new Date().toISOString(), banco: { sqlite: versao } });
  });
  v1.use("/skills", skillsRouter(db));
  v1.use("/courses", coursesRouter(db));
  v1.use("/sessions", sessionsRouter(db));
  v1.use("/", planoRouter(db, opcoes));

  app.use("/api/v1", v1);
  app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
  app.use(errorHandler);
  return app;
}
