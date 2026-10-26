> **Tempo estimado:** 40 min · **Fontes:** MDN (guia *Control flow and error handling*, referência de `Error`)

## Em poucas palavras

Erros vão acontecer: rede fora, arquivo inexistente, dado inválido. O objetivo não é evitar que aconteçam, e sim que **ninguém os engula em silêncio**. Um erro bem tratado diz **o que** deu errado, **onde** e, quando possível, **o que fazer**.

## throw, try, catch e finally

```js
function lerIdade(texto) {
  const idade = Number(texto);
  if (!Number.isInteger(idade) || idade < 0) {
    throw new RangeError(`Idade inválida: "${texto}"`);   // lança e interrompe a função
  }
  return idade;
}

try {
  lerIdade("abc");
} catch (erro) {
  console.error(erro.name);      // "RangeError"
  console.error(erro.message);   // 'Idade inválida: "abc"'
} finally {
  console.log("sempre roda, com ou sem erro");   // bom para fechar arquivos e conexões
}
```

O `throw` aceita qualquer valor, mas **sempre lance um `Error`** (ou subclasse): ele traz `name`, `message` e o *stack trace*, que mostra a linha exata do problema. `throw "deu ruim"` perde tudo isso.

## Tipos de erro

O JavaScript já tem tipos para os casos comuns: `TypeError` (valor do tipo errado, como chamar algo que não é função), `RangeError` (valor fora do intervalo), `SyntaxError`, `ReferenceError`... Para os erros **do seu domínio**, crie a sua classe:

```js
class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);   // repassar options instala a propriedade cause
    this.name = "HttpError";
    this.status = status;
  }
}
```

É a mesma ideia de `src/errors.js` deste projeto (lá, o terceiro parâmetro é `details`, com os detalhes do erro). Com isso, o middleware de erro sabe que um `HttpError(404, ...)` deve virar uma resposta 404, e que qualquer outro erro vira 500.

## Relançar sem perder a causa

Às vezes você captura um erro de baixo nível para lançar um mais claro. Use `cause` para não perder o original:

```js
try {
  conteudo = await readFile(caminho, "utf8");
} catch (erro) {
  throw new Error(`Não consegui ler a configuração em ${caminho}`, { cause: erro });
}
```

## Erros assíncronos

- Com `async`/`await`, `try/catch` funciona normalmente: uma Promise rejeitada vira erro no `await`.
- Com `.then`, use `.catch(...)` no fim da cadeia.
- `try/catch` **não** pega erros de um callback que roda depois (num `setTimeout`, por exemplo): quando o callback roda, o `try` já terminou.

## Na prática

```js
function dividir(a, b) {
  if (b === 0) throw new RangeError("Divisão por zero");
  return a / b;
}

for (const [a, b] of [[10, 2], [5, 0], [9, 3]]) {
  try {
    console.log(dividir(a, b));
  } catch (erro) {
    console.log(`pulei ${a}/${b}: ${erro.message}`);
  }
}
```

Depois provoque um erro de propósito numa rota da API (por exemplo, `GET /api/v1/skills/abc`) e siga o caminho: `parseId` lança `badRequest`, e o `errorHandler` transforma o erro em JSON com status 400.

## Armadilhas comuns

- **`catch` vazio** (`catch (e) {}`): o erro some, e você só descobre muito depois, longe da causa.
- **Lançar strings** em vez de `Error`: sem stack trace.
- **Mostrar a mensagem interna ao usuário**: erros de banco ou de sistema podem expor detalhes. Esta API devolve "Erro interno." para qualquer erro inesperado (status 500) e registra o detalhe no console.
- **`return` dentro do `finally`**: ele sobrescreve o `return`, e até um erro, do `try`/`catch`.

## Leia na documentação oficial

1. [MDN · Control flow and error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling#exception_handling_statements): leia "Exception handling statements" até "Utilizing Error objects".
2. [MDN · Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error): os [tipos nativos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#error_types), [tipos customizados](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types) e [como diferenciar erros parecidos com `cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#differentiate_between_similar_errors).
3. [MDN · try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch): a referência, incluindo o comportamento do `finally`.

## Confira se entendeu

<details><summary>Por que lançar <code>new Error("...")</code> em vez de <code>"..."</code>?</summary>

Porque o objeto `Error` traz `name`, `message` e o stack trace com a linha do problema. Uma string não traz nada disso.
</details>

<details><summary>Para que serve a opção <code>{ cause }</code>?</summary>

Para lançar um erro mais claro sem perder o erro original, que fica disponível em `erro.cause`.
</details>

<details><summary>O <code>finally</code> roda quando o <code>try</code> dá certo?</summary>

Sim. Ele roda sempre: com sucesso, com erro capturado e até com erro não capturado.
</details>

<details><summary>Um <code>try/catch</code> em volta de um <code>setTimeout(() =&gt; { throw ... })</code> pega o erro?</summary>

Não. Quando o callback roda, o `try` já terminou há muito tempo. O tratamento precisa estar dentro do callback.
</details>
