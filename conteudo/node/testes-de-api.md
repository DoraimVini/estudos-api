> **Tempo estimado:** 50 min · **Fontes:** Vitest (*Getting Started*, API `expect`, *Mocking*) · Supertest (README oficial)

## Em poucas palavras

Um **teste de API** faz uma requisição HTTP de verdade à sua aplicação e confere a resposta: o status, o corpo e os headers. É o teste que mais dá confiança por linha escrita, porque passa pela rota, pela validação, pelo banco e pelo tratamento de erros, como um cliente real faria.

Este projeto usa duas ferramentas:

- **Vitest**: roda os testes e oferece o `expect`.
- **Supertest**: faz requisições a um app Express **sem precisar subir o servidor numa porta**.

## A estrutura de um teste

```js
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { openDatabase } from "../src/db/database.js";

let app;
beforeEach(() => {
  app = createApp(openDatabase(":memory:"));   // banco NOVO, em memória, a cada teste
});

describe("GET /api/v1/skills/:id", () => {
  it("devolve a habilidade", async () => {
    const res = await request(app).get("/api/v1/skills/3");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 3, nivel: "Júnior" });
  });

  it("404 para id que não existe", async () => {
    const res = await request(app).get("/api/v1/skills/999");
    expect(res.status).toBe(404);
    expect(res.body.erro).toMatch(/não encontrad/);
  });
});
```

## As três decisões que tornam os testes confiáveis

1. **Isolamento**: cada teste começa do zero (`beforeEach` com banco `:memory:`). Um teste nunca depende do que outro fez, e a ordem não importa.
2. **Separar o app da porta**: `src/app.js` **monta** o app (`createApp`), e `src/server.js` **abre a porta**. O Supertest usa o primeiro e, se precisar, abre uma porta temporária sozinho.
3. **Tempo controlado**: código que depende de "hoje" é imprevisível. Esta API recebe `agora` como opção (`createApp(db, { agora: () => new Date("2027-02-15T12:00:00Z") })`), e os testes congelam a data. O Vitest também tem `vi.setSystemTime` para isso.

## Escolhendo o `expect` certo

| Matcher | Compara |
|---|---|
| `toBe(x)` | **Identidade** (`Object.is`): números, strings, booleanos ou "o mesmo objeto" |
| `toEqual(obj)` | **Conteúdo**, recursivamente: objetos e arrays diferentes com os mesmos valores |
| `toMatchObject(obj)` | **Subconjunto**: as propriedades listadas batem, e as outras podem existir |
| `toThrow(/msg/)` | Uma função lança erro (passe a função, e não a chamada) |
| `await expect(promessa).rejects.toThrow()` | Uma Promise rejeita |

`expect({ a: 1 }).toBe({ a: 1 })` **falha**: são objetos diferentes. Para objetos, use `toEqual` ou `toMatchObject`.

## O que testar numa rota

Para cada rota: **o caminho feliz** (status certo e corpo certo), **cada validação** (`400` com mensagem), **o recurso inexistente** (`404`) e **os efeitos** (depois do `POST`, o `GET` mostra o item?). Os arquivos em `test/` deste projeto seguem esse roteiro. Abra o `test/trilha.test.js` e encontre um exemplo de cada.

## Na prática

1. Rode `npm.cmd test` e depois `npm.cmd run test:watch` (modo *watch*, que roda de novo a cada arquivo salvo; Ctrl+C para sair).
2. Quebre algo de propósito em `src/validators.js` (por exemplo, aceite `hoje: 9`) e veja qual teste falha e o que a mensagem diz. Desfaça.
3. Escreva um teste novo: `DELETE /api/v1/sessions/:id` de uma sessão que não existe deve dar `404`.

## Armadilhas comuns

- **Testes que dependem uns dos outros** (o segundo usa o que o primeiro criou): falham ao rodar sozinhos.
- **Testar contra o banco real** (`estudos.db`): os testes apagam ou poluem os seus dados. Use `:memory:`.
- **Esquecer o `await`** no `request(app)...`: o teste termina antes da resposta e passa sem testar nada.
- **`toBe` em objetos.**
- **Testar só o caminho feliz**: os bugs moram nos erros.

## Leia na documentação oficial

1. [Vitest · Getting Started](https://vitest.dev/guide/): leia [Writing Tests](https://vitest.dev/guide/#writing-tests) e [Configuring Vitest](https://vitest.dev/guide/#configuring-vitest).
2. [Vitest · expect](https://vitest.dev/api/expect): [toBe](https://vitest.dev/api/expect#tobe), [toEqual](https://vitest.dev/api/expect#toequal), [toMatchObject](https://vitest.dev/api/expect#tomatchobject) e [rejects](https://vitest.dev/api/expect#rejects).
3. [Supertest (README)](https://github.com/forwardemail/supertest): como fazer requisições a um app sem abrir porta, com exemplos de `async`/`await`.
4. [Vitest · Mocking](https://vitest.dev/guide/mocking): a seção [Mock the current date](https://vitest.dev/guide/mocking#mock-the-current-date) mostra `vi.setSystemTime`.

## Confira se entendeu

<details><summary>Por que cada teste cria um banco <code>:memory:</code> novo?</summary>

Para que os testes sejam isolados: nenhum depende do que outro gravou, e a ordem de execução não importa. De quebra, o seu `estudos.db` não é tocado.
</details>

<details><summary>Por que o projeto separa <code>app.js</code> de <code>server.js</code>?</summary>

Para que os testes usem o app sem abrir uma porta fixa. O Supertest cuida disso sozinho.
</details>

<details><summary>Qual a diferença entre <code>toEqual</code> e <code>toMatchObject</code>?</summary>

`toEqual` exige o mesmo conteúdo, sem propriedades a mais. `toMatchObject` só confere as propriedades listadas, e o objeto pode ter outras.
</details>

<details><summary>Como testar código que depende da data de hoje?</summary>

Congelando o tempo: passando a data como parâmetro (como o `agora` deste projeto) ou com `vi.setSystemTime` do Vitest.
</details>
