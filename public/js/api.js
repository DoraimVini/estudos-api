// Cliente da API. Todas as páginas falam com o servidor por aqui.
const BASE = "/api/v1";

/**
 * Faz a requisição e devolve o JSON. Erros da API ({ erro }) viram exceções com a mensagem dela.
 * @param {string} caminho ex.: "/proximo"
 * @param {{ metodo?: string, corpo?: object }} opcoes
 */
export async function api(caminho, { metodo = "GET", corpo } = {}) {
  const resposta = await fetch(BASE + caminho, {
    method: metodo,
    headers: corpo ? { "Content-Type": "application/json" } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new Error(dados?.erro ?? `Erro ${resposta.status} em ${caminho}`);
  return dados;
}

export const buscar = (caminho) => api(caminho);
export const criar = (caminho, corpo) => api(caminho, { metodo: "POST", corpo });
export const atualizar = (caminho, corpo) => api(caminho, { metodo: "PATCH", corpo });
export const apagar = (caminho) => api(caminho, { metodo: "DELETE" });
