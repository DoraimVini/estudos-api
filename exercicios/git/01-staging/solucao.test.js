import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { avisoDePreparo, git, linhas } from "../_treino.js";
import { treino } from "./preparar.js";

const { pasta, criado } = treino();
const projeto = join(pasta, "projeto");

describe.runIf(criado)("git/01 · preparação", () => {
  it("cria o repositório de treino", () => {
    throw avisoDePreparo(pasta, projeto);
  });
});

describe.skipIf(criado)("git/01 · um commit só com a correção", () => {
  it("a main tem exatamente um commit novo, e ele só mexe no calc.js", () => {
    expect(Number(git(projeto, "rev-list", "--count", "main")), "commits na main (o inicial + o seu)").toBe(2);
    expect(linhas(git(projeto, "show", "--name-only", "--format=", "main")), "arquivos do seu commit").toEqual(["calc.js"]);
  });

  it("o commit leva a soma corrigida", () => {
    expect(git(projeto, "show", "main:calc.js")).toContain("a + b");
  });

  it("a mensagem diz o que mudou", () => {
    const mensagem = git(projeto, "log", "-1", "--format=%s", "main");
    expect(mensagem.length, `mensagem curta demais: "${mensagem}"`).toBeGreaterThanOrEqual(10);
    expect(["fix", "update", "wip", "ajustes", "mudanças", "commit"]).not.toContain(mensagem.toLowerCase());
  });

  it("a staging area ficou vazia", () => {
    expect(git(projeto, "diff", "--cached", "--name-only"), "arquivos ainda na staging").toBe("");
  });

  it("notas.txt continua modificado no disco, fora do commit", () => {
    expect(git(projeto, "status", "--porcelain", "--", "notas.txt"), "notas.txt deveria aparecer como modificado").toBe("M notas.txt");
    expect(readFileSync(join(projeto, "notas.txt"), "utf8"), "a sua anotação foi descartada").toContain("- staging");
  });

  it("rascunho.txt continua no disco e fora do repositório", () => {
    expect(existsSync(join(projeto, "rascunho.txt")), "rascunho.txt sumiu do disco").toBe(true);
    expect(git(projeto, "ls-files", "--", "rascunho.txt"), "rascunho.txt foi commitado").toBe("");
  });
});
