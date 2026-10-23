# API REST de tarefas

**Módulo 4 · Node e APIs REST · tópico: Design REST**

Junta tudo do módulo: Express, rotas, status codes e validação. As tarefas ficam **em memória** (um array ou `Map` dentro de `criarApp`), sem banco.

## O que fazer

Em `solucao.js`, **`criarApp()`** devolve um app Express **novo a cada chamada** (cada teste começa com a lista vazia).

Uma tarefa tem o formato `{ id, titulo, feita }`. Os ids começam em 1 e nunca são reaproveitados.

| Método e rota | Sucesso | Erros |
|---|---|---|
| `GET /tarefas` | `200` com a lista em ordem de id | |
| `GET /tarefas?feita=true` | `200` só as feitas (`false`: só as pendentes) | `400` se `feita` não for `true` nem `false` |
| `POST /tarefas` `{ "titulo": "..." }` | `201` com a tarefa criada (`feita: false`) e header `Location: /tarefas/{id}` | `400` se `titulo` não for texto com conteúdo |
| `GET /tarefas/:id` | `200` com a tarefa | `400` se o id não for inteiro positivo; `404` se não existir |
| `PATCH /tarefas/:id` `{ "titulo"?, "feita"? }` | `200` com a tarefa atualizada | `400` se `feita` não for booleano ou `titulo` for inválido; `404` |
| `DELETE /tarefas/:id` | `204` sem corpo | `404` se não existir |

Todo erro responde JSON no formato `{ "erro": "mensagem" }`.

## Dicas
- `express.Router()` não é obrigatório aqui, mas organiza.
- `PATCH` atualiza **só** o que veio no corpo.
- Por que `201` + `Location` no POST e `204` no DELETE? Consulte os status codes da MDN (recursos do módulo 4).
- Você pode reaproveitar sua `validarTarefa` do exercício anterior, se quiser.

## Rodar

```bash
npm run exercicio node/05
```

## Pronto quando
Os testes passam e você justifica cada status code da tabela sem consultar.
