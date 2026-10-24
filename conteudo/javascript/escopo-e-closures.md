> **Tempo estimado:** 50 min · **Fontes:** MDN (guia *Closures* e referência de `let`) · javascript.info (*Variable scope, closure*)

## Em poucas palavras

**Escopo** é a região do código em que uma variável existe. Em JavaScript, ele é **léxico**: é definido pela *posição em que você escreveu* a variável, e não por onde a função é chamada.

**Closure** é a combinação de uma função com o ambiente onde ela foi criada. Uma função criada dentro de outra **continua enxergando as variáveis de fora**, mesmo depois que a função de fora terminou. Em JavaScript **toda função é uma closure**: ela guarda uma referência interna (`[[Environment]]`) para o ambiente em que nasceu.

## Escopo de bloco: `let` e `const` x `var`

| | `let` / `const` | `var` |
|---|---|---|
| Escopo | o **bloco** `{ }` mais próximo (`if`, `for`, função…) | a **função** inteira |
| Antes da declaração | `ReferenceError` (zona morta temporal, TDZ) | vale `undefined` |
| Declarar duas vezes no mesmo escopo | `SyntaxError` | permitido (e perigoso) |

```js
if (true) {
  let dentro = "só aqui";
  var vaza = "escapei do if";
}
console.log(vaza);   // "escapei do if"
console.log(dentro); // ReferenceError: dentro is not defined

console.log(cedo);   // ReferenceError: Cannot access 'cedo' before initialization
let cedo = 1;        // da abertura do bloco até aqui, "cedo" está na TDZ
```

Regra prática: use `const` por padrão, `let` quando precisar reatribuir e **nunca `var`**.

## Closure na prática

Uma **função fábrica** cria funções que "lembram" um valor:

```js
function criarMultiplicador(fator) {
  return (numero) => numero * fator; // usa "fator", que é de fora
}

const dobro = criarMultiplicador(2);
const triplo = criarMultiplicador(3);

dobro(5);  // 10
triplo(5); // 15
```

`criarMultiplicador` já terminou nas duas chamadas, mas cada função devolvida guardou **o seu próprio** ambiente: em `dobro`, `fator` vale 2; em `triplo`, vale 3. É o mesmo corpo de função com ambientes diferentes.

Usos que você vai ver o tempo todo:
- **estado privado**: uma variável que só as funções devolvidas conseguem ler e alterar, o "padrão módulo";
- **callbacks** (`addEventListener`, `setTimeout`, `.then`) que usam variáveis do lugar onde foram criados;
- **configurar uma vez e usar depois**, como `criarMultiplicador`.

## A armadilha clássica: closure dentro de laço

```js
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log("var:", i), 0);
}
// var: 4, var: 4, var: 4

for (let j = 1; j <= 3; j++) {
  setTimeout(() => console.log("let:", j), 0);
}
// let: 1, let: 2, let: 3
```

Com `var`, existe **uma única** variável `i` para o laço inteiro. As três funções guardam o mesmo ambiente, e quando elas rodam o laço já terminou com `i = 4`. Com `let`, **cada volta do laço ganha uma variável nova**, e cada função guarda a sua.

## Armadilhas comuns

- **Achar que a closure copia o valor.** Ela guarda o *ambiente*, ou seja, a variável viva. Se a variável mudar depois, a função enxerga o valor novo.
- **Usar `var` em laço com callback**, como no exemplo acima.
- **Esquecer que closures prendem memória.** O ambiente só é liberado quando nenhuma função que o usa continua existindo. Em geral não é problema, mas explica vazamentos em listeners nunca removidos.

## Leia na documentação oficial

1. [MDN · Closures](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Closures) (português): escopo léxico, fábricas de funções, métodos privados e o erro em laços. A [versão em inglês](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) tem uma seção a mais, *Closure scope chain*.
2. [MDN · `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz) (inglês): escopo de bloco, TDZ e redeclaração. **Evite a versão em português desta página**: ela está desatualizada e afirma, por exemplo, que blocos não têm escopo.
3. [javascript.info · Variable scope, closure](https://javascript.info/closure): explica o *Lexical Environment* passo a passo, com diagramas. É a melhor leitura para entender **por que** funciona.

## Pratique

Exercício com correção automática: **[js/01 · Contador e gerador de ids com closures](#/trilha/2)**

```bash
npm run exercicio js/01
```

## Confira se entendeu

<details><summary>O que "escopo léxico" quer dizer?</summary>

Que o escopo de uma variável é decidido por onde ela foi **escrita** no código, e não por onde a função é chamada. Uma função enxerga as variáveis dos blocos e funções que a envolvem no texto.
</details>

<details><summary>Por que o laço com <code>var</code> imprime 4, 4, 4?</summary>

Porque `var` tem escopo de função: existe uma só variável `i`, compartilhada pelas três funções. Quando elas rodam, o laço já acabou e `i` vale 4. Com `let`, cada volta cria uma variável nova.
</details>

<details><summary>Depois de <code>const dobro = criarMultiplicador(2)</code>, onde fica guardado o 2?</summary>

No ambiente léxico da chamada `criarMultiplicador(2)`, que a função devolvida mantém vivo pela referência `[[Environment]]`.
</details>

<details><summary>O que acontece ao ler uma variável <code>let</code> antes da linha em que ela é declarada?</summary>

`ReferenceError`: do início do bloco até a declaração, a variável está na zona morta temporal (TDZ). Com `var`, o resultado seria `undefined`.
</details>
