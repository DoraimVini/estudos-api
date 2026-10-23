import { describe, it, expect, vi } from "vitest";
import { buscarTodos, buscarComFalhas, comTimeout, tentarDeNovo } from "./solucao.js";

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Busca falsa que registra quantas buscas rodaram ao mesmo tempo. Ids negativos falham. */
function criarBusca() {
  const estado = { ativas: 0, maximoAoMesmoTempo: 0 };
  const buscar = async (id) => {
    estado.ativas++;
    estado.maximoAoMesmoTempo = Math.max(estado.maximoAoMesmoTempo, estado.ativas);
    await esperar(10 + ((id * 7) % 5)); // tempos diferentes: a ordem de chegada muda
    estado.ativas--;
    if (id < 0) throw new Error(`id ${id} não existe`);
    return `item-${id}`;
  };
  return { buscar, estado };
}

describe("buscarTodos", () => {
  it("devolve os resultados na ordem dos ids", async () => {
    const { buscar } = criarBusca();
    expect(await buscarTodos([3, 1, 2], buscar)).toEqual(["item-3", "item-1", "item-2"]);
  });

  it("roda as buscas em paralelo", async () => {
    const { buscar, estado } = criarBusca();
    await buscarTodos([1, 2, 3, 4, 5], buscar);
    expect(estado.maximoAoMesmoTempo).toBe(5);
  });

  it("rejeita se alguma busca falhar", async () => {
    const { buscar } = criarBusca();
    await expect(buscarTodos([1, -2, 3], buscar)).rejects.toThrow("id -2 não existe");
  });

  it("lista vazia devolve lista vazia", async () => {
    expect(await buscarTodos([], criarBusca().buscar)).toEqual([]);
  });
});

describe("buscarComFalhas", () => {
  it("separa sucessos e falhas mantendo a ordem", async () => {
    const { buscar, estado } = criarBusca();
    expect(await buscarComFalhas([1, -2, 3, -4], buscar)).toEqual({
      ok: [{ id: 1, valor: "item-1" }, { id: 3, valor: "item-3" }],
      falhas: [{ id: -2, erro: "id -2 não existe" }, { id: -4, erro: "id -4 não existe" }],
    });
    expect(estado.maximoAoMesmoTempo).toBe(4);
  });
});

describe("comTimeout", () => {
  it("resolve se a promessa terminar a tempo", async () => {
    await expect(comTimeout(esperar(5).then(() => "pronto"), 100)).resolves.toBe("pronto");
  });

  it("rejeita com mensagem clara se demorar demais", async () => {
    await expect(comTimeout(esperar(200), 20)).rejects.toThrow("Tempo esgotado após 20 ms");
  });

  it("repassa o erro da própria promessa", async () => {
    const falha = esperar(5).then(() => { throw new Error("falhou antes"); });
    await expect(comTimeout(falha, 100)).rejects.toThrow("falhou antes");
  });
});

describe("tentarDeNovo", () => {
  it("devolve o primeiro sucesso", async () => {
    let chamadas = 0;
    const instavel = vi.fn(async () => {
      chamadas++;
      if (chamadas < 3) throw new Error(`falha ${chamadas}`);
      return "ok";
    });
    expect(await tentarDeNovo(instavel, 5)).toBe("ok");
    expect(instavel).toHaveBeenCalledTimes(3);
  });

  it("desiste depois do limite com o último erro", async () => {
    let chamadas = 0;
    const sempreFalha = vi.fn(async () => { throw new Error(`falha ${++chamadas}`); });
    await expect(tentarDeNovo(sempreFalha, 3)).rejects.toThrow("falha 3");
    expect(sempreFalha).toHaveBeenCalledTimes(3);
  });
});
