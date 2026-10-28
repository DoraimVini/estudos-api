> **Tempo estimado:** 50 min · **Fontes:** Pro Git, seções 2.4 e 7.7 · documentação de `git restore`, `git revert` e `git reflog`

## Em poucas palavras

Quase tudo no Git tem volta, **desde que tenha sido commitado**. O Git praticamente só *acrescenta* dados ao banco, então commits "perdidos" por um reset, um rebase ou um amend continuam lá por um tempo. O que **nunca** foi commitado é outra história: se for descartado, não há de onde recuperar.

A ferramenta certa depende de **onde** está o que você quer desfazer.

## Qual comando usar

| Situação | Comando | Perigo |
|---|---|---|
| Preparei (`add`) um arquivo sem querer | `git restore --staged arquivo` | Nenhum: a mudança continua no arquivo |
| Quero jogar fora as mudanças de um arquivo | `git restore arquivo` | **Perde** as mudanças não commitadas |
| Errei a mensagem ou esqueci um arquivo no último commit (não enviado) | `git commit --amend` | Troca o hash do commit |
| Quero desfazer um commit que **já foi enviado** | `git revert <hash>` | Nenhum: cria um commit novo que desfaz |
| Quero apagar commits **locais** | `git reset` (veja abaixo) | `--hard` **perde** trabalho não commitado |
| "Perdi" um commit | `git reflog` | Nenhum: só consulta |

## `revert` x `reset`

- **`git revert`** não apaga nada: cria um **commit novo** com o efeito contrário. É seguro em branches compartilhadas, porque o histórico de todo mundo continua igual.
- **`git reset`** move a branch para outro commit, como se os commits seguintes nunca tivessem existido. Ele tem três modos:

| | Move a branch | Esvazia a área de preparo | Mexe nos seus arquivos |
|---|---|---|---|
| `--soft` | sim | não | não |
| `--mixed` (padrão) | sim | sim | não |
| `--hard` | sim | sim | **sim: descarta mudanças** |

`git reset --soft HEAD~1` desfaz o último commit mantendo tudo preparado, ótimo para refazer o commit. `--hard` é o único modo que **destrói** trabalho não commitado.

## O reflog: a rede de segurança

O `git reflog` registra **para onde o `HEAD` e as branches apontaram** no seu repositório local: cada commit, troca de branch, reset e rebase.

```text
a1b2c3d HEAD@{0}: reset: moving to HEAD~2
9f8e7d6 HEAD@{1}: commit: Adiciona validação
...
```

Para voltar a um estado antigo: `git switch -c resgate "HEAD@{1}"`. As entradas expiram, por padrão, em **90 dias** (ou 30, para commits que não são mais alcançáveis), e o reflog **não** vai para o GitHub: ele só existe na sua máquina.

## Na prática

Numa pasta de teste:

```bash
git init desfazer
cd desfazer
# crie a.txt, faça o commit "um"; edite, faça o commit "dois"; edite, faça o commit "tres"
git log --oneline
git reset --hard HEAD~2       # "apaga" os commits dois e tres
git log --oneline             # só sobrou o "um"
git reflog                    # mas o reflog lembra de todos
git reset --hard "HEAD@{1}"   # volta para onde estava antes do reset
git log --oneline             # dois e tres voltaram
```

As aspas em `"HEAD@{1}"` são necessárias no PowerShell, por causa das chaves. No Git Bash, não atrapalham.

## Armadilhas comuns

- **`git reset --hard` com arquivos modificados.** As mudanças não commitadas somem de verdade. Na dúvida, faça um commit antes, mesmo que temporário.
- **`reset` em commits já enviados**, seguido de `push --force`. Para o que já é público, use `revert`.
- **Achar que "perdeu tudo"** depois de um reset ou rebase. Olhe o `git reflog` antes de entrar em pânico.

## Leia na documentação oficial

1. [Pro Git 2.4 · Desfazendo Coisas](https://git-scm.com/book/pt-br/v2/Fundamentos-do-Git-Desfazendo-Coisas): `--amend` e `git restore`, com e sem `--staged`.
2. [Pro Git 7.7 · Reset Desmistificado](https://git-scm.com/book/pt-br/v2/Ferramentas-do-Git-Reset-Desmistificado): as três árvores (HEAD, index e diretório de trabalho), com diagramas de cada modo do reset. É longo, mas é a melhor explicação que existe.
3. [git revert](https://git-scm.com/docs/git-revert): como desfazer com segurança o que já foi publicado.
4. [git reflog](https://git-scm.com/docs/git-reflog): a sintaxe `HEAD@{n}` e os prazos de expiração.

## Pratique

Exercício com correção automática: **git/05 · Desfazer sem reescrever e recuperar com o reflog**. Na primeira vez, o comando cria um repositório de treino em `..\treino-git\` e diz onde ele está; você resolve lá com comandos git, e o teste confere o resultado.

```bash
npm run exercicio git/05
```

## Confira se entendeu

<details><summary>Você preparou um arquivo por engano. Como tirá-lo da área de preparo sem perder a edição?</summary>

`git restore --staged arquivo`. A mudança continua no arquivo, só deixa de estar preparada.
</details>

<details><summary>Um commit com bug já está na <code>develop</code> do GitHub. Como desfazer?</summary>

Com `git revert <hash>`, que cria um commit novo desfazendo o efeito. O histórico de todos continua válido.
</details>

<details><summary>Qual modo do <code>reset</code> pode destruir trabalho, e por quê?</summary>

`--hard`, porque sobrescreve os arquivos do diretório de trabalho. Mudanças que nunca foram commitadas não têm como ser recuperadas.
</details>

<details><summary>Você fez <code>reset --hard</code> e sumiram dois commits. Onde procurar?</summary>

No `git reflog`, que mostra para onde o `HEAD` apontava antes. Dali dá para voltar com `git reset --hard "HEAD@{n}"` ou criar uma branch nesse ponto.
</details>
