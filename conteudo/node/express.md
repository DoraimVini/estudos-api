> **Tempo estimado:** 50 min · **Fontes:** documentação do Express 5 (*Routing*, *Using middleware*, *Error handling*)

## Em poucas palavras

O Express é uma camada fina sobre o `node:http` que resolve o trabalho repetitivo: **rotear** (qual função atende `GET /skills/3`?), **ler o corpo** em JSON, **montar respostas** e **tratar erros**. Tudo isso é organizado em **middlewares**: funções que a requisição atravessa em sequência, na ordem em que foram registradas.

## Rotas

```js
import express from "express";
const app = express();

app.get("/tarefas", (req, res) => res.json([]));
app.post("/tarefas", (req, res) => res.status(201).json(req.body));
app.get("/tarefas/:id", (req, res) => {
  res.json({ id: Number(req.params.id) });   // :id chega em req.params, sempre como string
});
// GET /tarefas?feita=true  → req.query.feita === "true" (string também!)
```

Para organizar, cada grupo de rotas vira um `Router`, montado num prefixo:

```js
const router = express.Router();
router.get("/", listar);          // vira GET /api/v1/skills
router.get("/:id", buscar);       // vira GET /api/v1/skills/:id
app.use("/api/v1/skills", router);
```

É exatamente a estrutura de `src/routes/*.js` deste projeto, montada em `src/app.js`.

## Middleware

Um middleware recebe `(req, res, next)` e faz uma de duas coisas: **responde** (e encerra) ou **chama `next()`** para passar adiante. Se não fizer nenhuma das duas, a requisição fica pendurada para sempre.

```js
app.use(express.json());                 // nativo: lê corpos JSON e coloca em req.body
app.use(express.static("public"));       // nativo: serve arquivos (é assim que o painel é servido)

app.use((req, res, next) => {            // seu: roda em toda requisição
  req.recebidaEm = Date.now();
  next();
});
```

**A ordem importa.** Uma rota registrada antes de `express.json()` não tem `req.body`. Um "404 genérico" registrado antes das rotas responde 404 para tudo.

No Express 5, se o corpo não for JSON (ou não vier), `req.body` fica `undefined`. Por isso as rotas deste projeto fazem `const body = req.body ?? {};`.

## Erros

O middleware de erro tem **quatro** parâmetros, `(err, req, res, next)`, e vem **por último**:

```js
app.get("/quebra", async () => {
  throw new Error("algo deu errado");    // Express 5: erros e Promises rejeitadas em async chegam sozinhos aqui embaixo
});

app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));   // 404: depois de todas as rotas
app.use((err, req, res, next) => {                                              // erro: o último de todos
  console.error(err);
  res.status(500).json({ erro: "Erro interno." });
});
```

Grande mudança do Express 5: **funções `async` que lançam erro são capturadas automaticamente**. No Express 4, era preciso envolver cada uma num `try/catch` com `next(err)`, e muitos tutoriais antigos ainda mostram isso.

Leia `src/errors.js` e o fim de `src/app.js` deste projeto: o 404 e o `errorHandler` estão exatamente nessa ordem.

## Na prática

1. Abra `src/app.js` e escreva, numa folha, a ordem dos middlewares e rotas. Por que o `express.static` vem antes do `express.json`?
2. Com a API rodando, acesse `http://localhost:3000/api/v1/skills/abc`: quem lança o erro (`parseId`) e quem transforma em `400`?
3. Crie `mini.mjs` com um app Express de duas rotas e um middleware que imprime `MÉTODO URL` em toda requisição. Rode e teste com o navegador e com `curl.exe`.

## Armadilhas comuns

- **Middleware que não chama `next()` nem responde**: a requisição trava.
- **404 ou middleware de erro registrados antes das rotas.**
- **Middleware de erro com três parâmetros**: o Express não o reconhece como tratador de erro. Precisa dos quatro.
- **Tratar `req.params` e `req.query` como números**: são strings.
- **Responder duas vezes** (`res.json` e depois `res.send`): `Cannot set headers after they are sent`. Use `return res.json(...)`.

## Leia na documentação oficial

1. [Express · Routing](https://expressjs.com/en/guide/routing.html): métodos, parâmetros de rota (com as regras novas de caminhos do Express 5) e `express.Router`.
2. [Express · Using middleware](https://expressjs.com/en/guide/using-middleware.html): os tipos de middleware, incluindo os nativos (`express.json`, `express.static`).
3. [Express · Error handling](https://expressjs.com/en/guide/error-handling.html): erros síncronos e assíncronos, e como escrever o middleware de erro.
4. [Express · Migrating to Express 5](https://expressjs.com/en/guide/migrating-5.html): o que mudou do 4 para o 5. Útil quando um tutorial antigo não funcionar.

## Pratique

Exercício com correção automática: **node/03 · Middlewares do Express** (log de requisições, exigir JSON, 404 e tratamento de erros).

```bash
npm run exercicio node/03
```

## Confira se entendeu

<details><summary>O que um middleware precisa fazer para a requisição não travar?</summary>

Responder (`res.json`, `res.send`...) ou chamar `next()` para passar adiante.
</details>

<details><summary>Por que o middleware de 404 vem depois das rotas?</summary>

Porque os middlewares rodam na ordem de registro. Se ele viesse antes, responderia 404 para todas as requisições.
</details>

<details><summary>Como o Express sabe que uma função é um middleware de erro?</summary>

Pela quantidade de parâmetros: quatro, `(err, req, res, next)`.
</details>

<details><summary>Num handler <code>async</code> do Express 5, um <code>throw</code> chega ao middleware de erro?</summary>

Sim. O Express 5 captura erros lançados e Promises rejeitadas automaticamente. No Express 4, era preciso chamar `next(err)`.
</details>
