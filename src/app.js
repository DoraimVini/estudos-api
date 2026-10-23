import express from "express";
import { criarRepositorios } from "./repositories/index.js";
import { skillsRouter } from "./routes/skills.js";
import { coursesRouter } from "./routes/courses.js";
import { sessionsRouter } from "./routes/sessions.js";
import { planoRouter } from "./routes/plano.js";
import { errorHandler } from "./errors.js";

/**
 * Monta o app sem abrir porta: os testes usam esta função com um banco em memória.
 * Camadas: routes (HTTP) -> services (regras) -> repositories (SQL).
 * @param {import("node:sqlite").DatabaseSync} db
 * @param {{ agora?: () => Date }} opcoes  permite "congelar" a data nos testes
 */
export function createApp(db, opcoes = {}) {
  const repos = criarRepositorios(db);
  const app = express();
  app.use(express.json());

  const v1 = express.Router();
  v1.get("/status", (req, res) => {
    res.json({ ok: true, atualizado_em: new Date().toISOString(), banco: repos.config.versaoBanco() });
  });
  v1.use("/skills", skillsRouter(repos));
  v1.use("/courses", coursesRouter(repos));
  v1.use("/sessions", sessionsRouter(repos, opcoes));
  v1.use("/", planoRouter(repos, opcoes));

  app.use("/api/v1", v1);
  app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
  app.use(errorHandler);
  return app;
}
