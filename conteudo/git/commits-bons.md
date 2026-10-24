> **Tempo estimado:** 40 min · **Fontes:** Pro Git, seções 2.2 e 5.2 (Diretrizes de Commit) · documentação de `git commit`

## Em poucas palavras

Um bom commit é **uma mudança lógica, completa e com um porquê**. Se você corrige um bug e também renomeia variáveis em outro arquivo, são dois commits. Um histórico assim é fácil de revisar, de entender meses depois e de desfazer: dá para reverter só a parte que deu errado.

A área de preparo existe justamente para isso: você **escolhe** o que entra em cada commit, em vez de mandar tudo de uma vez.

## Antes de commitar: veja o que vai entrar

| Comando | Mostra |
|---|---|
| `git status -s` | Resumo em duas colunas: a da esquerda é a área de preparo e a da direita, o diretório de trabalho. `??` = não rastreado, `A` = novo preparado, `M` = modificado |
| `git diff` | O que mudou e **ainda não** foi preparado |
| `git diff --staged` | O que **vai entrar** no próximo commit |
| `git diff --check` | Espaços em branco sobrando, que poluem o diff |

`git diff` sozinho não mostra tudo desde o último commit: se você já preparou tudo, ele não mostra nada. Para revisar o commit, use `--staged`.

## A mensagem

O formato recomendado pela documentação do Git e pelo Pro Git:

```text
Corrige a data das sessões registradas à noite

toISOString() usa UTC, então uma sessão às 22h em São Paulo
ficava com a data do dia seguinte. Agora a data vem de
hojeISO(), que usa o fuso America/Sao_Paulo.
```

- **Primeira linha: resumo curto**, de até uns 50 caracteres. Ela vira o "título" do commit no `git log --oneline`, no GitHub e nas ferramentas.
- **Uma linha em branco.**
- **Corpo (opcional)**: **por que** a mudança foi feita e o que era diferente antes. O *como* o diff já mostra.

O Pro Git recomenda o **modo imperativo** em inglês ("Fix bug", não "Fixed bug"). Em português, muitos projetos usam o presente, como este ("Adiciona…", "Corrige…"). O importante é ser **consistente** dentro do projeto.

## Na prática

```bash
git status -s
git add -p            # vai mostrando cada trecho alterado: y = incluir, n = pular, q = sair
git diff --staged     # revise o que vai entrar
git commit            # abre o editor para escrever resumo + corpo
git log --oneline -5  # confira como ficou
```

O `git add -p` (de *patch*) é a ferramenta para separar duas mudanças feitas no mesmo arquivo em dois commits.

Errou a mensagem ou esqueceu um arquivo **no último commit, que ainda não foi enviado**?

```bash
git add arquivo-esquecido.js
git commit --amend    # substitui o último commit por um novo, com o arquivo e a mensagem corrigida
```

## Armadilhas comuns

- **Commits "WIP", "ajustes" e "mudanças".** Daqui a um mês, ninguém (nem você) sabe o que eles fazem.
- **Um commit gigante no fim do dia** misturando três assuntos. Fica impossível reverter só um deles.
- **`git commit -a` sem olhar.** Ele prepara *todos* os arquivos rastreados modificados, inclusive aquele `console.log` de teste. (Arquivos novos ficam de fora.)
- **`--amend` em commit já enviado.** Ele cria um commit novo com outro hash. Se alguém já baixou o antigo, você vai precisar forçar o push e bagunçar o histórico dos outros.

## Leia na documentação oficial

1. [Pro Git 2.2 · Gravando Alterações no Repositório](https://git-scm.com/book/pt-br/v2/Fundamentos-do-Git-Gravando-Altera%c3%a7%c3%b5es-no-Reposit%c3%b3rio): seções "Status Curto" e "Visualizando suas Alterações Preparadas e Não Preparadas".
2. [Pro Git 5.2 · Contribuindo com um Projeto](https://git-scm.com/book/pt-br/v2/Git-Distribu%c3%addo-Contribuindo-com-um-Projeto): leia a seção **"Diretrizes de Commit"** (o resto do capítulo pode ficar para depois).
3. [git commit · DISCUSSION](https://git-scm.com/docs/git-commit#_discussion): o formato da mensagem segundo a documentação oficial, e a opção `--amend`.

## Confira se entendeu

<details><summary>Qual a diferença entre <code>git diff</code> e <code>git diff --staged</code>?</summary>

`git diff` mostra o que mudou no diretório de trabalho e ainda **não** foi preparado. `git diff --staged` mostra o que já está na área de preparo, ou seja, o que vai entrar no próximo commit.
</details>

<details><summary>Você corrigiu um bug e, no mesmo arquivo, renomeou uma função sem relação com ele. Como fazer dois commits?</summary>

Com `git add -p`: prepare só os trechos do bug e faça o commit. Depois prepare o restante e faça o segundo commit.
</details>

<details><summary>O que vai no corpo da mensagem, e o que não precisa ir?</summary>

O **porquê** da mudança e o que era diferente antes. O *como* não precisa: o diff já mostra.
</details>

<details><summary>Quando <strong>não</strong> usar <code>git commit --amend</code>?</summary>

Quando o commit já foi enviado (push) e outras pessoas podem ter baixado. O amend troca o hash do commit e obriga a forçar o push.
</details>
