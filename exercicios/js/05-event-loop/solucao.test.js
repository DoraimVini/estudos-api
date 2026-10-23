import { describe, it, expect } from "vitest";
import { ordem1, ordem2, ordem3 } from "./solucao.js";

// Executa um trecho e devolve as mensagens na ordem real em que foram registradas.
// Espera tempo suficiente para todos os setTimeout rodarem.
async function executar(trecho) {
  const registro = [];
  trecho((mensagem) => registro.push(mensagem));
  await new Promise((resolve) => setTimeout(resolve, 50));
  return registro;
}

// Os mesmos trechos do README.
const trecho1 = (log) => {
  log("A");
  setTimeout(() => log("B"), 0);
  Promise.resolve().then(() => log("C"));
  log("D");
};

const trecho2 = (log) => {
  async function f() {
    log("1");
    await null;
    log("2");
  }
  log("3");
  f();
  log("4");
};

const trecho3 = (log) => {
  setTimeout(() => log("timeout"));
  queueMicrotask(() => log("micro"));
  Promise.resolve()
    .then(() => {
      log("then1");
      setTimeout(() => log("timeout2"));
    })
    .then(() => log("then2"));
  log("sync");
};

describe("previsões do event loop", () => {
  it("você preencheu as três previsões", () => {
    for (const ordem of [ordem1, ordem2, ordem3]) expect(ordem.length).toBeGreaterThan(0);
  });

  it("trecho 1", async () => {
    expect(ordem1).toEqual(await executar(trecho1));
  });

  it("trecho 2", async () => {
    expect(ordem2).toEqual(await executar(trecho2));
  });

  it("trecho 3", async () => {
    expect(ordem3).toEqual(await executar(trecho3));
  });
});
