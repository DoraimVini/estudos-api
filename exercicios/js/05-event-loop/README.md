# Preveja a ordem do event loop

**Módulo 2 · JavaScript moderno · tópico: Event loop**

Aqui você não escreve funções: você **prevê** em que ordem cada trecho imprime as mensagens. Preencha os arrays em `solucao.js` **antes** de rodar qualquer coisa. O teste executa os trechos de verdade e compara com a sua previsão.

## Trecho 1 → `ordem1`

```js
log("A");
setTimeout(() => log("B"), 0);
Promise.resolve().then(() => log("C"));
log("D");
```

## Trecho 2 → `ordem2`

```js
async function f() {
  log("1");
  await null;
  log("2");
}
log("3");
f();
log("4");
```

## Trecho 3 → `ordem3`

```js
setTimeout(() => log("timeout"));
queueMicrotask(() => log("micro"));
Promise.resolve()
  .then(() => {
    log("then1");
    setTimeout(() => log("timeout2"));
  })
  .then(() => log("then2"));
log("sync");
```

## Regras que você precisa saber
1. Todo o código síncrono roda primeiro, até o fim.
2. Depois, **todas** as microtarefas (`.then`, `await`, `queueMicrotask`), inclusive as que forem criadas no meio do caminho.
3. Só então uma tarefa (`setTimeout`), depois todas as microtarefas de novo, e assim por diante.

## Rodar

```bash
npm run exercicio js/05
```

Errou? Não troque a resposta às cegas: descubra qual regra você aplicou errado.

## Pronto quando
Você acerta os três e explica o trecho 3 passo a passo, dizendo o que está em cada fila.
