// Ferramentas dos exercícios de Git. Em Git não há função para testar: cada exercício prepara um
// repositório de treino numa situação conhecida, você resolve com comandos git de verdade, e o teste
// confere o estado em que o repositório ficou.
//
// Os repositórios de treino ficam FORA deste projeto, em ..\treino-git\ (ao lado da pasta estudos-api):
// um repositório dentro do outro confunde o Git, e um comando no lugar errado mexeria no estudos-api.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Pasta dos repositórios de treino. TREINO_GIT troca o lugar (usado para testar os próprios exercícios). */
export const RAIZ_TREINO = process.env.TREINO_GIT ?? fileURLToPath(new URL("../../../treino-git/", import.meta.url));

/** Roda um comando git na pasta e devolve a saída sem espaços nas pontas. Falha se o git falhar. */
export function git(pasta, ...args) {
  return execFileSync("git", args, {
    cwd: pasta,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  }).trim();
}

/** Como git(), mas não falha: devolve null quando o comando dá erro (ex.: uma branch que não existe). */
export function gitOuNull(pasta, ...args) {
  try {
    return git(pasta, ...args);
  } catch {
    return null;
  }
}

/** Linhas de uma saída (sem linhas vazias). */
export const linhas = (texto) => (texto ? texto.split("\n").map((l) => l.trimEnd()).filter(Boolean) : []);

/** Cria um repositório novo com a branch main e uma identidade própria do treino. */
export function novoRepo(pasta, { bare = false } = {}) {
  mkdirSync(pasta, { recursive: true });
  git(pasta, "init", "-q", "-b", "main", ...(bare ? ["--bare"] : []));
  if (!bare) {
    git(pasta, "config", "user.name", "Treino");
    git(pasta, "config", "user.email", "treino@exemplo.invalid");
    // Sem conversão de fim de linha: o conteúdo dos arquivos fica igual em qualquer máquina.
    git(pasta, "config", "core.autocrlf", "false");
    git(pasta, "config", "commit.gpgsign", "false");
  }
  return pasta;
}

/** Escreve arquivos ({ "caminho/arquivo.txt": "conteúdo" }), criando as pastas que faltarem. */
export function escrever(pasta, arquivos) {
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    const caminho = join(pasta, nome);
    mkdirSync(dirname(caminho), { recursive: true });
    writeFileSync(caminho, conteudo);
  }
}

/** Escreve os arquivos, adiciona tudo e faz um commit. Devolve o hash do commit. */
export function commitar(pasta, arquivos, mensagem) {
  escrever(pasta, arquivos);
  git(pasta, "add", "-A");
  git(pasta, "commit", "-q", "-m", mensagem);
  return git(pasta, "rev-parse", "HEAD");
}

/**
 * Prepara o treino de um exercício, só na primeira vez.
 * `preparar(pasta)` monta os repositórios e devolve os dados que o teste vai precisar (hashes etc.);
 * eles ficam em <pasta>/.treino.json, fora dos repositórios, para não aparecerem no git status.
 * @returns {{ pasta: string, criado: boolean, dados: object }}
 */
export function prepararTreino(nome, preparar) {
  const pasta = join(RAIZ_TREINO, nome);
  const arquivoDados = join(pasta, ".treino.json");
  if (existsSync(arquivoDados)) {
    return { pasta, criado: false, dados: JSON.parse(readFileSync(arquivoDados, "utf8")) };
  }
  if (existsSync(pasta)) {
    throw new Error(`A pasta ${pasta} existe, mas não foi criada por este exercício (falta .treino.json). Apague-a e rode de novo.`);
  }
  mkdirSync(pasta, { recursive: true });
  try {
    const dados = preparar(pasta) ?? {};
    writeFileSync(arquivoDados, JSON.stringify(dados, null, 2));
    return { pasta, criado: true, dados };
  } catch (erro) {
    rmSync(pasta, { recursive: true, force: true }); // não deixa um treino pela metade
    throw erro;
  }
}

/** Mensagem da primeira rodada: o treino foi criado, agora é com você. */
export function avisoDePreparo(pasta, projeto) {
  return new Error([
    "",
    `Repositório de treino criado em: ${projeto}`,
    "",
    "Agora faça a tarefa do README.md deste exercício lá dentro, com comandos git, e rode o exercício de novo.",
    `Para recomeçar do zero: apague a pasta ${pasta} e rode o exercício de novo.`,
  ].join("\n"));
}
