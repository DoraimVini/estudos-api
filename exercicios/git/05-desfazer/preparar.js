// Monta o repositório de treino do git/05 (só na primeira vez). Leia o README.md desta pasta.
import { rmSync } from "node:fs";
import { join } from "node:path";
import { commitar, git, novoRepo, prepararTreino } from "../_treino.js";

const CONFIG = '{ "tema": "escuro", "pomodoro": 25 }\n';

export const treino = () => prepararTreino("05-desfazer", (pasta) => {
  const remoto = novoRepo(join(pasta, "remoto.git"), { bare: true });
  const projeto = novoRepo(join(pasta, "projeto"));
  git(projeto, "remote", "add", "origin", remoto);

  const historico = [
    commitar(projeto, { "tarefas.txt": "- estudar Git\n", "config.json": CONFIG }, "Cria a lista de tarefas e a configuração"),
    commitar(projeto, { "tarefas.txt": "- estudar Git\n- revisar closures\n" }, "Adiciona tarefa de JavaScript"),
  ];
  // O erro: um commit que apagou a configuração sem querer...
  rmSync(join(projeto, "config.json"));
  git(projeto, "add", "-A");
  git(projeto, "commit", "-q", "-m", "Limpa arquivos antigos");
  historico.push(git(projeto, "rev-parse", "HEAD"));
  // ...e trabalho bom depois dele. Tudo já foi enviado.
  historico.push(commitar(projeto, { "tarefas.txt": "- estudar Git\n- revisar closures\n- praticar inglês\n" }, "Adiciona tarefa de inglês"));
  git(projeto, "push", "-q", "-u", "origin", "main");

  // Um experimento que só existia numa branch apagada sem querer.
  git(projeto, "switch", "-q", "-c", "experimento");
  const perdido = commitar(projeto, { "ideias.md": "# Ideias\n- modo foco no Pomodoro\n" }, "Anota ideias para o painel");
  git(projeto, "switch", "-q", "main");
  git(projeto, "branch", "-q", "-D", "experimento");

  return { historico, perdido, config: CONFIG };
});
