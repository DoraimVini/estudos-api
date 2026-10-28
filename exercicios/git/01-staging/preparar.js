// Monta o repositório de treino do git/01 (só na primeira vez). Leia o README.md desta pasta.
import { join } from "node:path";
import { commitar, escrever, novoRepo, prepararTreino } from "../_treino.js";

export const treino = () => prepararTreino("01-staging", (pasta) => {
  const projeto = novoRepo(join(pasta, "projeto"));
  commitar(projeto, {
    "calc.js": "export const soma = (a, b) => a - b;\nexport const dobro = (n) => n * 2;\n",
    "notas.txt": "Anotações de estudo\n",
    "README.md": "# Calculadora\n",
  }, "Cria a calculadora");

  // Três mudanças ainda sem commit: a correção do bug, uma anotação em andamento e um rascunho.
  escrever(projeto, {
    "calc.js": "export const soma = (a, b) => a + b;\nexport const dobro = (n) => n * 2;\n",
    "notas.txt": "Anotações de estudo\n- staging: o que vai no próximo commit\n",
    "rascunho.txt": "ideias soltas, não é para o repositório\n",
  });
  return {};
});
