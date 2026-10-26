> **Tempo estimado:** 45 min · **Fontes:** MDN (*JavaScript execution model* e *Microtask guide*) · javascript.info (*Event loop*) · Node.js (*The Node.js Event Loop*)

## Em poucas palavras

JavaScript executa **uma coisa de cada vez**, numa única linha de execução. Mesmo assim, ele espera rede, timers e cliques sem travar. O segredo é o **event loop**: o código que pode demorar é entregue ao ambiente (navegador ou Node), e quando o resultado fica pronto, um callback entra numa **fila**. O event loop pega da fila **só quando a pilha de execução está vazia**.

Entender isso explica por que `setTimeout(fn, 0)` não roda "na hora" e por que um laço pesado congela a página inteira.

## As peças

- **Pilha (*stack*)**: as funções que estão rodando agora. Uma chama a outra, empilha; termina, desempilha.
- **Fila de tarefas (*tasks*)**: callbacks de `setTimeout`, `setInterval`, eventos (clique), I/O.
- **Fila de microtarefas (*microtasks*)**: continuações de Promises (`.then`, o código depois de um `await`) e `queueMicrotask`.

## As regras

1. **Executa até o fim** (*run-to-completion*): uma tarefa que começou não é interrompida por outra.
2. Quando a pilha esvazia, o motor roda **todas** as microtarefas, inclusive as que forem criadas no meio desse processo.
3. Só então pega **uma** tarefa da fila (por exemplo, um `setTimeout`), roda, e volta para a regra 2.

```js
console.log("1: síncrono");
setTimeout(() => console.log("4: tarefa (timer)"), 0);
queueMicrotask(() => console.log("3: microtarefa"));
console.log("2: síncrono");
// 1, 2, 3, 4
```

Mesmo com `0` ms, o timer vai para a **fila de tarefas** e espera a pilha esvaziar e as microtarefas acabarem.

## Por que isso importa

```js
// Isto CONGELA a página por 3 segundos: nenhum clique, nenhum timer, nenhuma pintura
const fim = Date.now() + 3000;
while (Date.now() < fim) {}
```

Enquanto a pilha não esvazia, o event loop não roda nada. Por isso operações demoradas usam APIs assíncronas (`fetch`, `fs/promises`) em vez de esperar num laço. O mesmo vale para o servidor: uma rota Express com um laço pesado trava **todas** as requisições.

## E no Node?

O Node segue a mesma ideia, com a fila de tarefas dividida em **fases** (timers, I/O, `setImmediate`...). Para o dia a dia, as regras acima bastam. O `process.nextTick` tem uma fila própria, processada logo depois da operação atual, em qualquer fase. Chamado em excesso, ele impede o I/O de andar, por isso use com moderação.

## Na prática

Antes de rodar, **escreva no papel** a ordem que você espera. Depois rode com `node ordem.mjs`:

```js
setTimeout(() => console.log("A"), 0);
Promise.resolve().then(() => {
  console.log("B");
  queueMicrotask(() => console.log("C"));
});
console.log("D");
```

Se errou, descubra **qual regra** você aplicou errado, em vez de só decorar a resposta.

## Armadilhas comuns

- **Achar que `setTimeout(fn, 0)` roda imediatamente.** Roda depois de tudo que é síncrono e de todas as microtarefas.
- **Laço pesado no navegador ou numa rota do servidor**: trava tudo.
- **Microtarefas que criam microtarefas para sempre**: o loop nunca chega às tarefas, e a página congela do mesmo jeito.

## Leia na documentação oficial

1. [MDN · JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model#job_queue_and_event_loop): leia "Job queue and event loop", incluindo "Run-to-completion" e "Never blocking". (Esta página substituiu o antigo artigo "Event loop" da MDN.)
2. [MDN · Microtask guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide): a diferença entre tarefas e microtarefas, com `queueMicrotask`.
3. [javascript.info · Event loop](https://javascript.info/event-loop): a melhor explicação visual, com tarefas que você pode prever.
4. Para ir além: [Node.js · The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick), as fases do loop no Node.

## Pratique

Exercício com correção automática: **js/05 · Preveja a ordem do event loop**. O teste executa os trechos de verdade e compara com a sua previsão.

```bash
npm run exercicio js/05
```

## Confira se entendeu

<details><summary>Por que <code>setTimeout(fn, 0)</code> não roda imediatamente?</summary>

Porque o callback vai para a fila de tarefas, e só roda quando a pilha esvazia e todas as microtarefas pendentes terminam.
</details>

<details><summary>Quem roda primeiro: um <code>.then</code> ou um <code>setTimeout(..., 0)</code> agendados no mesmo momento?</summary>

O `.then`, porque é uma microtarefa, e todas as microtarefas rodam antes da próxima tarefa.
</details>

<details><summary>O que significa "executa até o fim" (<em>run-to-completion</em>)?</summary>

Que uma tarefa que começou roda até terminar antes de qualquer outra. Um callback nunca é interrompido no meio por outro.
</details>

<details><summary>Por que um laço pesado numa rota Express prejudica todos os usuários?</summary>

Porque enquanto o laço roda, a pilha não esvazia, e o event loop não consegue atender nenhuma outra requisição.
</details>
