# Exercícios

Exercícios com correção automática para praticar os módulos da trilha:

| Pasta | Módulo da trilha | Exercícios |
|---|---|---|
| `js/` | 2 · JavaScript moderno | closures, arrays, objetos, promises, event loop |
| `node/` | 4 · Node e APIs REST | arquivos, HTTP puro, middlewares, validação, API REST |
| `sql/` | 5 · SQL e PostgreSQL | do `SELECT` à modelagem, sobre [o banco de uma loja](sql/README.md) |

## Como funciona

1. Veja a lista e o que falta: `npm run exercicio`.
2. Abra a pasta do exercício e leia o `README.md` (enunciado, dicas e critério de pronto).
3. Escreva sua resposta em `solucao.js` ou `solucao.sql`. **Não mexa no `solucao.test.js`.**
4. Rode os testes daquele exercício:
   ```bash
   npm run exercicio js/01
   ```
   Basta o começo do nome (`js/01`, `sql/05`). Quando todos os testes passam, o exercício vira **Resolvido** no seu `estudos.db`, e a API para de sugeri-lo no `/proximo`.

O `/proximo` sugere exercícios dos módulos em que você está, e `GET /api/v1/exercicios/:id` devolve o enunciado.

## Regras
- **A solução é sua.** Use a IA para tirar dúvidas e revisar, não para resolver. Um teste da API garante que nenhuma solução seja commitada no repositório.
- Errou? Leia a mensagem do teste: ela mostra o esperado e o recebido. Não ajuste a resposta às cegas.
- Estes testes ficam **fora** do `npm test` e do CI (eles falham até você resolver).
- Quer salvar suas soluções no Git? Faça numa branch sua, sem PR para a `develop`.
