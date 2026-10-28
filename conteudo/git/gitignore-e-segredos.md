> **Tempo estimado:** 35 min · **Fontes:** Pro Git, seção 2.2 (Ignorando Arquivos) · documentação de `gitignore` · GitHub (*Remover dados confidenciais*)

## Em poucas palavras

O `.gitignore` lista o que o Git deve **fingir que não existe**: dependências (`node_modules/`), arquivos gerados (`coverage/`), bancos locais (`*.db`) e, principalmente, **segredos** (`.env`). Arquivos ignorados não aparecem no `git status` e não entram no `git add .`.

O `.gitignore` só vale para arquivos que **ainda não são rastreados**. Se você já commitou um arquivo, colocá-lo no `.gitignore` não faz o Git esquecê-lo.

## Os padrões

```gitignore
# Comentários só em linha própria, começando com #
# barra no fim: só pastas
node_modules/
# qualquer arquivo .db, em qualquer pasta
*.db
# ! cria uma exceção: este .db não é ignorado
!exemplo.db
# o arquivo .env, em qualquer pasta
.env
# barra no início: só na raiz do projeto
/TODO.md
# ** atravessa qualquer número de pastas
docs/**/*.pdf
```

Atenção: **não existe comentário no fim da linha**. Em `.env  # segredo`, o `#` vira parte do padrão, e o `.env` deixa de ser ignorado.

O `.gitignore` deste projeto tem `node_modules/`, `*.db`, `*.db-journal`, `.env` e `coverage/`. Por isso o seu `estudos.db`, com o seu progresso, nunca vai para o GitHub.

## Quando um arquivo já foi commitado

```bash
git rm --cached config.local.json      # tira do Git, mas mantém o arquivo no disco
# adicione config.local.json ao .gitignore
git commit -m "Para de versionar config.local.json"
```

Para descobrir **qual regra** está ignorando um arquivo: `git check-ignore -v caminho`.

## E se um segredo vazar?

Uma senha, token ou chave de API que chegou ao GitHub deve ser considerada **comprometida**, mesmo que você apague o commit logo depois. Robôs vasculham repositórios públicos atrás de chaves em minutos.

1. **Primeiro, revogue ou troque a credencial** no serviço (gere outro token, troque a senha). Isso resolve o problema de segurança.
2. Só depois, se for necessário, **reescreva o histórico** para tirar o segredo. É trabalhoso, muda os hashes, afeta os PRs, e cópias em forks e clones continuam existindo.

A prevenção é mais barata: `.env` no `.gitignore` desde o primeiro commit e um `.env.example` (sem valores reais) versionado, mostrando quais variáveis existem.

## Na prática

Numa pasta de teste:

```bash
git init ignorar
cd ignorar
# crie .env com SENHA=123, e app.js com uma linha qualquer
git status                 # .env e app.js aparecem como untracked
# crie .gitignore com a linha: .env
git status                 # .env sumiu; app.js e .gitignore continuam
git check-ignore -v .env   # .gitignore:1:.env   .env
```

## Armadilhas comuns

- **Pôr no `.gitignore` um arquivo que já está commitado** e achar que resolveu. Precisa do `git rm --cached`.
- **Apagar o segredo num commit novo** e achar que resolveu. Ele continua no histórico. Revogue a credencial.
- **Versionar `node_modules/`.** São milhares de arquivos que o `npm install` recria a partir do `package-lock.json`.
- **Ignorar demais**: um `*.json` no `.gitignore` também esconde o `package.json`.

## Leia na documentação oficial

1. [Pro Git 2.2 · Gravando Alterações no Repositório](https://git-scm.com/book/pt-br/v2/Fundamentos-do-Git-Gravando-Altera%c3%a7%c3%b5es-no-Reposit%c3%b3rio): a seção "Ignorando Arquivos" explica cada padrão com exemplos.
2. [gitignore · PATTERN FORMAT](https://git-scm.com/docs/gitignore#_pattern_format): a referência completa dos padrões. Veja também [NOTES](https://git-scm.com/docs/gitignore#_notes), sobre arquivos já rastreados.
3. [GitHub · Remover dados confidenciais de um repositório](https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository): por que revogar vem primeiro, e o custo de reescrever o histórico.

## Pratique

Exercício com correção automática: **git/06 · Tirar o .env e o node_modules do repositório**. Na primeira vez, o comando cria um repositório de treino em `..\treino-git\` e diz onde ele está; você resolve lá com comandos git, e o teste confere o resultado.

```bash
npm run exercicio git/06
```

## Confira se entendeu

<details><summary>Você adicionou <code>config.json</code> ao <code>.gitignore</code>, mas ele continua aparecendo como modificado. Por quê?</summary>

Porque ele já era rastreado. O `.gitignore` só vale para arquivos não rastreados. Use `git rm --cached config.json` e faça o commit.
</details>

<details><summary>Qual a diferença entre <code>build/</code> e <code>/build</code> no <code>.gitignore</code>?</summary>

`build/` ignora qualquer **pasta** chamada build, em qualquer nível. `/build` ignora `build` (arquivo ou pasta) só na raiz do projeto.
</details>

<details><summary>Você enviou um token de API para o GitHub. Qual o primeiro passo?</summary>

Revogar ou trocar o token no serviço. Limpar o histórico vem depois, e sozinho não resolve.
</details>

<details><summary>Para que serve um <code>.env.example</code> versionado?</summary>

Para documentar quais variáveis de ambiente o projeto precisa, sem expor os valores reais.
</details>
