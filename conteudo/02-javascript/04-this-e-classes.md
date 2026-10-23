> **Tempo estimado:** 50 min · **Fontes:** MDN (referência de `this`, guia *Using classes*) · javascript.info (*Object methods, "this"*)

## Em poucas palavras

Numa função comum, `this` **não** é definido onde a função foi escrita, e sim **na hora da chamada**: é o objeto que vem **antes do ponto**. Arrow functions são a exceção: não têm `this` próprio e usam o `this` de onde foram criadas.

Classes (`class`) são a forma moderna de criar objetos com dados e comportamento juntos. Por baixo, continuam usando protótipos, mas a sintaxe é muito mais clara.

## As regras do `this`

```js
const perfil = {
  nome: "Vini",
  apresentar() {
    return `Sou ${this.nome}`;
  },
};

perfil.apresentar();          // "Sou Vini"  → this é perfil (o objeto antes do ponto)

const solta = perfil.apresentar;
solta();                      // TypeError em módulo/strict: this é undefined (não há ponto)

const amarrada = perfil.apresentar.bind(perfil);
amarrada();                   // "Sou Vini"  → bind fixa o this
```

| Como a função é chamada | `this` vale |
|---|---|
| `obj.metodo()` | `obj` |
| `funcao()` solta (módulos e classes são sempre *strict*) | `undefined` |
| `funcao.call(obj)`, `.apply(obj)`, `.bind(obj)` | `obj` |
| `new Classe()` | o objeto novo |
| Arrow function | o `this` de onde a arrow foi **criada** |

O caso clássico de bug é passar um método como callback: `setTimeout(perfil.apresentar, 100)` chama a função **sem** o ponto, e o `this` se perde. Soluções: `setTimeout(() => perfil.apresentar(), 100)` ou `.bind(perfil)`.

## Classes

```js
class Cronometro {
  #inicio = null;                     // campo privado: só existe dentro da classe
  static criados = 0;                 // estático: pertence à classe, não às instâncias

  constructor(nome) {                 // roda no new; this é a instância nova
    this.nome = nome;
    Cronometro.criados++;
  }

  iniciar() {                         // método: fica no protótipo, compartilhado
    this.#inicio = Date.now();
  }

  get decorridoMs() {                 // getter: lido como propriedade, sem ()
    return this.#inicio === null ? 0 : Date.now() - this.#inicio;
  }
}

const c = new Cronometro("estudo");
c.iniciar();
c.decorridoMs;      // ex.: 3
```

Tentar ler `c.#inicio` fora da classe é **erro de sintaxe**: o arquivo inteiro nem chega a rodar. A privacidade é garantida pela própria linguagem.

**Herança** com `extends`. No construtor da classe filha, é obrigatório chamar `super(...)` **antes** de usar `this`:

```js
class Pomodoro extends Cronometro {
  constructor(minutos) {
    super("pomodoro");
    this.minutos = minutos;
  }
}
```

## Classe ou funções?

A própria MDN é pragmática: classes ajudam quando há **estado interno com vários comportamentos** (como o cronômetro) e quando você quer encapsular com campos `#privados`. Para transformar dados (filtrar uma lista, calcular um total), **funções simples** costumam ser mais claras. Este projeto usa quase só funções, com fábricas como `skillsRepository(db)`, e classes onde o próprio JavaScript usa (`class HttpError extends Error`).

## Na prática

```js
const botao = {
  rotulo: "Salvar",
  clicar() { console.log(`clicou em ${this.rotulo}`); },
};
setTimeout(botao.clicar, 0);                // "clicou em undefined": o this se perdeu
setTimeout(() => botao.clicar(), 0);        // "clicou em Salvar"
setTimeout(botao.clicar.bind(botao), 0);    // "clicou em Salvar"
```

Leia `src/errors.js` deste projeto: `HttpError` é uma classe que estende `Error`.

## Armadilhas comuns

- **Passar `obj.metodo` como callback** sem arrow ou `bind`.
- **Arrow function como método** de objeto literal: `{ nome: "x", f: () => this.nome }`. O `this` não é o objeto.
- **Esquecer o `new`**: chamar uma classe sem `new` dá `TypeError`.
- **Usar `this` antes do `super()`** num construtor de classe filha: `ReferenceError`.

## Leia na documentação oficial

1. [MDN · this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this): a seção [Description](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#description) explica cada caso, incluindo [Callbacks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#callbacks) e [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#arrow_functions).
2. [MDN · Using classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes): construtor, [campos privados](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes#private_fields), estáticos, herança e a seção [Why classes?](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes#why_classes).
3. [javascript.info · Object methods, "this"](https://javascript.info/object-methods): explicação passo a passo, com exercícios no fim.

## Confira se entendeu

<details><summary>Em <code>perfil.apresentar()</code>, quem é o <code>this</code>? E em <code>const f = perfil.apresentar; f()</code>?</summary>

No primeiro, `perfil` (o objeto antes do ponto). No segundo, `undefined`, porque a função foi chamada sem objeto (em módulos e classes o código é sempre strict).
</details>

<details><summary>Por que arrow functions resolvem o problema do <code>this</code> em callbacks?</summary>

Porque elas não têm `this` próprio: usam o `this` do lugar onde foram criadas, e isso não muda com a forma de chamar.
</details>

<details><summary>Qual a diferença entre <code>#inicio</code> e <code>this.inicio</code> numa classe?</summary>

`#inicio` é privado: só o código dentro da classe acessa. `this.inicio` é uma propriedade pública, que qualquer um pode ler e alterar.
</details>

<details><summary>O que precisa vir antes de usar <code>this</code> no construtor de uma classe que usa <code>extends</code>?</summary>

A chamada `super(...)`, que roda o construtor da classe mãe.
</details>
