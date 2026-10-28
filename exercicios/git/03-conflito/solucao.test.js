import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { avisoDePreparo, git, linhas } from "../_treino.js";
import { treino } from "./preparar.js";

const { pasta, criado, dados } = treino();
const projeto = join(pasta, "projeto");

/** Importa o config.js num Node separado, com ou sem a variável PORT, e devolve { HOST, PORTA }. */
function lerConfig(porta) {
  const env = { ...process.env };
  delete env.PORT;
  if (porta !== undefined) env.PORT = porta;
  const url = pathToFileURL(join(projeto, "config.js")).href;
  const codigo = `const c = await import(${JSON.stringify(url)}); console.log(JSON.stringify({ HOST: c.HOST, PORTA: c.PORTA }));`;
  try {
    return JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", codigo], { env, encoding: "utf8" }));
  } catch (erro) {
    throw new Error(`O config.js não roda (sobrou marcação de conflito? erro de sintaxe?):\n${erro.stderr ?? erro.message}`);
  }
}

describe.runIf(criado)("git/03 · preparação", () => {
  it("cria o repositório de treino", () => {
    throw avisoDePreparo(pasta, projeto);
  });
});

describe.skipIf(criado)("git/03 · conflito resolvido combinando os dois lados", () => {
  it("o merge foi concluído: um commit com a main e a feat/porta-env como pais", () => {
    const merges = linhas(git(projeto, "rev-list", "--merges", "main"));
    expect(merges.length, "commits de merge na main").toBe(1);
    const [, ...pais] = git(projeto, "rev-list", "--parents", "-n", "1", merges[0]).split(" ");
    expect(pais).toEqual([dados.main, dados.branch]);
  });

  it("não sobrou marcação de conflito no arquivo commitado", () => {
    expect(git(projeto, "show", "main:config.js")).not.toMatch(/^(<{7}|={7}|>{7})/m);
  });

  it("não sobrou nada sem commit", () => {
    expect(git(projeto, "status", "--porcelain")).toBe("");
  });

  it("sem a variável PORT, usa o novo padrão da main (3100)", () => {
    expect(lerConfig()).toEqual({ HOST: "localhost", PORTA: 3100 });
  });

  it("com a variável PORT, usa o valor dela (a mudança da branch)", () => {
    expect(lerConfig("4000")).toEqual({ HOST: "localhost", PORTA: 4000 });
  });
});
