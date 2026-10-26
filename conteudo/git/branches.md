> **Tempo estimado:** 35 min · **Fontes:** Pro Git, seções 3.1 e 3.3 · documentação de `git switch` e `git branch`

## Em poucas palavras

Uma branch é **um ponteiro com nome para um commit**. Criar uma é só escrever um arquivo com o hash desse commit, por isso é instantâneo, mesmo num projeto enorme. Quando você faz um commit, a branch em que está (a apontada pelo `HEAD`) **avança sozinha** para o commit novo.

Branches servem para trabalhar em coisas diferentes **sem misturar**: uma funcionalidade em `feat/login`, uma correção em `mod/readme`, e a `develop` intacta até o PR ser aprovado.

## Os comandos do dia a dia

| Comando | Faz |
|---|---|
| `git branch` | Lista as branches locais; `*` marca a atual |
| `git branch -v` | Lista com o último commit de cada uma |
| `git switch nome` | Muda para a branch `nome` |
| `git switch -c nome` | **Cria** e já muda para `nome`, a partir de onde você está |
| `git switch -` | Volta para a branch anterior (como o "voltar" do controle remoto) |
| `git branch --merged` | Branches já mescladas na atual: podem ser apagadas |
| `git branch -d nome` | Apaga, **só se** já foi mesclada |
| `git branch -D nome` | Apaga **à força**, mesmo com trabalho não mesclado |
| `git branch --move velho novo` | Renomeia |

`git switch` existe desde o Git 2.23. Antes, tudo isso era feito com `git checkout`, que também restaura arquivos e por isso confundia muita gente. Tutoriais antigos usam `git checkout -b nome`, que equivale a `git switch -c nome`.

## Trocar de branch com alterações não commitadas

O Git deixa trocar de branch com arquivos modificados, **desde que** a troca não sobrescreva o seu trabalho. Se sobrescreveria, ele recusa:

```text
error: You have local changes to 'app.js'; not switching branches.
```

Nesse caso, faça o commit (numa branch de trabalho, tudo bem commitar algo incompleto) ou guarde temporariamente com `git stash`.

## Na prática

```bash
git switch -c feat/teste-branch      # cria a branch e muda para ela
# edite um arquivo qualquer e faça um commit
git log --oneline --decorate --all   # veja: feat/teste-branch está um commit à frente
git switch -                         # volta para a branch anterior; o arquivo volta ao estado antigo
git branch --merged                  # feat/teste-branch NÃO aparece (ainda não foi mesclada)
git branch -d feat/teste-branch      # recusa: "not fully merged"
git branch -D feat/teste-branch      # apaga à força (só porque era um teste!)
```

## Armadilhas comuns

- **Começar a trabalhar sem criar branch** e perceber depois que está commitando direto na `develop`. Antes de começar: `git switch develop`, `git pull` e `git switch -c feat/nome`.
- **Usar `-D` por hábito.** O `-d` é uma proteção: se ele recusa, é porque há commits que só existem naquela branch.
- **Esquecer que o `git switch` muda os arquivos da pasta.** Ao trocar de branch, os arquivos passam a refletir o último commit da outra branch. Nada foi perdido: é só voltar.
- **"HEAD destacado" (*detached HEAD*).** Acontece ao trocar para um commit, e não para uma branch. Se fizer commits assim, crie uma branch (`git switch -c nome`) antes de sair, senão eles ficam sem nenhum ponteiro.

## Leia na documentação oficial

1. [Pro Git 3.1 · Branches em poucas palavras](https://git-scm.com/book/pt-br/v2/Ramifica%c3%a7%c3%a3o-Branching-no-Git-Branches-em-Poucas-Palavras): os diagramas mostram o `HEAD` e as branches se movendo a cada commit.
2. [Pro Git 3.3 · Gerenciamento de Branches](https://git-scm.com/book/pt-br/v2/Ramifica%c3%a7%c3%a3o-Branching-no-Git-Gerenciamento-de-Branches): `--merged`, `-d` x `-D` e como renomear.
3. [git switch](https://git-scm.com/docs/git-switch): referência completa, incluindo `-c`, `-` e `--detach`.

## Confira se entendeu

<details><summary>Por que criar uma branch não copia os arquivos do projeto?</summary>

Porque a branch é só um ponteiro (um arquivo com o hash de um commit). Os arquivos estão no banco de objetos do Git e são compartilhados.
</details>

<details><summary>Qual a diferença entre <code>git branch -d</code> e <code>git branch -D</code>?</summary>

`-d` só apaga se a branch já foi mesclada, ou seja, se não há commits que existem só nela. `-D` apaga de qualquer jeito.
</details>

<details><summary>O que <code>git switch -</code> faz?</summary>

Volta para a branch em que você estava antes da última troca.
</details>

<details><summary>Você está na <code>develop</code> e quer começar uma tarefa nova. Quais comandos?</summary>

`git pull` para atualizar a `develop` e `git switch -c feat/nome-da-tarefa` para criar a branch da tarefa a partir dela.
</details>
