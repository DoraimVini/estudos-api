> **Tempo estimado:** 45 min · **Fontes:** Pro Git, seções 2.5 e 3.5 · documentação de `git fetch` e `git push`

## Em poucas palavras

Um **remoto** é outra cópia do repositório, normalmente no GitHub, com um apelido. Ao clonar, o Git chama esse apelido de **`origin`**. O Git **nunca** sincroniza sozinho: você baixa com `fetch`/`pull` e envia com `push`.

Para saber como o remoto estava na última conversa, o Git guarda **branches de rastreamento remoto**, como `origin/develop`. Elas são *fotos* do servidor: você não trabalha nelas, e só mudam quando você fala com o remoto.

## fetch, pull e push

| Comando | Faz | Mexe nos seus arquivos? |
|---|---|---|
| `git fetch` | Baixa o que há de novo e atualiza `origin/*` | **Não** |
| `git pull` | `fetch` + **merge** de `origin/<branch>` na branch atual | Sim |
| `git push` | Envia os seus commits para o remoto | Não (mexe no servidor) |

Como o `fetch` não muda nada no seu trabalho, ele é sempre seguro: dá para baixar, olhar (`git log origin/develop`) e só depois decidir integrar.

Desde o Git 2.27, o `git pull` avisa enquanto você não escolher entre merge e rebase. Para manter o comportamento clássico, de merge, rode uma vez:

```bash
git config --global pull.rebase false
```

## Upstream: a ligação entre branch local e remota

Uma branch local pode **rastrear** uma remota, o *upstream*. Com isso, `git pull` e `git push` sem argumentos já sabem de onde puxar e para onde enviar.

```bash
git push -u origin feat/login   # envia e define origin/feat/login como upstream (-u = --set-upstream)
git branch -vv                  # mostra cada branch, o upstream e se está à frente ou atrás
```

`[origin/feat/login: ahead 2]` quer dizer: 2 commits seus ainda não enviados. `behind 1`: há 1 commit no remoto que você ainda não tem. Esses números valem para o último `fetch`.

## Limpando branches que sumiram do remoto

Depois que um PR é mergeado e a branch é apagada no GitHub, a sua `origin/feat/login` continua aparecendo. Para limpar:

```bash
git fetch --prune     # remove as origin/* que não existem mais no servidor
```

O `--prune` apaga só as referências de rastreamento (`origin/*`). As suas branches **locais** continuam lá: apague com `git branch -d`.

## Na prática

Neste repositório (`estudos-api`):

```bash
git remote -v                 # origin aponta para github.com/DoraimVini/estudos-api
git fetch --prune
git branch -vv                # a develop está em dia com origin/develop?
git log --oneline -3 origin/develop
git remote show origin        # tudo junto: URL, branches remotas e o que o pull/push faria
```

## Armadilhas comuns

- **Achar que `git fetch` atualiza a sua branch.** Ele só atualiza `origin/*`. Para trazer para a sua branch, use `git pull` ou `git merge`.
- **`git push` recusado** (*rejected, fetch first*): alguém enviou commits antes de você. Faça `git pull`, resolva os conflitos, se houver, e envie de novo. **Não** use `--force` para "resolver".
- **Esquecer o `-u` no primeiro push** de uma branch nova. Funciona, mas o próximo `git pull` não vai saber de onde puxar.

## Leia na documentação oficial

1. [Pro Git 2.5 · Trabalhando com Repositórios Remotos](https://git-scm.com/book/pt-br/v2/Fundamentos-do-Git-Trabalhando-com-Reposit%c3%b3rios-Remotos): `remote -v`, `fetch`, `pull`, `push` e `remote show`.
2. [Pro Git 3.5 · Branches Remotos](https://git-scm.com/book/pt-br/v2/Ramifica%c3%a7%c3%a3o-Branching-no-Git-Branches-Remotos-Remote-Branches): branches de rastreamento, upstream, `branch -vv` e como apagar uma branch remota.
3. [git fetch · PRUNING](https://git-scm.com/docs/git-fetch#_pruning): o que o `--prune` remove e o que não remove.
4. [git push](https://git-scm.com/docs/git-push): referência, incluindo `-u` e por que um push é rejeitado.

## Confira se entendeu

<details><summary>Qual a diferença entre <code>git fetch</code> e <code>git pull</code>?</summary>

`fetch` só baixa e atualiza as referências `origin/*`, sem mexer no seu trabalho. `pull` faz o `fetch` e depois o merge na branch atual.
</details>

<details><summary>O que é <code>origin/develop</code>?</summary>

Uma branch de rastreamento remoto: uma foto de onde a `develop` do servidor estava no último `fetch`, `pull` ou `push`.
</details>

<details><summary>Para que serve o <code>-u</code> em <code>git push -u origin feat/x</code>?</summary>

Define `origin/feat/x` como upstream da branch local, para que `git pull` e `git push` sem argumentos saibam com quem sincronizar.
</details>

<details><summary>Depois de <code>git fetch --prune</code>, a sua branch local da tarefa mergeada some?</summary>

Não. Só a referência `origin/...` some. A branch local você apaga com `git branch -d`.
</details>
