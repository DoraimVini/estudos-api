// Monta o repositório de treino do git/04 (só na primeira vez). Leia o README.md desta pasta.
// O "GitHub" aqui é um repositório bare (remoto.git): só histórico, sem pasta de trabalho.
import { join } from "node:path";
import { commitar, git, novoRepo, prepararTreino } from "../_treino.js";

export const treino = () => prepararTreino("04-remotos", (pasta) => {
  const remoto = novoRepo(join(pasta, "remoto.git"), { bare: true });

  const projeto = novoRepo(join(pasta, "projeto"));
  commitar(projeto, { "README.md": "# Anotações de estudo\n" }, "Cria o repositório de anotações");
  git(projeto, "remote", "add", "origin", remoto);
  git(projeto, "push", "-q", "-u", "origin", "main");
  // Uma branch antiga no remoto, que você já conhece (tem origin/feat/velha)...
  git(projeto, "push", "-q", "origin", "main:feat/velha");
  git(projeto, "fetch", "-q");

  // ...e uma colega, no clone dela, envia um commit novo e apaga a feat/velha no remoto.
  const colega = join(pasta, "colega");
  git(pasta, "clone", "-q", remoto, colega);
  git(colega, "config", "user.name", "Colega");
  git(colega, "config", "user.email", "colega@exemplo.invalid");
  git(colega, "config", "core.autocrlf", "false");
  git(colega, "config", "commit.gpgsign", "false");
  const daColega = commitar(colega, { "git.md": "# Git\n- fetch baixa; pull baixa e integra\n" }, "Adiciona anotações de Git");
  git(colega, "push", "-q", "origin", "main");
  git(colega, "push", "-q", "origin", "--delete", "feat/velha");

  // Enquanto isso, você começou uma branch que ainda não foi para o remoto.
  git(projeto, "switch", "-q", "-c", "feat/anotacoes");
  const sua = commitar(projeto, { "html.md": "# HTML\n- prefira as tags semânticas\n" }, "Adiciona anotações de HTML");
  git(projeto, "switch", "-q", "main");
  return { daColega, sua };
});
