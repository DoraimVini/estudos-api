// Monta o repositório de treino do git/02 (só na primeira vez). Leia o README.md desta pasta.
import { join } from "node:path";
import { commitar, git, novoRepo, prepararTreino } from "../_treino.js";

export const treino = () => prepararTreino("02-merge", (pasta) => {
  const projeto = novoRepo(join(pasta, "projeto"));
  commitar(projeto, { "index.html": "<main>Portfólio</main>\n" }, "Cria a página inicial");
  commitar(projeto, { "estilo.css": "body { margin: 0; }\n" }, "Adiciona o estilo base");

  // Duas branches saem do mesmo ponto da main.
  git(projeto, "switch", "-q", "-c", "feat/rodape");
  const rodape = commitar(projeto, { "rodape.html": "<footer>Contato</footer>\n" }, "Adiciona o rodapé");

  git(projeto, "switch", "-q", "main");
  git(projeto, "switch", "-q", "-c", "feat/cabecalho");
  const cabecalho1 = commitar(projeto, { "cabecalho.html": "<header>Vini</header>\n" }, "Adiciona o cabeçalho");
  const cabecalho2 = commitar(projeto, { "cabecalho.html": "<header>Vini · dev full stack</header>\n" }, "Completa o cabeçalho com o cargo");

  git(projeto, "switch", "-q", "main");
  return { rodape, cabecalho: [cabecalho1, cabecalho2] };
});
