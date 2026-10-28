import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { avisoDePreparo, git, gitOuNull } from "../_treino.js";
import { treino } from "./preparar.js";

const { pasta, criado, dados } = treino();
const projeto = join(pasta, "projeto");
const remoto = join(pasta, "remoto.git");

describe.runIf(criado)("git/05 · preparação", () => {
  it("cria o repositório de treino", () => {
    throw avisoDePreparo(pasta, projeto);
  });
});

describe.skipIf(criado)("git/05 · revert e reflog", () => {
  it("o histórico já enviado continua intacto (nada de reset ou rebase)", () => {
    for (const commit of dados.historico) {
      const naMain = gitOuNull(projeto, "merge-base", "--is-ancestor", commit, "main") !== null;
      expect(naMain, `o commit ${commit.slice(0, 7)} sumiu da main: o histórico foi reescrito`).toBe(true);
    }
  });

  it("o config.json voltou, com o conteúdo original", () => {
    expect(gitOuNull(projeto, "show", "main:config.json"), "config.json na main").toBe(dados.config.trim());
  });

  it("o trabalho bom depois do erro continua lá", () => {
    expect(git(projeto, "show", "main:tarefas.txt")).toContain("praticar inglês");
  });

  it("a correção foi enviada: a main do remoto é igual à sua", () => {
    expect(git(remoto, "rev-parse", "refs/heads/main")).toBe(git(projeto, "rev-parse", "main"));
  });

  it("o commit perdido foi resgatado na branch resgate", () => {
    expect(gitOuNull(projeto, "rev-parse", "--verify", "-q", "refs/heads/resgate"), "branch resgate").toBe(dados.perdido);
  });

  it("não sobrou nada sem commit", () => {
    expect(git(projeto, "status", "--porcelain")).toBe("");
  });
});
