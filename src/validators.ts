import { badRequest } from "./errors.ts";
import { NIVEIS, PRIORIDADES, STATUS, STATUS_TOPICO, STATUS_EXERCICIO } from "./constantes.ts";

// Os valores chegam de fora (query string ou JSON), então entram como "unknown":
// o TypeScript obriga a conferir antes de usar. Cada validador que passa sem lançar erro
// "promete" o tipo certo daí em diante (asserts), e quem chama já recebe o valor estreitado.

export function parseId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw badRequest("id deve ser um inteiro positivo.");
  return id;
}

/** Confere se valor é undefined ou um dos itens da lista. */
function validarLista<T extends string>(
  valor: unknown, lista: readonly T[], mensagem: string,
): asserts valor is T | undefined {
  if (valor !== undefined && !lista.includes(valor as T)) {
    throw badRequest(`${mensagem} Use: ${lista.join(", ")}.`);
  }
}

export function validarStatus(status: unknown): asserts status is (typeof STATUS)[number] | undefined {
  validarLista(status, STATUS, "status inválido.");
}

export function validarStatusTopico(status: unknown): asserts status is (typeof STATUS_TOPICO)[number] | undefined {
  validarLista(status, STATUS_TOPICO, "status inválido para tópico.");
}

export function validarStatusExercicio(
  status: unknown,
): asserts status is (typeof STATUS_EXERCICIO)[number] | undefined {
  validarLista(status, STATUS_EXERCICIO, "status inválido para exercício.");
}

export function validarNivel(nivel: unknown): asserts nivel is (typeof NIVEIS)[number] | undefined {
  validarLista(nivel, NIVEIS, "nivel inválido.");
}

export function validarPrioridade(p: unknown): asserts p is (typeof PRIORIDADES)[number] | undefined {
  validarLista(p, PRIORIDADES, "prioridade inválida.");
}

export function validarNota(
  campo: string, valor: unknown, { permiteNull = false } = {},
): asserts valor is number | null | undefined {
  if (valor === undefined) return;
  if (valor === null && permiteNull) return;
  if (!Number.isInteger(valor) || (valor as number) < 1 || (valor as number) > 5) {
    throw badRequest(`${campo} deve ser um inteiro de 1 a 5${permiteNull ? " ou null" : ""}.`);
  }
}

export function validarData(campo: string, valor: unknown): asserts valor is string | undefined {
  if (valor === undefined) return;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) {
    throw badRequest(`${campo} deve estar no formato AAAA-MM-DD.`);
  }
}

/** Texto opcional vindo da query string (?area=Backend). Repetido (?area=a&area=b) é erro. */
export function textoOpcional(campo: string, valor: unknown): string | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== "string") throw badRequest(`${campo} deve aparecer uma vez só.`);
  return valor;
}

/** Garante que o corpo só tem campos conhecidos (evita erros de digitação silenciosos). */
export function somenteCampos(body: object, permitidos: readonly string[]): void {
  const extras = Object.keys(body).filter((k) => !permitidos.includes(k));
  if (extras.length) throw badRequest(`Campos não permitidos: ${extras.join(", ")}.`);
}
