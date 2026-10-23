> **Tempo estimado:** 45 min · **Fontes:** MDN (*Data types and data structures*, *Equality comparisons and sameness*, glossário *Falsy*)

## Em poucas palavras

JavaScript tem **tipagem dinâmica**: a variável não tem tipo, quem tem tipo é o valor. A mesma variável pode guardar um número e depois um texto. E tem **tipagem fraca**: quando uma operação recebe um tipo inesperado, a linguagem **converte sozinha** (*coerção*) em vez de dar erro. Isso é a fonte de quase todo comportamento "estranho" do JavaScript.

```js
42 + "1";   // "421"  (o número vira texto)
"42" - 1;   // 41     (o texto vira número)
```

## Os tipos

**7 primitivos**, valores imutáveis: `string`, `number`, `bigint`, `boolean`, `undefined`, `null` e `symbol`.

**Todo o resto é objeto**: objetos literais, arrays, funções, datas, `Map`... Objetos são **mutáveis** e comparados **por referência**.

```js
typeof "olá";      // "string"
typeof 3.14;       // "number"  (inteiro e decimal são o mesmo tipo)
typeof undefined;  // "undefined"
typeof null;       // "object"  ← peculiaridade histórica; teste null com === null
typeof [];         // "object"  ← para arrays, use Array.isArray([])
typeof (() => 1);  // "function"
```

- **`undefined`**: "não tem valor", ou seja, a variável existe mas nunca recebeu nada, ou a propriedade não existe.
- **`null`**: "vazio de propósito", algo que você atribui para dizer "não há valor aqui".

## `===` x `==`

| | `===` (estrita) | `==` (solta) |
|---|---|---|
| Converte tipos antes de comparar? | **Não** | Sim |
| `1 === "1"` / `1 == "1"` | `false` | `true` |
| `0 === ""` / `0 == ""` | `false` | `true` |
| `null === undefined` / `null == undefined` | `false` | `true` |

O `==` nem é transitivo: `"0" == 0` e `0 == ""` são `true`, mas `"0" == ""` é `false`. A própria MDN diz que o `===` é quase sempre a comparação certa. **Regra deste projeto: sempre `===`.**

Um caso especial: `NaN === NaN` é `false` (é o único valor diferente de si mesmo). Para testar, use `Number.isNaN(x)`.

## Truthy e falsy

Em `if`, `while`, `&&`, `||` e `!`, qualquer valor é convertido para booleano. São **falsy** só estes: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` e `NaN`. **Todo o resto é truthy**, inclusive `"0"`, `"false"`, `[]` e `{}`.

```js
if ([]) console.log("array vazio é truthy!");   // imprime
const nome = entrada || "anônimo";               // || usa o padrão se entrada for falsy (inclusive "")
const porta = config.porta ?? 3000;              // ?? só usa o padrão se for null ou undefined
```

Prefira `??` quando `0` ou `""` forem valores válidos: com `||`, uma porta `0` viraria `3000`.

## Na prática

Abra o console do navegador (F12) ou rode `node` no terminal e **preveja antes de apertar Enter**:

```js
typeof NaN
"5" * "2"
"5" + 2
[] + []
Boolean("0")
0 ?? 10
0 || 10
```

Depois confira com as tabelas da página *Equality comparisons and sameness*.

## Armadilhas comuns

- **`typeof null === "object"`**: use `valor === null`.
- **Somar dados de formulário**: valores de `<input>` chegam como string. `"10" + 5` dá `"105"`. Converta com `Number(valor)`.
- **Testar "tem valor?" com `if (x)`** quando `0` é válido. Use `x != null` ou `x ?? padrão`.
- **Comparar objetos com `===`** esperando comparar o conteúdo: `{a: 1} === {a: 1}` é `false` (são duas referências diferentes).

## Leia na documentação oficial

1. [MDN · Data types and data structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures): leia [Dynamic and weak typing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#dynamic_and_weak_typing), [Primitive values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values) e [Type coercion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#type_coercion).
2. [MDN · Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness): a tabela da seção [Comparing equality methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness#comparing_equality_methods) mostra cada caso de `==`.
3. [MDN · Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy): a lista completa de valores falsy.

## Confira se entendeu

<details><summary>O que dá <code>"3" + 4</code> e <code>"3" * 4</code>, e por quê?</summary>

`"34"` e `12`. Com `+`, se um lado é string, o outro vira string e os dois são concatenados. Com `*`, os dois lados viram número.
</details>

<details><summary>Por que preferir <code>===</code>?</summary>

Porque ele não converte tipos: o resultado é previsível. O `==` aplica regras de conversão difíceis de lembrar (e nem é transitivo).
</details>

<details><summary><code>[]</code> é truthy ou falsy?</summary>

Truthy. Só `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` e `NaN` são falsy.
</details>

<details><summary>Qual a diferença entre <code>x || 10</code> e <code>x ?? 10</code> quando <code>x</code> é <code>0</code>?</summary>

`x || 10` dá `10`, porque `0` é falsy. `x ?? 10` dá `0`, porque `??` só troca `null` e `undefined`.
</details>
