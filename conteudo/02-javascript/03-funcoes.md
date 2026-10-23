> **Tempo estimado:** 45 min · **Fontes:** MDN, guia *Functions* · referência de *Arrow functions*, *Default parameters* e *Rest parameters*

## Em poucas palavras

Em JavaScript, **função é um valor** como outro qualquer: dá para guardar numa variável, passar como argumento e devolver de outra função. É isso que faz `array.map(fn)`, `addEventListener("click", fn)` e `setTimeout(fn, 1000)` funcionarem, e é a base de quase todo o JavaScript moderno.

## Três formas de criar uma função

```js
// 1. Declaração: tem nome e é "içada" (pode ser chamada antes da linha em que aparece)
function somar(a, b) {
  return a + b;
}

// 2. Expressão: a função é um valor atribuído a uma variável (não é içada)
const subtrair = function (a, b) {
  return a - b;
};

// 3. Arrow function: sintaxe curta, ótima para callbacks
const dobrar = (n) => n * 2;          // corpo sem chaves: o return é implícito
const ola = (nome) => {               // com chaves: precisa de return
  const texto = `Olá, ${nome}`;
  return texto;
};
```

| | Declaração | Expressão / arrow |
|---|---|---|
| Pode chamar antes de definir? | Sim (*hoisting*) | Não: `ReferenceError` |
| Tem `this` próprio? | Sim | Arrow: **não**, usa o de fora (veja *this e classes*) |

## Parâmetros

```js
// Valor padrão: usado quando o argumento vem undefined (ou não vem)
function saudacao(nome = "visitante") {
  return `Olá, ${nome}`;
}
saudacao();          // "Olá, visitante"

// Rest (...): junta os argumentos restantes num array de verdade
function media(...notas) {
  return notas.reduce((soma, n) => soma + n, 0) / notas.length;
}
media(7, 8, 9);      // 8

// Spread (...) na chamada: espalha um array em argumentos
const notas = [7, 8, 9];
Math.max(...notas);  // 9
```

O mesmo `...` tem dois papéis: na **definição** da função ele *junta* (rest); na **chamada** ele *espalha* (spread).

## Funções que recebem e devolvem funções

```js
const numeros = [1, 2, 3];
numeros.map(dobrar);                    // [2, 4, 6]: passamos a função, sem ()
numeros.map((n) => n * 10);             // [10, 20, 30]: função criada ali mesmo

function depoisDe(ms, acao) {           // recebe uma função
  setTimeout(acao, ms);
}
depoisDe(1000, () => console.log("1 segundo depois"));
```

Repare em `map(dobrar)` e **não** `map(dobrar())`: sem parênteses você passa **a função**; com parênteses, passaria **o resultado** de chamá-la.

## Na prática

Salve num arquivo `funcoes.mjs` e rode com `node funcoes.mjs`. No REPL, digitando linha por linha, o hoisting não aparece, porque cada linha roda sozinha.

```js
console.log(antes(2));       // funciona: declaração é içada
function antes(n) { return n + 1; }

console.log(depois(2));      // ReferenceError: expressão não é içada
const depois = (n) => n + 1;
```

Depois escreva uma função `aplicarDuasVezes(fn, valor)` que devolve `fn(fn(valor))` e teste com `dobrar`.

## Armadilhas comuns

- **Arrow com chaves sem `return`**: `(n) => { n * 2 }` devolve `undefined`. Ou tire as chaves, ou escreva `return`.
- **Devolver objeto em arrow sem parênteses**: `() => { id: 1 }` é lido como bloco de código. Use `() => ({ id: 1 })`.
- **Passar `fn()` em vez de `fn`** para um callback.
- **Usar arrow como método de objeto** que precisa de `this`. Ela não tem `this` próprio.

## Leia na documentação oficial

1. [MDN · Functions (guia)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions): leia [Defining functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#defining_functions), [Function hoisting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#function_hoisting), [Function parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#function_parameters) e [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#arrow_functions).
2. [MDN · Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions): referência, incluindo as limitações (sem `this` próprio, não serve como construtor).
3. [MDN · Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax): os usos do `...` em chamadas, arrays e objetos.

## Confira se entendeu

<details><summary>Qual a diferença entre <code>numeros.map(dobrar)</code> e <code>numeros.map(dobrar())</code>?</summary>

O primeiro passa a função para o `map` chamar em cada item. O segundo chama `dobrar()` uma vez, sem argumento, e passa o resultado (`NaN`) para o `map`, o que dá erro.
</details>

<details><summary>Por que dá para chamar uma função declarada antes da linha em que ela aparece, mas não uma arrow function em <code>const</code>?</summary>

Declarações de função são içadas (*hoisting*) inteiras. Uma arrow em `const` é um valor atribuído a uma variável, que fica na zona morta temporal até a linha da declaração.
</details>

<details><summary>O que <code>(...notas)</code> recebe em <code>media(7, 8, 9)</code>?</summary>

Um array `[7, 8, 9]` com todos os argumentos passados (rest parameters).
</details>

<details><summary>Por que <code>() =&gt; { id: 1 }</code> devolve <code>undefined</code>?</summary>

Porque as chaves são lidas como o corpo da função, e não como um objeto. Para devolver o objeto: `() => ({ id: 1 })`.
</details>
