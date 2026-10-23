> **Tempo estimado:** 40 min · **Fontes:** Pro Git, seções 1.3 e 3.1 · documentação de `git status` e `git cat-file`

## Em poucas palavras

O Git não guarda "o que mudou" em cada arquivo. A cada commit, ele guarda uma **foto (snapshot) do projeto inteiro**. Arquivos que não mudaram não são copiados de novo: a foto só aponta para a versão idêntica que já estava guardada.

Tudo o que o Git guarda recebe um **nome calculado a partir do conteúdo**: um hash SHA-1 de 40 caracteres hexadecimais, como `24b9da6552252987aa493b52f8696cd6d3b00373`. Se um único byte mudar, o hash muda. É por isso que o Git percebe qualquer corrupção e que um commit nunca é alterado "por baixo dos panos".

## As três áreas e os três estados

Um arquivo passa por três lugares:

| Área | O que é | Estado do arquivo |
|---|---|---|
| **Diretório de trabalho** (*working tree*) | Os arquivos que você edita | **Modificado**: mudou, mas o Git ainda não vai gravar |
| **Área de preparo** (*staging area* ou *index*) | A lista do que vai entrar no próximo commit | **Preparado**: marcado com `git add` |
| **Diretório `.git`** | O banco de dados com todo o histórico | **Commitado**: gravado com `git commit` |

O fluxo é sempre: **editar → `git add` (preparar) → `git commit` (gravar)**. A área de preparo existe para você escolher o que entra em cada commit. Dá para editar cinco arquivos e commitar só dois.

## O que existe dentro do `.git`

O banco de dados guarda três tipos de objeto:

- **blob**: o conteúdo de um arquivo (sem o nome);
- **tree**: uma pasta, ou seja, a lista de nomes de arquivos e qual blob é cada um;
- **commit**: aponta para a tree raiz (a foto do projeto) e guarda autor, data, mensagem e o **commit pai**. O primeiro commit não tem pai; um commit de merge tem dois ou mais.

Como cada commit aponta para o pai, o histórico é uma corrente que só cresce para a frente.

## Branch e HEAD

- **Branch** é só um **ponteiro móvel para um commit**: um arquivo com os 40 caracteres do hash. Por isso criar uma branch é instantâneo.
- A cada commit novo, a branch em que você está **avança sozinha** para ele.
- **`HEAD`** é o ponteiro que diz **em qual branch você está agora**. `git switch` move o `HEAD`.

## Na prática

Se for o seu primeiro repositório fora do `estudos-api`, configure antes o seu nome e e-mail para **todos** os repositórios (só uma vez). Use o e-mail *noreply* do GitHub, para não expor o seu e-mail pessoal:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "ID+usuario@users.noreply.github.com"
```

Sem isso, o primeiro `git commit` falha com *"Please tell me who you are"*.

Crie uma pasta vazia, abra o terminal nela e rode um comando por vez, observando a saída:

```bash
git init
git status                      # "No commits yet": nada no banco ainda
# crie um arquivo notas.txt no editor, com uma linha qualquer
git status                      # notas.txt aparece como "untracked"
git add notas.txt
git status                      # agora em "Changes to be committed" (preparado)
git commit -m "Primeiro commit"
git log --oneline --decorate    # mostra o hash curto e (HEAD -> master), ou main
git cat-file -p HEAD            # o commit por dentro: tree, autor, mensagem
git cat-file -p "HEAD^{tree}"   # a tree: o nome notas.txt apontando para um blob
```

As aspas em `"HEAD^{tree}"` são necessárias no PowerShell, que trata `{ }` de forma especial. No Git Bash elas não atrapalham. O nome da branch inicial (`master` ou `main`) depende da configuração `init.defaultBranch`.

Agora edite `notas.txt`, faça um segundo commit e rode `git cat-file -p HEAD` de novo. Repare na linha nova, `parent`: é o hash do primeiro commit.

## Armadilhas comuns

- **Achar que `git add` é só para arquivo novo.** Ele prepara qualquer mudança. Arquivo editado depois do `add` precisa de outro `add`, senão o commit leva a versão antiga.
- **Confundir branch com cópia de pasta.** Branch não duplica arquivos: é só um ponteiro de 41 bytes.
- **Ter medo de "perder" commits.** Quase toda operação do Git só *adiciona* dados. Errou? O commit continua no banco, e o tópico *Desfazer coisas* mostra como recuperar.

## Leia na documentação oficial

1. [Pro Git 1.3 · O que é Git?](https://git-scm.com/book/pt-br/v2/Primeiros-Passos-O-que-%c3%a9-Git%3F): seções "Snapshots, não diferenças", "O Git tem integridade" e "Os Três Estados".
2. [Pro Git 3.1 · Branches em poucas palavras](https://git-scm.com/book/pt-br/v2/Ramifica%c3%a7%c3%a3o-Branching-no-Git-Branches-em-Poucas-Palavras): os objetos blob, tree e commit, e o que são branch e `HEAD`, com diagramas.
3. [git status](https://git-scm.com/docs/git-status): a referência do comando que você mais vai usar.
4. [git cat-file](https://git-scm.com/docs/git-cat-file): para inspecionar objetos como no "Na prática" acima.
5. Para ir além: [Pro Git 10.2 · Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) (em inglês), que monta um commit "na mão", sem `git commit`.

## Confira se entendeu

<details><summary>Se você editar um arquivo e der <code>git commit</code> sem <code>git add</code>, o que entra no commit?</summary>

Nada dessa mudança. O commit grava o que está na **área de preparo**, e a edição continua só no diretório de trabalho (estado *modificado*).
</details>

<details><summary>Por que criar uma branch é instantâneo, mesmo num projeto enorme?</summary>

Porque a branch é só um arquivo com o hash de um commit (40 caracteres). Nenhum arquivo do projeto é copiado.
</details>

<details><summary>O que tem dentro de um objeto commit?</summary>

Um ponteiro para a tree raiz (a foto do projeto), autor, data, mensagem e o(s) commit(s) pai.
</details>

<details><summary>O que o <code>HEAD</code> indica?</summary>

Em qual branch você está. Quando você faz um commit, é a branch apontada pelo `HEAD` que avança.
</details>
