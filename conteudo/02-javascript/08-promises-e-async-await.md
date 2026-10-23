> **Tempo estimado:** 60 min · **Fontes:** MDN (guia *Using promises*, referência de `async function` e `Promise.all()`)

## Em poucas palavras

Uma **Promise** representa um resultado que **ainda não chegou**: uma resposta de rede, a leitura de um arquivo, uma consulta ao banco. Ela começa **pendente** (*pending*) e termina **cumprida** (*fulfilled*, com um valor) ou **rejeitada** (*rejected*, com um erro). Depois disso, não muda mais (*settled*).

**`async`/`await`** é uma forma mais legível de usar Promises: o código parece sequencial, mas não trava o programa enquanto espera.

## Do `.then` ao `await`

```js
// Com .then: cada .then devolve uma Promise nova, o que permite encadear
fetch("/api/v1/status")
  .then((resposta) => resposta.json())
  .then((dados) => console.log(dados.ok))
  .catch((erro) => console.error("falhou:", erro.message));

// O mesmo com async/await
async function verificarStatus() {
  try {
    const resposta = await fetch("/api/v1/status");
    const dados = await resposta.json();
    console.log(dados.ok);
  } catch (erro) {
    console.error("falhou:", erro.message);
  }
}
```

Regras de `async`/`await`:
- Uma função `async` **sempre devolve uma Promise**, mesmo que você dê `return 5`.
- `await` **pausa só aquela função** até a Promise terminar. O resto do programa continua.
- Uma Promise rejeitada vira um **erro lançado** no `await`, e é por isso que `try/catch` funciona.

## Sequencial x paralelo

```js
// Sequencial: a segunda busca só começa quando a primeira termina (soma dos tempos)
const usuario = await buscarUsuario(id);
const pedidos = await buscarPedidos(id);

// Paralelo: as duas começam juntas (tempo da mais lenta)
const [usuario2, pedidos2] = await Promise.all([buscarUsuario(id), buscarPedidos(id)]);
```

Use sequencial **só quando uma etapa depende do resultado da anterior**.

## Combinando várias Promises

| Método | Resolve quando | Rejeita quando |
|---|---|---|
| `Promise.all([...])` | **todas** cumprem (valores na mesma ordem) | **qualquer uma** rejeita, na hora (*fail-fast*) |
| `Promise.allSettled([...])` | **todas terminam**, bem ou mal | nunca: você recebe o resultado de cada uma |
| `Promise.race([...])` | a **primeira que terminar**, bem ou mal | idem |
| `Promise.any([...])` | a **primeira que cumprir** | todas rejeitam |

## Na prática

```js
const esperar = (ms, valor) => new Promise((resolve) => setTimeout(() => resolve(valor), ms));

console.time("sequencial");
await esperar(300, "a");
await esperar(300, "b");
console.timeEnd("sequencial");      // ~600 ms

console.time("paralelo");
await Promise.all([esperar(300, "a"), esperar(300, "b")]);
console.timeEnd("paralelo");        // ~300 ms
```

Salve como `promessas.mjs` e rode com `node promessas.mjs` (o `await` fora de função só funciona em módulos).

## Armadilhas comuns

- **Esquecer o `await`**: `const dados = buscar()` guarda a Promise, e não o resultado. Sintoma: `[object Promise]` ou `undefined` onde você esperava dados.
- **Esquecer o `return` dentro do `.then`**: a Promise interna fica "flutuando", e o próximo `.then` recebe `undefined`.
- **`await` em sequência sem necessidade** dentro de um laço: cada volta espera a anterior. Monte o array de Promises e use `Promise.all`.
- **Rejeição sem tratamento**: sem `catch`/`try`, o Node avisa *unhandled rejection* e pode encerrar o processo.

## Leia na documentação oficial

1. [MDN · Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises): leia [Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#chaining), [Error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#error_handling) e [Composition](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#composition).
2. [MDN · async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function): a seção [await and concurrency](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function#await_and_concurrency) compara os tempos de sequencial e paralelo.
3. [MDN · Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) e [Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).

## Pratique

Exercício com correção automática: **js/04 · Buscas em paralelo, falhas e timeout**.

```bash
npm run exercicio js/04
```

## Confira se entendeu

<details><summary>Quais são os estados de uma Promise?</summary>

Pendente (*pending*), cumprida (*fulfilled*) ou rejeitada (*rejected*). Depois de cumprida ou rejeitada, ela está "resolvida" (*settled*) e não muda mais.
</details>

<details><summary>O que uma função <code>async</code> devolve se você fizer <code>return 5</code>?</summary>

Uma Promise que cumpre com o valor `5`.
</details>

<details><summary>Duas buscas independentes de 1 segundo cada: quanto tempo leva com dois <code>await</code> seguidos? E com <code>Promise.all</code>?</summary>

Cerca de 2 segundos em sequência e cerca de 1 segundo com `Promise.all`, porque as duas começam juntas.
</details>

<details><summary>Quando usar <code>allSettled</code> em vez de <code>all</code>?</summary>

Quando você quer o resultado de todas, mesmo que algumas falhem. O `all` rejeita na primeira falha e descarta o resto.
</details>
