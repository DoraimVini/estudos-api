# Servidor HTTP sem Express

**Módulo 4 · Node e APIs REST · tópico: HTTP**

O Express é uma camada em cima do módulo `node:http`. Fazer um servidor "na mão" uma vez mostra o que ele resolve para você: rotear, ler o corpo, montar respostas JSON.

## O que fazer

Em `solucao.js`, **`criarServidor()`** devolve um `http.Server` (de `http.createServer`) que responde **sempre JSON** (`Content-Type: application/json`):

| Requisição | Resposta |
|---|---|
| `GET /ping` | `200` `{ "ok": true }` |
| `POST /eco` com JSON no corpo | `200` com o mesmo JSON de volta |
| `POST /eco` com corpo que não é JSON | `400` `{ "erro": "JSON inválido" }` |
| Outro método em `/ping` (ex.: `POST`) | `405` `{ "erro": "Método não permitido" }` e header `Allow: GET` |
| Qualquer outra rota | `404` `{ "erro": "Rota não encontrada" }` |

Não chame `listen`: os testes cuidam disso.

## Dicas
- `req.method` e `req.url` dizem o que foi pedido.
- O corpo chega em pedaços (stream). Junte com `for await (const pedaco of req)` e depois `Buffer.concat(pedacos).toString()`.
- `res.writeHead(status, headers)` e `res.end(JSON.stringify(corpo))`. Uma função auxiliar `responder(res, status, corpo, headers)` evita repetição.

## Rodar

```bash
npm run exercicio node/02
```

## Pronto quando
Os testes passam e você sabe dizer três coisas que o Express faz por você.
