import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { avisoDePreparo, git, gitOuNull, linhas } from "../_treino.js";
import { treino } from "./preparar.js";

const { pasta, criado, dados } = treino();
const projeto = join(pasta, "projeto");
const remoto = join(pasta, "remoto.git");

describe.runIf(criado)("git/04 · preparação", () => {
  it("cria o repositório de treino", () => {
    throw avisoDePreparo(pasta, projeto);
  });
});

describe.skipIf(criado)("git/04 · push, fetch e prune", () => {
  it("a feat/anotacoes está no remoto, com o seu commit", () => {
    expect(gitOuNull(remoto, "rev-parse", "--verify", "-q", "refs/heads/feat/anotacoes"), "a branch não chegou ao remoto")
      .toBe(dados.sua);
  });

  it("a feat/anotacoes local rastreia a remota (o próximo push não precisa de argumentos)", () => {
    expect(gitOuNull(projeto, "rev-parse", "--abbrev-ref", "feat/anotacoes@{upstream}"), "upstream da feat/anotacoes")
      .toBe("origin/feat/anotacoes");
  });

  it("a sua main local recebeu o commit da colega, sem commit de merge", () => {
    expect(git(projeto, "rev-parse", "main"), "a main local deveria estar no commit da colega").toBe(dados.daColega);
    expect(linhas(git(projeto, "rev-list", "--merges", "main")), "commits de merge na main").toEqual([]);
  });

  it("a main do remoto continua no commit da colega (você não enviou nada para ela)", () => {
    expect(git(remoto, "rev-parse", "refs/heads/main")).toBe(dados.daColega);
  });

  it("a referência velha origin/feat/velha foi limpa", () => {
    expect(gitOuNull(projeto, "rev-parse", "--verify", "-q", "refs/remotes/origin/feat/velha"), "origin/feat/velha ainda aparece")
      .toBe(null);
  });
});
