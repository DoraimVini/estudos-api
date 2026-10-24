> **Tempo estimado:** 50 min · **Fontes:** MDN (referência de `Array`, `sort` e `reduce`, guia *Indexed collections*)

## Em poucas palavras

Quase todo dado que chega numa aplicação é uma **lista**: sessões, tópicos, produtos, usuários. Os métodos de array (`map`, `filter`, `reduce`, `find`, `sort`...) substituem a maioria dos laços `for` e deixam claro **o que** você quer, e não **como** percorrer.

A distinção mais importante: alguns métodos **devolvem um array novo** e outros **alteram o array original**. Misturar os dois é a origem de muitos bugs.

## Os métodos que você mais vai usar

```js
const pedidos = [
  { cliente: "Ana", valor: 120, pago: true },
  { cliente: "Bruno", valor: 80, pago: false },
  { cliente: "Carla", valor: 200, pago: true },
];

pedidos.map((p) => p.cliente);              // ["Ana", "Bruno", "Carla"]: transforma cada item
pedidos.filter((p) => p.pago);              // só os pagos: escolhe itens
pedidos.find((p) => p.valor > 100);         // { cliente: "Ana", ... }: o PRIMEIRO que atende
pedidos.some((p) => !p.pago);               // true: algum atende?
pedidos.every((p) => p.valor > 50);         // true: todos atendem?
pedidos.reduce((total, p) => total + p.valor, 0);   // 400: reduz a lista a um valor
```

E dá para encadear, já que cada um devolve um array novo:

```js
pedidos
  .filter((p) => p.pago)
  .map((p) => p.valor)
  .reduce((total, v) => total + v, 0);      // 320
```

## `reduce` sem susto

`reduce(fn, valorInicial)` passa por cada item carregando um **acumulador**: o que a função devolve vira o acumulador da próxima volta.

```text
volta 1: total = 0   + 120 = 120
volta 2: total = 120 + 80  = 200
volta 3: total = 200 + 200 = 400
```

**Sempre passe o valor inicial.** Sem ele, `[].reduce(...)` lança `TypeError`. A MDN também recomenda **não** usar `reduce` quando um `for...of` ou um método específico (`some`, `find`, `Object.groupBy`) deixa o código mais claro.

## Quem altera o original

| Altera o array (cuidado) | Versão que devolve um novo |
|---|---|
| `sort()` | `toSorted()` |
| `reverse()` | `toReversed()` |
| `splice()` | `toSpliced()` |
| `push()` / `pop()` | `concat()` / `slice(0, -1)` |
| `arr[i] = x` | `arr.with(i, x)` |

`map`, `filter`, `slice` e `concat` nunca alteram o original. Em React, e em qualquer código que compartilha dados, prefira as versões que devolvem um array novo.

## `sort` precisa de comparador

Sem comparador, `sort` **converte tudo para texto** e ordena como dicionário:

```js
[10, 9, 1].sort();                          // [1, 10, 9]  ← "10" vem antes de "9"
[10, 9, 1].toSorted((a, b) => a - b);       // [1, 9, 10]  crescente
pedidos.toSorted((a, b) => b.valor - a.valor);              // maior valor primeiro
pedidos.toSorted((a, b) => a.cliente.localeCompare(b.cliente));  // texto, respeitando acentos
```

A função devolve **negativo** (a vem antes), **positivo** (b vem antes) ou **zero** (mantém a ordem). Desde o ES2019, o `sort` é **estável**: itens empatados mantêm a ordem original.

## Na prática

Com o array `pedidos` acima, escreva sem nenhum `for`:
1. os nomes dos clientes que **não** pagaram;
2. o pedido de maior valor;
3. a lista ordenada por cliente (sem alterar `pedidos`). Confira com `console.log(pedidos)` que o original ficou igual.

## Armadilhas comuns

- **`sort()` sem comparador em números.**
- **`sort()` alterando um array que era de outra parte do código.** Use `toSorted()`.
- **`map` sem `return`** numa arrow com chaves: o resultado vira `[undefined, undefined, ...]`.
- **Usar `map` só para percorrer**, sem usar o resultado. Para isso existe `forEach` (ou `for...of`).
- **`find` devolve `undefined`** se nada atender. Trate esse caso.

## Leia na documentação oficial

1. [MDN · Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array): a seção [Copying methods and mutating methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods) tem a tabela completa de quem altera o original.
2. [MDN · Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description): como funciona o comparador e por que a ordem padrão é de texto.
3. [MDN · Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce): veja também [When to not use reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#when_to_not_use_reduce).

## Pratique

Exercício com correção automática: **js/02 · Relatório de sessões com map, filter e reduce** (os testes congelam o array: qualquer mutação vira erro).

```bash
npm run exercicio js/02
```

## Confira se entendeu

<details><summary>Qual a diferença entre <code>map</code>, <code>filter</code> e <code>find</code>?</summary>

`map` transforma cada item e devolve um array do mesmo tamanho. `filter` devolve um array só com os itens que atendem. `find` devolve o primeiro item que atende (ou `undefined`).
</details>

<details><summary>Por que <code>[10, 9, 1].sort()</code> dá <code>[1, 10, 9]</code>?</summary>

Porque, sem comparador, o `sort` converte os números em texto e compara como texto: `"10"` vem antes de `"9"`.
</details>

<details><summary>Por que sempre passar o valor inicial no <code>reduce</code>?</summary>

Porque, sem ele, um array vazio lança `TypeError`. Além disso, o valor inicial deixa claro o tipo do resultado (`0` para soma, `{}` para objeto).
</details>

<details><summary>Como ordenar sem alterar o array original?</summary>

Com `toSorted(comparador)`, ou copiando antes: `[...arr].sort(comparador)`.
</details>
