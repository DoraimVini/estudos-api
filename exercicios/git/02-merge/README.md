# Fast-forward e commit de merge

**Módulo 1 · Git e GitHub · tópico: Merge e rebase**

Uma branch é só um ponteiro para um commit. Quando você integra uma branch na `main`, o Git às vezes só **anda o ponteiro para a frente** (fast-forward) e às vezes precisa **criar um commit de merge** com dois pais. A diferença está no desenho do histórico, e é ele que você vai aprender a ler aqui.

## A situação

A `main` tem dois commits. Do mesmo ponto saíram duas branches:

- `feat/rodape`: um commit com o rodapé;
- `feat/cabecalho`: dois commits com o cabeçalho.

## O que fazer

1. Integre a `feat/rodape` na `main`. Ela pode entrar **sem commit de merge**: descubra por quê antes de rodar o comando.
2. Depois, integre a `feat/cabecalho` na `main`. Agora o Git **precisa** de um commit de merge: descubra por quê.
3. Apague as duas branches, que já foram integradas.

Sem `rebase` e sem `--squash`: os commits do cabeçalho têm que chegar à `main` como estão.

## Rodar

```bash
npm run exercicio git/02
```

Na primeira vez, o comando **cria o repositório de treino** em `..\treino-git\02-merge\projeto` e para com uma mensagem. Resolva lá, em outro terminal:

```bash
cd ..\treino-git\02-merge\projeto
```

Depois, rode `npm run exercicio git/02` de novo para conferir. Para recomeçar do zero, apague a pasta `..\treino-git\02-merge`.

## Dicas
- `git log --oneline --graph --all` desenha o histórico. Rode antes e depois de cada passo.
- Fast-forward só é possível quando a `main` não andou desde que a branch saiu dela.
- Depois do passo 1, a `main` andou. Olhe o desenho de novo antes do passo 2.
- O merge do passo 2 abre um editor para a mensagem do commit. Se for o vim (uma tela de terminal estranha), digite `:wq` e Enter para aceitar a mensagem pronta. Leia sobre `--no-edit` para pular o editor.
- `git branch -d` (com `d` minúsculo) recusa apagar uma branch que ainda não foi integrada. É uma rede de segurança: não troque por `-D` sem pensar.

## Pronto quando
Os testes passam e você consegue desenhar, à mão, o histórico antes e depois de cada merge.
