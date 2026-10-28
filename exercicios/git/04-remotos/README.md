# Push, fetch e prune

**Módulo 1 · Git e GitHub · tópico: Remotos**

O seu repositório local e o remoto (o GitHub) são **cópias separadas** que só conversam quando você manda: `push` envia, `fetch` baixa sem mexer nas suas branches, `pull` baixa e integra. As `origin/...` são a **foto** que o seu Git tirou do remoto na última conversa, e podem estar velhas.

## A situação

Aqui o "GitHub" é a pasta `remoto.git`, e a pasta `colega` é o computador de outra pessoa (não mexa nelas). No seu repositório (`projeto`):

- você criou a branch `feat/anotacoes`, com um commit que **ainda não foi para o remoto**;
- a colega enviou um commit novo para a `main` do remoto;
- a colega também **apagou** a branch `feat/velha` no remoto, mas o seu Git ainda mostra `origin/feat/velha`.

## O que fazer

1. Publique a `feat/anotacoes` no `origin` de forma que ela **rastreie** a branch remota: depois disso, um `git push` sem argumentos (estando nela) tem que saber para onde ir.
2. Traga o commit da colega para a sua `main` local **sem criar commit de merge**.
3. Limpe a referência velha `origin/feat/velha`.

Não envie nada para a `main` do remoto.

## Rodar

```bash
npm run exercicio git/04
```

Na primeira vez, o comando **cria o treino** em `..\treino-git\04-remotos\` e para com uma mensagem. Resolva dentro de `projeto`, em outro terminal:

```bash
cd ..\treino-git\04-remotos\projeto
```

Depois, rode `npm run exercicio git/04` de novo para conferir. Para recomeçar do zero, apague a pasta `..\treino-git\04-remotos`.

## Dicas
- `git branch -vv` mostra qual branch rastreia qual remota; `git branch -a` lista também as `origin/...`.
- Leia sobre a opção `-u` (`--set-upstream`) do `git push`.
- `git fetch` primeiro, `git log --oneline --all --graph` depois: veja o que chegou antes de integrar.
- Para garantir que não sai commit de merge, leia sobre `--ff-only`.
- Branch apagada no remoto não some sozinha da sua foto: leia sobre `git fetch --prune`.

## Pronto quando
Os testes passam e você consegue explicar a diferença entre `main`, `origin/main` e a `main` que está no remoto.
