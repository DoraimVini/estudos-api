# Relatório de sessões com map, filter e reduce

**Módulo 2 · JavaScript moderno · tópico: Arrays**

Você recebe uma lista de sessões de estudo, no mesmo formato que a API guarda:

```js
{ data: "2026-11-03", minutos: 50, topico: "Closures" }
```

## O que fazer

Complete as funções em `solucao.js`. **Nenhuma pode alterar o array recebido nem os objetos dentro dele.** Os testes congelam a entrada com `Object.freeze`, então qualquer mutação vira erro.

1. **`totalDeMinutos(sessoes)`**: soma de todos os minutos (`0` para lista vazia).
2. **`minutosPorTopico(sessoes)`**: objeto `{ topico: totalDeMinutos }`, por exemplo `{ Closures: 90, Arrays: 50 }`.
3. **`topicosMaisEstudados(sessoes, n)`**: os `n` tópicos com mais minutos, no formato `[{ topico, minutos }]`, do maior para o menor. Em caso de empate, ordem alfabética do tópico.
4. **`sessoesEntre(sessoes, de, ate)`**: sessões com `data` entre `de` e `ate` (inclusive), ordenadas da data mais antiga para a mais recente.

## Dicas
- `reduce` resolve 1 e 2. Em 3, transforme o resultado de 2 com `Object.entries` e depois `map`.
- `sort` **muda** o array original. Copie antes (`[...lista]` ou `toSorted`).
- Datas no formato `AAAA-MM-DD` podem ser comparadas como texto: `"2026-11-02" < "2026-11-10"`.
- Comparador de texto: `a.localeCompare(b)`.

## Rodar

```bash
npm run exercicio js/02
```

## Pronto quando
Os testes passam sem nenhum `for` e sem nenhuma variável `let`.
