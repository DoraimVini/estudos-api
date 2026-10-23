// Leia o README.md desta pasta. Substitua cada "throw" pela sua implementação.

export function registrarRequisicoes(log) {
  throw new Error("TODO: implemente registrarRequisicoes");
}

export function exigirJson(req, res, next) {
  throw new Error("TODO: implemente exigirJson");
}

export function naoEncontrado(req, res) {
  throw new Error("TODO: implemente naoEncontrado");
}

// Os quatro parâmetros são obrigatórios: é assim que o Express reconhece um middleware de erro.
export function tratarErros(err, req, res, next) {
  throw new Error("TODO: implemente tratarErros");
}
