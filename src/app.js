import express from "express";
import { fileURLToPath } from "node:url";
import { criarRepositorios } from "./repositories/index.js";
import { skillsRouter } from "./routes/skills.js";
import { coursesRouter } from "./routes/courses.js";
import { sessionsRouter } from "./routes/sessions.js";
import { planoRouter } from "./routes/plano.js";
import { trilhaRouter } from "./routes/trilha.js";
import { exerciciosRouter } from "./routes/exercicios.js";
import { errorHandler } from "./errors.js";

// Painel web (HTML, CSS e JS puros) servido na raiz: http://localhost:3000
const PUBLICO = fileURLToPath(new URL("../public", import.meta.url));
// Biblioteca de Markdown usada pela página de tópico, servida direto do node_modules (sem build).
const MARKED = fileURLToPath(new URL("../node_modules/marked/lib", import.meta.url));

/**
 * Monta o app sem abrir porta: os testes usam esta função com um banco em memória.
 * Camadas: routes (HTTP) -> services (regras) -> repositories (SQL).
 * @param {import("node:sqlite").DatabaseSync} db
 * @param {{ agora?: () => Date }} opcoes  permite "congelar" a data nos testes
 */
export function createApp(db, opcoes = {}) {
  const repos = criarRepositorios(db);
  const app = express();
  app.use(express.static(PUBLICO));
  app.use("/vendor/marked", express.static(MARKED));
  app.use(express.json());

  const v1 = express.Router();
  v1.get("/status", (req, res) => {
    res.json({ ok: true, atualizado_em: new Date().toISOString(), banco: repos.config.versaoBanco() });
  });
  v1.use("/skills", skillsRouter(repos));
  v1.use("/courses", coursesRouter(repos));
  v1.use("/sessions", sessionsRouter(repos, opcoes));
  v1.use("/exercicios", exerciciosRouter(repos));
  v1.use("/", planoRouter(repos, opcoes));
  v1.use("/", trilhaRouter(repos, opcoes));

  app.use("/api/v1", v1);
  app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
  app.use(errorHandler);
  return app;
}
