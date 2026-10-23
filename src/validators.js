import { badRequest } from "./errors.js";
import { NIVEIS, PRIORIDADES, STATUS, STATUS_TOPICO } from "./constantes.js";

export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw badRequest("id deve ser um inteiro positivo.");
  return id;
}

export function validarStatus(status) {
  if (status !== undefined && !STATUS.includes(status)) {
    throw badRequest(`status inválido. Use: ${STATUS.join(", ")}.`);
  }
}

export function validarStatusTopico(status) {
  if (status !== undefined && !STATUS_TOPICO.includes(status)) {
    throw badRequest(`status inválido para tópico. Use: ${STATUS_TOPICO.join(", ")}.`);
  }
}

export function validarNivel(nivel) {
  if (nivel !== undefined && !NIVEIS.includes(nivel)) {
    throw badRequest(`nivel inválido. Use: ${NIVEIS.join(", ")}.`);
  }
}

export function validarPrioridade(p) {
  if (p !== undefined && !PRIORIDADES.includes(p)) {
    throw badRequest(`prioridade inválida. Use: ${PRIORIDADES.join(", ")}.`);
  }
}

export function validarNota(campo, valor, { permiteNull = false } = {}) {
  if (valor === undefined) return;
  if (valor === null && permiteNull) return;
  if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
    throw badRequest(`${campo} deve ser um inteiro de 1 a 5${permiteNull ? " ou null" : ""}.`);
  }
}

export function validarData(campo, valor) {
  if (valor === undefined) return;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) {
    throw badRequest(`${campo} deve estar no formato AAAA-MM-DD.`);
  }
}

/** Garante que o corpo só tem campos conhecidos (evita erros de digitação silenciosos). */
export function somenteCampos(body, permitidos) {
  const extras = Object.keys(body ?? {}).filter((k) => !permitidos.includes(k));
  if (extras.length) throw badRequest(`Campos não permitidos: ${extras.join(", ")}.`);
}
