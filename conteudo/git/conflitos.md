> **Tempo estimado:** 40 min · **Fontes:** Pro Git, seção 3.2 (Conflitos Básicos de Mesclagem) · documentação de `git merge`

## Em poucas palavras

Um conflito acontece quando **as duas branches mudaram o mesmo trecho do mesmo arquivo** de jeitos diferentes. O Git não tem como saber qual versão está certa, então **pausa o merge** e pede para você decidir.

Conflito não é erro nem defeito: é o Git dizendo "aqui eu preciso de um humano". Mudanças em arquivos diferentes, ou em partes diferentes do mesmo arquivo, o Git junta sozinho.

## Como o conflito aparece

`git status` lista os arquivos em **"Unmerged paths"** (*both modified*). Dentro do arquivo, o Git marca o trecho:

```text
<<<<<<< HEAD
const PORTA = 3000;
=======
const PORTA = process.env.PORT ?? 3000;
>>>>>>> feat/porta-configuravel
```

- Entre `<<<<<<< HEAD` e `=======`: a versão da branch **em que você está**.
- Entre `=======` e `>>>>>>> feat/...`: a versão da branch **que está chegando**.

## Como resolver

1. Abra o arquivo e **decida**: ficar com um lado, com o outro, ou **combinar** os dois (o mais comum).
2. **Apague as três linhas de marcação** (`<<<<<<<`, `=======` e `>>>>>>>`).
3. **Teste**: rode o projeto e os testes. Um conflito "resolvido" pode estar errado.
4. `git add arquivo` para marcar como resolvido.
5. `git commit` para concluir o merge (a mensagem já vem pronta).

Quer desistir e voltar ao estado de antes do merge? `git merge --abort`.

O VS Code mostra botões em cima de cada conflito (*Accept Current*, *Accept Incoming*, *Accept Both*), mas o processo por trás é o mesmo.

## Na prática

Gere um conflito de propósito numa pasta de teste:

```bash
git init conflito
cd conflito
# crie config.js com a linha: const PORTA = 3000;
git add config.js
git commit -m "Adiciona config"

git switch -c outra
# mude a linha para: const PORTA = 8080;
git commit -am "Muda a porta para 8080"

git switch -                        # volta para a branch inicial
# mude a mesma linha para: const PORTA = 5000;
git commit -am "Muda a porta para 5000"

git merge outra                     # CONFLICT (content): Merge conflict in config.js
git status                          # both modified: config.js
# edite config.js, escolha a versão e apague as marcações
git add config.js
git commit                          # conclui o merge
git log --oneline --graph           # o commit de merge com os dois lados
```

## Armadilhas comuns

- **Commitar com as marcações dentro do arquivo.** O código quebra. Antes do `git add`, procure por `<<<<<<<` no projeto.
- **Escolher "o meu lado" sem ler o outro.** A outra pessoa mudou aquela linha por algum motivo, e às vezes a resposta certa é combinar as duas mudanças.
- **Não testar depois de resolver.** O arquivo pode estar sintaticamente certo e logicamente errado.
- **Entrar em pânico.** `git merge --abort` desfaz tudo e volta para antes do merge.

## Leia na documentação oficial

1. [Pro Git 3.2 · Ramificação e Mesclagem Básicas](https://git-scm.com/book/pt-br/v2/Ramifica%c3%a7%c3%a3o-Branching-no-Git-Ramifica%c3%a7%c3%a3o-Branching-e-Mesclagem-Merging-B%c3%a1sicas): a seção "Conflitos Básicos de Mesclagem" mostra o passo a passo com `git status`, as marcações e o `git mergetool`.
2. [git merge · HOW CONFLICTS ARE PRESENTED](https://git-scm.com/docs/git-merge#_how_conflicts_are_presented): como as marcações são escritas e o estilo `diff3`, que mostra também a versão original.
3. [git merge · HOW TO RESOLVE CONFLICTS](https://git-scm.com/docs/git-merge#_how_to_resolve_conflicts): as opções, incluindo `git merge --abort`.

## Pratique

Este é também o **mini-projeto do módulo 1**: crie um repositório de anotações no GitHub, gere um conflito entre duas branches e resolva **pelo PR**, não só localmente.

Exercício com correção automática: **git/03 · Conflito: combinar, não escolher**. Na primeira vez, o comando cria um repositório de treino em `..\treino-git\` e diz onde ele está; você resolve lá com comandos git, e o teste confere o resultado.

```bash
npm run exercicio git/03
```

## Confira se entendeu

<details><summary>Em que situação o Git <strong>não</strong> consegue juntar as mudanças sozinho?</summary>

Quando as duas branches alteraram o mesmo trecho do mesmo arquivo de formas diferentes.
</details>

<details><summary>Entre <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> e <code>=======</code>, qual versão aparece?</summary>

A da branch em que você está (a apontada pelo `HEAD`). A versão que está chegando fica entre `=======` e `>>>>>>>`.
</details>

<details><summary>Depois de editar o arquivo, como avisar o Git de que o conflito foi resolvido?</summary>

Com `git add arquivo`. Depois, `git commit` conclui o merge.
</details>

<details><summary>Como cancelar um merge que está dando errado?</summary>

`git merge --abort`, que volta ao estado de antes do merge.
</details>
