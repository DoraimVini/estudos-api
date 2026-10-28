import { describe, it, expect } from "vitest";
import { confere } from "../_gabarito.js";
import { respostas } from "./solucao.js";

// Gabarito em hash (ver ../_gabarito.js). Cada valor foi conferido num navegador.
const GABARITO = {
  cor1: "bf0f46553efee7462ac1882a1a402a4ff2498e14d365d9bfb3bdf5a0713eeaf0",
  cor2: "fceec0774d46279f29ac1e15659d782010238b51cbdec3955318f25e1864ad47",
  cor3: "4e25562b9959c61b07f67adf4688254f4be62ebbecbdd393c610392aec14ecd1",
  cor4: "86876254a09decdd609171eafead563403b0d6cfa0a3c6ab06a5747d5162d62d",
  cor5: "1f2f12258d59ba789e41515c929116e57ec3f80ea0300c8422586042ef96b5c1",
  especificidade: "2d442fb3bc28e16f1265610e7d79b0fb9bf374143d0f293ccedbbfbf644ee83a",
  larguraContentBox: "f494b40a4503987291d19e10a48421053933a56da6ed84c5c1108be2b734b962",
  conteudoBorderBox: "b7de3adac67085df6cf94537577cc8ed1a9b3552566723b4d773d9067e4696ef",
  espacoEntreBlocos: "e728f1da6061a652a8d17a6cb5395c21ed280656273f81e311aea9df9ea5537c",
};

const DICAS = {
  cor1: "compare o placar (ids, classes, tipos) das três regras",
  cor2: "as duas regras têm o mesmo placar: o que desempata?",
  cor3: "a ordem só desempata quando o placar é igual",
  cor4: "o que !important faz com a especificidade?",
  cor5: "alguma regra pega o <p> diretamente? E um valor herdado tem especificidade?",
  especificidade: "pseudo-classe conta como classe; pseudo-elemento conta como tipo; o > não conta",
  larguraContentBox: "no content-box, padding e borda somam por fora do width (dos dois lados)",
  conteudoBorderBox: "no border-box, o width já inclui padding e borda",
  espacoEntreBlocos: "margens verticais vizinhas colapsam",
};

describe("css/01 · preveja a cascata e o box model", () => {
  for (const pergunta of Object.keys(GABARITO)) {
    it(pergunta, () => {
      const resposta = respostas[pergunta];
      expect(resposta ?? null, `${pergunta}: ainda sem resposta`).not.toBe(null);
      expect(confere(pergunta, resposta, GABARITO[pergunta]), `${pergunta}: "${resposta}" não confere. Dica: ${DICAS[pergunta]}`).toBe(true);
    });
  }
});
