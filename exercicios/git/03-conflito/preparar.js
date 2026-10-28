// Monta o repositório de treino do git/03 (só na primeira vez). Leia o README.md desta pasta.
import { join } from "node:path";
import { commitar, git, novoRepo, prepararTreino } from "../_treino.js";

export const treino = () => prepararTreino("03-conflito", (pasta) => {
  const projeto = novoRepo(join(pasta, "projeto"));
  commitar(projeto, {
    "package.json": '{ "name": "servidor-treino", "private": true, "type": "module" }\n',
    "config.js": 'export const HOST = "localhost";\nexport const PORTA = 3000;\n',
  }, "Cria a configuração do servidor");

  // As duas branches mudam a mesma linha, cada uma por um motivo diferente.
  git(projeto, "switch", "-q", "-c", "feat/porta-env");
  const branch = commitar(projeto, {
    "config.js": 'export const HOST = "localhost";\nexport const PORTA = Number(process.env.PORT ?? 3000);\n',
  }, "Lê a porta da variável de ambiente PORT");

  git(projeto, "switch", "-q", "main");
  const main = commitar(projeto, {
    "config.js": 'export const HOST = "localhost";\nexport const PORTA = 3100;\n',
  }, "Muda a porta padrão para 3100");
  return { main, branch };
});
