# Buscas em paralelo, falhas e timeout

**Módulo 2 · JavaScript moderno · tópico: Promises e async/await**

Nos testes, `buscar(id)` é uma função assíncrona (como uma chamada de rede) que devolve uma Promise. Você não precisa saber como ela funciona por dentro.

## O que fazer

Complete as funções em `solucao.js`:

1. **`buscarTodos(ids, buscar)`**: busca todos os ids **em paralelo** (não um depois do outro) e devolve os resultados na mesma ordem dos ids. Se qualquer busca falhar, a Promise rejeita.
2. **`buscarComFalhas(ids, buscar)`**: busca todos em paralelo, mas não rejeita. Devolve:
   ```js
   { ok: [{ id, valor }], falhas: [{ id, erro: "mensagem do erro" }] }
   ```
   As duas listas mantêm a ordem dos ids.
3. **`comTimeout(promessa, ms)`**: devolve uma Promise que resolve com o valor de `promessa` se ela terminar antes de `ms` milissegundos. Senão, rejeita com `new Error("Tempo esgotado após {ms} ms")`. Se `promessa` rejeitar antes, repasse o mesmo erro.
4. **`tentarDeNovo(fn, tentativas)`**: chama `await fn()` até dar certo, no máximo `tentativas` vezes. Devolve o primeiro sucesso, ou rejeita com o erro da última tentativa.

## Dicas
- `Promise.all`, `Promise.allSettled` e `Promise.race` resolvem 1, 2 e 3.
- Em 3, `setTimeout` dentro de `new Promise((_, rejeitar) => …)` cria a Promise "do relógio".
- Bônus em 3: limpar o timer com `clearTimeout` quando a promessa termina antes (os testes não exigem).
- `await` dentro de `for` roda em sequência, que é o que você quer em 4 e **não** quer em 1.

## Rodar

```bash
npm run exercicio js/04
```

## Pronto quando
Os testes passam e você explica por que `for` + `await` em 1 seria correto, mas lento.
