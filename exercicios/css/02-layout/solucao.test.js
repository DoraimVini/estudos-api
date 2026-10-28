import { describe, it, expect } from "vitest";
import { confere } from "../_gabarito.js";
import { respostas } from "./solucao.js";

// Gabarito em hash (ver ../_gabarito.js). Cada valor foi medido num navegador.
const GABARITO = {
  flexIguais: "d7d83320b6caf0d6d535e145d7881c1ec057ad4c7019e09252e5546992114b76",
  flexDoisParaUm: "f37a69e2d27384fe1a394cbc9d8799eab36ccd98b9f206a43ec2f3e42575745b",
  flexComBase: "e3b320bc5cd814c47c5f32b64a45a24ebc5f5f48d864de557120ef7de9a29ce4",
  flexEncolhe: "84ab3e85d702a507cd64fbe13f4569e3a03aa30dd9243b30e42c88c1687d3e87",
  gridFr: "e16eae909c7cee3b183c10375bfb463df88cd80ffa21c719ef8ff8d21b3a052a",
  autoFill: "fa12123c9f374a8a57815fe6f2d2b7b75b62fa62d1790f0d76a55013c9f93eba",
  mediaQueries: "2d8b1d1d241f7d169905fe609c5bc57f4af2ab73d5f7118a3a67ecad543aee25",
  paddingEm: "74785a2364c85e2d378f9ed0bc1466eaadbde7757dbc563d2d4569c2a816c1ae",
};

const DICAS = {
  flexIguais: "desconte os gaps antes de dividir",
  flexDoisParaUm: "um gap só (entre A e B); o resto vai na proporção 2 para 1",
  flexComBase: "o que sobra depois das bases é dividido igualmente (grow 1 e 1) e somado a cada base",
  flexEncolhe: "o quanto falta é tirado na proporção shrink × base, não meio a meio",
  gridFr: "a coluna fixa e os dois gaps saem primeiro; o resto vira 3 frações",
  autoFill: "quantas colunas de pelo menos 200px cabem? Depois o 1fr estica todas igualmente",
  mediaQueries: "min-width quer dizer 'a partir de'; 1000px já conta para a de 1000",
  paddingEm: "em no padding usa a fonte do próprio elemento, que já é 2rem",
};

describe("css/02 · calcule o layout", () => {
  for (const pergunta of Object.keys(GABARITO)) {
    it(pergunta, () => {
      const resposta = respostas[pergunta];
      expect(resposta ?? null, `${pergunta}: ainda sem resposta`).not.toBe(null);
      expect(confere(pergunta, resposta, GABARITO[pergunta]), `${pergunta}: ${JSON.stringify(resposta)} não confere. Dica: ${DICAS[pergunta]}`).toBe(true);
    });
  }
});
