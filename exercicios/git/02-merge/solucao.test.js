import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { avisoDePreparo, git, gitOuNull, linhas } from "../_treino.js";
import { treino } from "./preparar.js";

const { pasta, criado, dados } = treino();
const projeto = join(pasta, "projeto");
const existe = (ref) => gitOuNull(projeto, "rev-parse", "--verify", "-q", ref) !== null;
const ehAncestral = (commit) => gitOuNull(projeto, "merge-base", "--is-ancestor", commit, "main") !== null;

describe.runIf(criado)("git/02 · preparação", () => {
  it("cria o repositório de treino", () => {
    throw avisoDePreparo(pasta, projeto);
  });
});

describe.skipIf(criado)("git/02 · fast-forward e commit de merge", () => {
  it("os commits das duas branches chegaram à main, sem rebase", () => {
    // Rebase cria commits novos (outros hashes): os originais deixariam de estar na main.
    expect(ehAncestral(dados.rodape), "o commit do rodapé não está na main").toBe(true);
    for (const commit of dados.cabecalho) {
      expect(ehAncestral(commit), `o commit ${commit.slice(0, 7)} do cabeçalho não está na main (rebase ou squash?)`).toBe(true);
    }
  });

  it("o rodapé entrou por fast-forward: a main andou até o commit dele", () => {
    const linhaPrincipal = linhas(git(projeto, "rev-list", "--first-parent", "main"));
    expect(linhaPrincipal, "a feat/rodape podia entrar sem commit de merge").toContain(dados.rodape);
  });

  it("o cabeçalho entrou com um commit de merge (o único da main)", () => {
    const merges = linhas(git(projeto, "rev-list", "--merges", "main"));
    expect(merges.length, "quantidade de commits de merge na main").toBe(1);
    const [, primeiroPai, segundoPai] = git(projeto, "rev-list", "--parents", "-n", "1", merges[0]).split(" ");
    expect(primeiroPai, "o merge deveria partir da main já com o rodapé").toBe(dados.rodape);
    expect(segundoPai, "o merge deveria trazer a ponta da feat/cabecalho").toBe(dados.cabecalho[1]);
  });

  it("as branches integradas foram apagadas", () => {
    expect(existe("refs/heads/feat/rodape"), "feat/rodape ainda existe").toBe(false);
    expect(existe("refs/heads/feat/cabecalho"), "feat/cabecalho ainda existe").toBe(false);
  });

  it("não sobrou nada sem commit", () => {
    expect(git(projeto, "status", "--porcelain")).toBe("");
  });
});
