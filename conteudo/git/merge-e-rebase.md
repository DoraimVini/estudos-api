> **Tempo estimado:** 50 min · **Fontes:** Pro Git, seções 3.2 e 3.6 · documentação de `git merge` e `git rebase`

## Em poucas palavras

Há duas formas de juntar o trabalho de duas branches:

- **Merge** junta os históricos: se eles divergiram, cria um **commit de merge** com dois pais. O histórico fica exatamente como aconteceu.
- **Rebase** *reaplica* os seus commits por cima de outra base, como se você tivesse começado o trabalho depois. O histórico fica **em linha reta**, mas os commits reaplicados são **novos** (outros hashes).

O resultado final nos arquivos é o mesmo. O que muda é a **história** que o `git log` conta.

## Os dois tipos de merge

**Fast-forward (avanço rápido).** Se a `develop` não andou desde que você criou a sua branch, não há nada para combinar. O Git só **move o ponteiro** da `develop` para a frente, sem criar commit novo.

**Merge de três vias.** Se as duas branches receberam commits, o Git compara três fotos: a ponta de cada branch e o **ancestral comum** delas. Com isso, cria um commit de merge que tem **dois pais**.

```text
Antes:                         Depois de git merge feat:
      C3  feat                       C3──────┐  feat
     /                              /         \
C1──C2──C4  develop            C1──C2──C4────C5  develop  (C5 tem dois pais)
```

## Como o rebase funciona

`git rebase develop`, estando na sua branch:

1. acha o ancestral comum entre a sua branch e a `develop`;
2. guarda as mudanças de cada um dos seus commits;
3. coloca a sua branch na ponta da `develop`;
4. reaplica as mudanças uma a uma, criando commits **novos**.

```text
Antes:                         Depois de git rebase develop (na feat):
      C3  feat                               C3'  feat
     /                                      /
C1──C2──C4  develop            C1──C2──C4  develop
```

Agora o merge da `feat` na `develop` vira um fast-forward, e o histórico fica linear.

## A regra de ouro

> **Não faça rebase de commits que já existem fora do seu repositório e nos quais outras pessoas podem ter baseado trabalho.**

O rebase troca os commits por outros (C3 vira C3'). Se alguém já tinha o C3, o histórico dessa pessoa e o seu passam a contar histórias diferentes, e consertar isso dá trabalho. O equilíbrio que o Pro Git recomenda: **use rebase para arrumar o seu trabalho local antes de enviar; nunca para reescrever o que já foi publicado**.

Neste projeto, os PRs são mergeados com **merge commit** (o padrão do GitHub). Por isso o `git log --graph` mostra cada PR como uma "bolha".

## Na prática

```bash
git switch -c feat/a
# faça um commit
git switch develop
git merge feat/a                  # "Fast-forward": a develop não tinha andado

git switch -c feat/b
# faça um commit
git switch develop
# faça outro commit direto aqui (só no experimento!)
git merge feat/b                  # agora cria um commit de merge
git log --oneline --graph --all   # veja a bolha do merge
```

## Armadilhas comuns

- **Fazer rebase de uma branch que já foi enviada e que outra pessoa usa.** Viola a regra de ouro e exige `push --force`.
- **Achar que o rebase "perde" commits.** Os antigos continuam no banco por um tempo e podem ser recuperados pelo `reflog` (veja *Desfazer coisas*).
- **Resolver o mesmo conflito várias vezes no rebase.** No rebase, cada commit é reaplicado, então cada um pode gerar o seu próprio conflito. No merge, o conflito aparece uma vez só.

## Leia na documentação oficial

1. [Pro Git 3.2 · Ramificação e Mesclagem Básicas](https://git-scm.com/book/pt-br/v2/Ramifica%c3%a7%c3%a3o-Branching-no-Git-Ramifica%c3%a7%c3%a3o-Branching-e-Mesclagem-Merging-B%c3%a1sicas): fast-forward e merge de três vias, com diagramas.
2. [Pro Git 3.6 · Rebase](https://git-scm.com/book/pt-br/v2/Ramifica%c3%a7%c3%a3o-Branching-no-Git-Rebase-Rebasing): leia até o fim, especialmente "Os Perigos do Rebase" e "Rebase vs. Mesclar".
3. [git merge](https://git-scm.com/docs/git-merge): referência, com as opções `--ff-only` e `--no-ff`.
4. [git rebase](https://git-scm.com/docs/git-rebase): referência. A seção "RECOVERING FROM UPSTREAM REBASE" mostra o estrago que a regra de ouro evita.

## Confira se entendeu

<details><summary>Quando um merge vira fast-forward?</summary>

Quando a branch de destino não recebeu nenhum commit desde que a outra branch saiu dela. Não há o que combinar, e o Git só move o ponteiro.
</details>

<details><summary>Quantos pais tem um commit de merge, e por quê?</summary>

Dois (ou mais): um para cada histórico que foi juntado. É o que permite ao Git saber de onde veio cada lado.
</details>

<details><summary>Depois de um rebase, os seus commits têm o mesmo hash de antes?</summary>

Não. Eles são reaplicados sobre outra base, então são commits novos (o C3 vira C3'), com outro hash.
</details>

<details><summary>Qual é a regra de ouro do rebase?</summary>

Não fazer rebase de commits que já foram publicados e que outras pessoas podem estar usando.
</details>
