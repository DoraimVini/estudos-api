> **Tempo estimado:** 40 min · **Fontes:** documentação do GitHub (*Sobre pull requests* e *Sobre revisões*) · Pro Git 6.2

## Em poucas palavras

Um **pull request** (PR) é uma **proposta** para levar os commits de uma branch para outra. No GitHub, ele junta tudo num lugar: o diff, a discussão, a revisão e o resultado do CI. Só depois disso alguém faz o merge.

O PR não é um recurso do Git: é do GitHub (o GitLab chama de *merge request*). O Git só vê o resultado final, um merge comum.

## As partes de um PR

- **Branch base**: para onde as mudanças vão. Neste projeto, quase sempre a `develop`.
- **Branch de comparação**: de onde elas vêm (a sua `feat/...` ou `mod/...`).
- **Aba de arquivos alterados**: o diff, que é o que o revisor lê.
- **Checks**: o resultado do CI (aqui, `npm test`). Um ✗ vermelho bloqueia a confiança no merge.
- **Rascunho (*draft*)**: um PR que ainda não pode ser mergeado. Serve para mostrar trabalho em andamento.

## Uma boa descrição

O revisor não estava na sua cabeça. Uma descrição que funciona responde a três perguntas:

```markdown
## O que muda
Adiciona a página de tópico ao painel.

## Por quê
Antes, "Estudar" só ligava o Pomodoro, e não havia conteúdo para ler.

## Como testar
- [x] npm test (84 testes)
- [x] Abrir #/topico/1 e conferir que o conteúdo aparece
```

Os PRs deste repositório seguem esse modelo: abra os PRs fechados do `estudos-api` e compare.

## Revisar e ser revisado

No GitHub, quem revisa termina com uma de três decisões: **Comentar**, **Aprovar** ou **Solicitar alterações**. Também dá para comentar uma linha específica e **sugerir** a alteração exata, que o autor aplica com um clique.

Boas práticas, para os dois lados:

- **PRs pequenos.** Duzentas linhas são revisadas com atenção; duas mil são só "aprovadas".
- **Perguntas em vez de ordens**: "o que acontece se a lista vier vazia?" ensina mais do que "trate a lista vazia".
- **Comente o código, não a pessoa.**
- **Como autor**: responda a cada comentário, mesmo que seja com "feito", e não leve a revisão para o lado pessoal. Ela existe para pegar o que você não viu.

## Na prática

Com o GitHub CLI, que já está instalado na sua máquina:

```bash
git switch -c mod/teste-pr
# faça um commit pequeno
git push -u origin mod/teste-pr
gh pr create --base develop --title "Teste de PR" --body "O que muda / Por quê / Como testar"
gh pr view --web          # abre o PR no navegador
gh pr checks              # resultado do CI
```

Depois, no navegador, abra a aba de arquivos alterados, comente uma linha e use **Suggest changes**.

## Armadilhas comuns

- **PR sem descrição** ("ajustes"). O revisor precisa adivinhar a intenção.
- **Misturar assuntos num PR só.** Se uma parte precisar ser desfeita, a outra vai junto.
- **Mergear com o CI vermelho** "porque é só documentação".
- **Esquecer de apagar a branch** depois do merge. O GitHub oferece o botão, e o `gh pr merge --delete-branch` faz isso sozinho.

## Leia na documentação oficial

1. [GitHub · Sobre pull requests](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests): o que é um PR, rascunhos e as abas.
2. [GitHub · Sobre revisões de pull request](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews): os tipos de revisão, os comentários em linha e as sugestões.
3. [Pro Git 6.2 · Contribuindo para um Projeto](https://git-scm.com/book/pt-br/v2/GitHub-Contribuindo-para-um-Projeto): o fluxo completo de fork, branch e PR num projeto de outra pessoa.

## Confira se entendeu

<details><summary>O pull request é um recurso do Git?</summary>

Não. É do GitHub (e de serviços parecidos). Para o Git, o resultado é um merge comum.
</details>

<details><summary>Quais três perguntas uma boa descrição de PR responde?</summary>

O que muda, por que muda e como testar.
</details>

<details><summary>Quais as três decisões possíveis numa revisão do GitHub?</summary>

Comentar, Aprovar ou Solicitar alterações.
</details>

<details><summary>Por que preferir PRs pequenos?</summary>

Porque são revisados com atenção de verdade e, se algo der errado, dá para desfazer só aquela mudança.
</details>
