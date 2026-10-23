# Middlewares do Express

**Módulo 4 · Node e APIs REST · tópico: Express**

Middleware é uma função `(req, res, next)` que roda no caminho da requisição: pode responder, alterar `req`/`res` ou passar adiante com `next()`. Middleware de **erro** tem quatro parâmetros: `(err, req, res, next)`. Esta API usa os dois tipos (veja `src/errors.js`).

## O que fazer

Em `solucao.js`, escreva quatro middlewares. O teste monta um app nesta ordem:

```js
app.use(registrarRequisicoes(log));
app.use(exigirJson);
app.use(express.json());
// ...rotas...
app.use(naoEncontrado);
app.use(tratarErros);
```

1. **`registrarRequisicoes(log)`**: *fábrica* que devolve um middleware. Quando a resposta terminar, adiciona ao array `log` o texto `"MÉTODO URL STATUS"`, ex.: `"GET /ok 200"`.
2. **`exigirJson`**: em `POST`, `PUT` e `PATCH`, se o corpo não for JSON, responde `415` com `{ "erro": "Use Content-Type: application/json" }`. Nos outros métodos, só segue.
3. **`naoEncontrado`**: responde `404` com `{ "erro": "Rota não encontrada" }`.
4. **`tratarErros`**: usa `err.status` (ou `500` se não houver). Para status abaixo de 500, responde `{ "erro": err.message }`. Para 500, responde `{ "erro": "Erro interno" }`, **sem** vazar a mensagem real.

## Dicas
- O status final só é conhecido no fim: `res.on("finish", () => …)`.
- `req.is("application/json")` diz se o corpo é JSON.
- Por que esconder a mensagem no 500? Erros internos podem conter SQL, caminhos de arquivo e outros detalhes que ajudam um atacante.

## Rodar

```bash
npm run exercicio node/03
```

## Pronto quando
Os testes passam e você explica por que `naoEncontrado` precisa vir **depois** das rotas e `tratarErros` por último.
