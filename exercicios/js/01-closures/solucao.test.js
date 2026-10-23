import { describe, it, expect, vi } from "vitest";
import { criarContador, criarGeradorDeId, umaVez } from "./solucao.js";

describe("criarContador", () => {
  it("começa no valor inicial (0 por padrão)", () => {
    expect(criarContador().valor()).toBe(0);
    expect(criarContador(10).valor()).toBe(10);
  });

  it("incrementa e decrementa devolvendo o novo valor", () => {
    const c = criarContador(5);
    expect(c.incrementar()).toBe(6);
    expect(c.incrementar(4)).toBe(10);
    expect(c.decrementar()).toBe(9);
    expect(c.decrementar(9)).toBe(0);
    expect(c.valor()).toBe(0);
  });

  it("guarda o estado de forma privada", () => {
    const c = criarContador(3);
    for (const valor of Object.values(c)) expect(typeof valor).toBe("function");
    c.atual = 100; // tentar "hackear" não pode mudar o contador
    expect(c.valor()).toBe(3);
  });

  it("contadores são independentes", () => {
    const a = criarContador();
    const b = criarContador();
    a.incrementar();
    a.incrementar();
    expect(a.valor()).toBe(2);
    expect(b.valor()).toBe(0);
  });
});

describe("criarGeradorDeId", () => {
  it("gera ids em sequência com o prefixo", () => {
    const proximo = criarGeradorDeId("tarefa");
    expect(proximo()).toBe("tarefa-1");
    expect(proximo()).toBe("tarefa-2");
    expect(proximo()).toBe("tarefa-3");
  });

  it("cada gerador conta sozinho", () => {
    const tarefas = criarGeradorDeId("tarefa");
    const links = criarGeradorDeId("link");
    tarefas();
    tarefas();
    expect(links()).toBe("link-1");
    expect(tarefas()).toBe("tarefa-3");
  });
});

describe("umaVez", () => {
  it("chama a função só na primeira vez, com os argumentos", () => {
    const fn = vi.fn((a, b) => a + b);
    const somarUmaVez = umaVez(fn);
    expect(somarUmaVez(2, 3)).toBe(5);
    expect(somarUmaVez(10, 10)).toBe(5);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });

  it("lembra até resultados 'falsos' como 0 e undefined", () => {
    const fn = vi.fn(() => 0);
    const f = umaVez(fn);
    expect(f()).toBe(0);
    expect(f()).toBe(0);
    expect(fn).toHaveBeenCalledTimes(1);

    const g = vi.fn(() => undefined);
    const h = umaVez(g);
    h();
    h();
    expect(g).toHaveBeenCalledTimes(1);
  });
});
