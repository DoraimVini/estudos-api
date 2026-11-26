import type { ErrorRequestHandler } from "express";

export class HttpError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} não encontrado(a).`);
export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details);

// Middleware final: toda resposta de erro sai no mesmo formato JSON.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ erro: err.message, detalhes: err.details });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ erro: "JSON inválido no corpo da requisição." });
    return;
  }
  console.error(err);
  res.status(500).json({ erro: "Erro interno." });
};
