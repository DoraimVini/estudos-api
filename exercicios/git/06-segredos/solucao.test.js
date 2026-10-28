import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { avisoDePreparo, git, gitOuNull, linhas } from "../_treino.js";
import { treino } from "./preparar.js";

const { pasta, criado, dados } = treino();
const projeto = join(pasta, "projeto");
const naMain = () => linhas(git(projeto, "ls-tree", "-r", "--name-only", "main"));
const ignorado = (caminho) => gitOuNull(projeto, "check-ignore", "-q", caminho) !== null;

describe.runIf(criado)("git/06 · preparação", () => {
  it("cria o repositório de treino", () => {
    throw avisoDePreparo(pasta, projeto);
  });
});

describe.skipIf(criado)("git/06 · .env e node_modules fora do repositório", () => {
  it("o último commit da main não tem mais o .env nem o node_modules", () => {
    const arquivos = naMain();
    expect(arquivos, ".env ainda está no commit").not.toContain(".env");
    expect(arquivos.filter((a) => a.startsWith("node_modules/")), "node_modules ainda está no commit").toEqual([]);
  });

  it("os arquivos continuam no seu disco", () => {
    expect(existsSync(join(projeto, ".env")), ".env sumiu do disco").toBe(true);
    expect(readFileSync(join(projeto, ".env"), "utf8")).toContain(dados.segredo);
    expect(existsSync(join(projeto, "node_modules", "pacote", "index.js")), "node_modules sumiu do disco").toBe(true);
  });

  it("um .gitignore commitado impede que eles voltem", () => {
    expect(naMain(), ".gitignore não foi commitado").toContain(".gitignore");
    expect(ignorado(".env"), ".env não está ignorado").toBe(true);
    expect(ignorado("node_modules/pacote/index.js"), "node_modules não está ignorado").toBe(true);
  });

  it("o .env.example diz o nome da variável, sem o valor", () => {
    expect(naMain(), ".env.example não foi commitado").toContain(".env.example");
    const exemplo = git(projeto, "show", "main:.env.example");
    expect(exemplo).toMatch(/^API_KEY=/m);
    expect(exemplo, "o .env.example não pode ter o segredo").not.toContain(dados.segredo);
  });

  it("não sobrou nada sem commit", () => {
    expect(git(projeto, "status", "--porcelain")).toBe("");
  });
});
