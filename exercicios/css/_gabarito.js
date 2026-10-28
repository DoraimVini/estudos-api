// Gabarito dos exercícios de CSS guardado só como hash: o teste fica visível para você, e a resposta
// em texto puro estragaria o exercício. O hash compara sem revelar. O nome da pergunta entra no hash
// para que duas perguntas com a mesma resposta não fiquem com o mesmo hash (isso também seria uma dica).
import { createHash } from "node:crypto";

/** Deixa respostas equivalentes iguais: "250px" = 250, " (1, 2, 2) " = "1,2,2", "Green" = "green". */
export function normalizar(valor) {
  if (Array.isArray(valor)) return valor.map(normalizar).join("|");
  if (typeof valor === "number") return String(Math.round(valor * 100) / 100);
  const texto = String(valor ?? "").toLowerCase().replace(/[\s()]/g, "").replace(/px$/, "");
  return /^-?\d+(\.\d+)?$/.test(texto) ? normalizar(Number(texto)) : texto;
}

export const hash = (pergunta, valor) =>
  createHash("sha256").update(`estudos-api:${pergunta}:${normalizar(valor)}`).digest("hex");

/** A resposta confere com o gabarito? (null ou undefined = ainda não respondida) */
export const confere = (pergunta, resposta, gabarito) =>
  resposta !== null && resposta !== undefined && hash(pergunta, resposta) === gabarito;
