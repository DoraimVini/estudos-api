// Monta o repositório de treino do git/06 (só na primeira vez). Leia o README.md desta pasta.
// A "chave" aqui é de mentira: nunca use um segredo real num exercício.
import { join } from "node:path";
import { commitar, novoRepo, prepararTreino } from "../_treino.js";

const SEGREDO = "chave-de-mentira-123";

export const treino = () => prepararTreino("06-segredos", (pasta) => {
  const projeto = novoRepo(join(pasta, "projeto"));
  commitar(projeto, {
    "package.json": '{ "name": "app-treino", "private": true }\n',
    "app.js": 'const chave = process.env.API_KEY;\nconsole.log(chave ? "chave carregada" : "falta a API_KEY");\n',
    ".env": `API_KEY=${SEGREDO}\n`,
    "node_modules/pacote/index.js": "module.exports = 42;\n",
  }, "Primeira versão do app");
  return { segredo: SEGREDO };
});
