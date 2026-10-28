# Exercícios

Exercícios com correção automática para praticar os módulos da trilha:

| Pasta | Módulo da trilha | Exercícios |
|---|---|---|
| `git/` | 1 · Git e GitHub | staging, merge, conflito, remotos, desfazer, segredos ([como funcionam](#exercícios-de-git)) |
| `js/` | 2 · JavaScript moderno | closures, arrays, objetos, promises, event loop |
| `html/` | 3 · HTML, CSS e acessibilidade | semântica, formulário, acessibilidade ([como funcionam](#exercícios-de-html-e-css)) |
| `css/` | 3 · HTML, CSS e acessibilidade | preveja a cascata e o box model; calcule flexbox, grid e media queries |
| `node/` | 4 · Node e APIs REST | arquivos, HTTP puro, middlewares, validação, API REST |
| `sql/` | 5 · SQL e PostgreSQL | do `SELECT` à modelagem, sobre [o banco de uma loja](sql/README.md) |

## Como funciona

1. Veja a lista e o que falta: `npm run exercicio`.
2. Abra a pasta do exercício e leia o `README.md` (enunciado, dicas e critério de pronto).
3. Escreva sua resposta em `solucao.js`, `solucao.sql` ou `solucao.html` (nos de Git, veja [abaixo](#exercícios-de-git)). **Não mexa no `solucao.test.js`.**
4. Rode os testes daquele exercício:
   ```bash
   npm run exercicio js/01
   ```
   Basta o começo do nome (`js/01`, `sql/05`). Quando todos os testes passam, o exercício vira **Resolvido** no seu `estudos.db`, e a API para de sugeri-lo no `/proximo`.

O `/proximo` sugere exercícios dos módulos em que você está, e `GET /api/v1/exercicios/:id` devolve o enunciado.

## Exercícios de Git

Em Git não há função para escrever: você resolve com **comandos git de verdade**, e o teste confere o estado em que o repositório ficou.

1. `npm run exercicio git/01` na primeira vez **cria um repositório de treino** em `..\treino-git\01-staging\` (ao lado da pasta `estudos-api`, de propósito fora dela) e para com uma mensagem.
2. Abra **outro** terminal nessa pasta e resolva o que o `README.md` do exercício pede.
3. Volte ao terminal do `estudos-api` e rode `npm run exercicio git/01` de novo para conferir.
4. Quer recomeçar? Apague a pasta do treino (`..\treino-git\01-staging`) e rode o exercício de novo.

Alguns comandos (merge com commit, `revert`, o commit que conclui um conflito) abrem um **editor** para a mensagem. Sem configuração, o Git for Windows abre o **vim**: digite `:wq` e Enter para salvar e sair. Se preferir o VS Code, rode uma vez:

```bash
git config --global core.editor "code --wait"
```

## Exercícios de HTML e CSS

- **`html/`**: o `solucao.html` é uma página com problemas. Você a corrige e abre no navegador (dois cliques) para ver o resultado. O teste lê a **estrutura** do HTML (tags, atributos, rótulos, títulos), sem navegador.
- **`css/`**: você **prevê** o que o navegador faz (qual regra vence, qual a largura de cada item) e responde em `solucao.js`. Todas as respostas foram conferidas num navegador; no teste, o gabarito fica guardado só como hash, para você não ver a resposta por acidente.
- O que depende de desenhar a página (contraste, layout real, nota do Lighthouse) os testes **não** cobrem. Isso fica com o DevTools e com o mini-projeto do portfólio.

## Regras
- **A solução é sua.** Use a IA para tirar dúvidas e revisar, não para resolver. Um teste da API garante que nenhuma solução seja commitada no repositório.
- Errou? Leia a mensagem do teste: ela mostra o esperado e o recebido. Não ajuste a resposta às cegas.
- Estes testes ficam **fora** do `npm test` e do CI (eles falham até você resolver).
- Quer salvar suas soluções no Git? Faça numa branch sua, sem PR para a `develop`.
