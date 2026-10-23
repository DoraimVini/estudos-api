> **Tempo estimado:** 45 min · **Fontes:** MDN (guia *Working with objects*, referência de *Destructuring*, glossário *Shallow copy*, `structuredClone()`)

## Em poucas palavras

Objeto é um conjunto de **pares chave → valor**. Quase todo JSON que entra e sai de uma API vira objeto. Três coisas mudam o jeito de trabalhar com eles:

1. **Desestruturação**: tirar valores de dentro do objeto numa linha só.
2. **Spread (`...`)**: criar um objeto novo a partir de outro, sem alterar o original.
3. **Referência**: variáveis guardam um *endereço* do objeto, e não uma cópia. Duas variáveis podem apontar para o mesmo objeto.

## Acesso e enumeração

```js
const sessao = { topico: "Closures", minutos: 50, "data-registro": "2026-11-03" };

sessao.topico;                // ponto: nome fixo e válido como identificador
sessao["data-registro"];      // colchetes: nome com hífen, espaço ou vindo de variável
const campo = "minutos";
sessao[campo];                // 50

Object.keys(sessao);          // ["topico", "minutos", "data-registro"]
Object.values(sessao);        // ["Closures", 50, "2026-11-03"]
Object.entries(sessao);       // [["topico", "Closures"], ["minutos", 50], ...]
Object.fromEntries([["a", 1], ["b", 2]]);   // { a: 1, b: 2 }: o caminho de volta
```

`entries` + `map`/`filter` + `fromEntries` é o jeito idiomático de "transformar um objeto".

## Desestruturação

```js
const { topico, minutos } = sessao;                  // cria as variáveis topico e minutos
const { minutos: tempo } = sessao;                   // renomeia: a variável se chama tempo
const { notas = "sem notas" } = sessao;              // valor padrão (só para undefined, não para null)
const { senha, ...publico } = { id: 1, nome: "Ana", senha: "x" };  // publico = { id: 1, nome: "Ana" }

function registrar({ topico, minutos = 25 }) {       // direto nos parâmetros
  return `${minutos} min em ${topico}`;
}
```

Esta API usa desestruturação o tempo todo, por exemplo `const { nivel, status, area } = req.query;` em `src/routes/skills.js`.

## Spread e cópia rasa

```js
const atualizado = { ...sessao, minutos: 60 };   // objeto NOVO; o que vem depois sobrescreve
sessao.minutos;                                 // 50: o original não mudou
```

O spread faz uma **cópia rasa**: copia o primeiro nível. Objetos **de dentro** continuam sendo os mesmos:

```js
const perfil = { nome: "Vini", tema: { cor: "escuro" } };
const copia = { ...perfil };
copia.tema.cor = "claro";
perfil.tema.cor;              // "claro"  ← o objeto de dentro é compartilhado!
```

Para uma **cópia profunda**, em que nada é compartilhado, use `structuredClone(perfil)`. Ele copia objetos, arrays, datas, `Map` e `Set`, mas **não** funções. `Object.assign`, `Array.from`, `slice` e `concat` também fazem só cópia rasa.

## Comparação é por referência

```js
{ a: 1 } === { a: 1 };   // false: são dois objetos diferentes
const x = { a: 1 };
const y = x;
y.a = 2;
x.a;                     // 2: x e y são o MESMO objeto
```

## Na prática

```js
const config = { porta: 3000, banco: { arquivo: "estudos.db", modo: "rw" } };
// 1. crie novaConfig com porta 4000, sem alterar config
// 2. mude novaConfig.banco.modo para "ro" e veja o que acontece com config.banco.modo
// 3. refaça o passo 2 usando structuredClone e compare
```

## Armadilhas comuns

- **Achar que `{ ...obj }` copia tudo.** É raso: objetos internos são compartilhados.
- **Comparar objetos com `===`** esperando comparar o conteúdo.
- **Colchetes com nome vindo do usuário** (`obj[req.query.campo]`): o usuário pode acessar propriedades que você não esperava, como `__proto__`. Valide antes.
- **Padrão de desestruturação com `null`**: `const { a } = null` dá `TypeError`.

## Leia na documentação oficial

1. [MDN · Working with objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects): leia [Objects and properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#objects_and_properties) e [Comparing objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#comparing_objects).
2. [MDN · Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring): todos os formatos, inclusive em parâmetros de função.
3. [MDN · Shallow copy](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy) e [Deep copy](https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy): a diferença, com exemplos.
4. [MDN · structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone): cópia profunda nativa do navegador. No Node ela também é global: [Node · structuredClone](https://nodejs.org/api/globals.html#structuredclonevalue-options).

## Pratique

Exercício com correção automática: **js/03 · Mesclar e recortar objetos sem mutar**.

```bash
npm run exercicio js/03
```

## Confira se entendeu

<details><summary>O que tem em <code>publico</code> depois de <code>const { senha, ...publico } = usuario</code>?</summary>

Um objeto novo com todas as propriedades de `usuario`, menos `senha`.
</details>

<details><summary>Depois de <code>const b = { ...a }</code>, mudar <code>b.endereco.cidade</code> muda <code>a</code>?</summary>

Sim, se `endereco` for um objeto: o spread copia só o primeiro nível, e `b.endereco` é o mesmo objeto que `a.endereco`.
</details>

<details><summary>Por que <code>{ a: 1 } === { a: 1 }</code> é <code>false</code>?</summary>

Porque objetos são comparados por referência: são dois objetos diferentes na memória, mesmo com o mesmo conteúdo.
</details>

<details><summary>Como transformar <code>{ a: 1, b: 2 }</code> em <code>{ a: 10, b: 20 }</code> sem laço?</summary>

`Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v * 10]))`.
</details>
