export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what) => new HttpError(404, `${what} não encontrado(a).`);
export const badRequest = (message, details) => new HttpError(400, message, details);

// Middleware final: toda resposta de erro sai no mesmo formato JSON.
export function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message, detalhes: err.details });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição." });
  }
  console.error(err);
  return res.status(500).json({ erro: "Erro interno." });
}
