> **Tempo estimado:** 45 min · **Fontes:** Microsoft (*Práticas recomendadas de design de API Web*) · MDN (*HTTP response status codes*)

## Em poucas palavras

REST é um **estilo** de organizar uma API HTTP em torno de **recursos** (coisas: tarefas, sessões, módulos) em vez de **ações**. A URL diz **qual recurso**, e o método HTTP diz **o que fazer** com ele. O resultado é uma API previsível: quem aprendeu `/skills` adivinha como funciona `/courses`.

## URLs: substantivos no plural

```text
Ruim (verbos na URL)            Bom (recursos + método)
GET  /listarTarefas             GET    /tarefas
POST /criarTarefa               POST   /tarefas
GET  /tarefa?id=7               GET    /tarefas/7
POST /atualizarTarefa/7         PATCH  /tarefas/7
POST /apagarTarefa/7            DELETE /tarefas/7
```

- **Coleção** no plural (`/tarefas`) e **item** pelo id (`/tarefas/7`).
- **Relações com moderação**: `/modulos/4/topicos` é claro. Mais fundo que *coleção/item/coleção* (`/clientes/1/pedidos/99/produtos`) fica difícil de manter. Prefira `/pedidos/99/produtos`.
- **A URL não deve copiar as tabelas do banco**: a API é uma camada de abstração. Este projeto expõe `/proximo`, que não é tabela nenhuma, mas é o que o cliente precisa.

## O que cada operação responde

| Operação | Sucesso | Erros comuns |
|---|---|---|
| `GET /tarefas` | `200` + lista (vazia é `[]`, e não `404`) | `400` em filtro inválido |
| `GET /tarefas/7` | `200` + item | `404` se não existe |
| `POST /tarefas` | **`201`** + item criado + header **`Location: /tarefas/8`** | `400` em corpo inválido |
| `PATCH /tarefas/7` | `200` + item atualizado | `400`, `404` |
| `DELETE /tarefas/7` | **`204`** sem corpo | `404` |

O `Location` no `201` diz ao cliente **onde** o recurso novo mora, sem ele precisar adivinhar o id.

## Filtros, paginação e versão

- **Filtros na query string**: `GET /skills?nivel=Júnior&status=Em andamento` (como faz esta API).
- **Paginação** para listas grandes: `?limit=25&offset=50`, sempre com valores padrão razoáveis.
- **Versão da API** na URL: `/api/v1/...`. Quando uma mudança quebrar os clientes, ela vira `/api/v2/...`, e a v1 continua funcionando por um tempo. É o padrão usado aqui.

## Erros consistentes

Escolha **um** formato de erro e use em todas as rotas. Nesta API é `{ "erro": "mensagem", "detalhes": ... }` (veja `src/errors.js`). O cliente escreve **um** tratamento de erro e serve para tudo.

## Na prática

1. Liste as rotas da tabela de endpoints do README deste projeto e classifique cada uma: coleção, item ou "ação" (como `/proximo`).
2. Desenhe, só no papel, a API de uma biblioteca: livros, leitores e empréstimos. Quais URLs? Quais métodos? O que cada uma devolve? Como "devolver um livro" vira recurso? (Dica: o empréstimo ganha um `PATCH` com a data de devolução.)
3. Compare com o guia da Microsoft na seção "Definir URIs de recurso".

## Armadilhas comuns

- **Verbos na URL** (`/criarTarefa`).
- **`404` para lista vazia**: a coleção existe, só está vazia. É `200` com `[]`.
- **`200` no `POST`** sem o recurso criado nem o `Location`.
- **Cada rota com um formato de erro diferente.**
- **Expor a estrutura interna do banco** em vez de pensar no que o cliente precisa.

## Leia na documentação oficial

1. [Microsoft · Práticas recomendadas de design de API Web](https://learn.microsoft.com/pt-br/azure/architecture/best-practices/api-design) (em português): leia "Definir URIs de recurso da API Web RESTful", "Definir métodos de API Web RESTful", "Implementar paginação e filtragem de dados" e "Implementar controle de versão".
2. [MDN · 201 Created](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/201) e [204 No Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204): quando cada um é usado.
3. [MDN · Location](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Location): o header que acompanha o `201`.

## Pratique

Exercício com correção automática: **node/05 · API REST de tarefas**: as cinco operações da tabela acima, com os status certos.

```bash
npm run exercicio node/05
```

## Confira se entendeu

<details><summary>Por que <code>POST /tarefas</code> é melhor que <code>POST /criarTarefa</code>?</summary>

Porque o método já diz a ação (criar). A URL só identifica o recurso, e as outras operações da mesma coleção seguem o mesmo padrão.
</details>

<details><summary>O que um <code>POST</code> bem-sucedido deve devolver?</summary>

`201 Created`, o recurso criado no corpo e o header `Location` com a URL dele.
</details>

<details><summary><code>GET /tarefas?feita=true</code> não encontrou nada. Qual a resposta?</summary>

`200` com uma lista vazia (`[]`). `404` seria para um recurso que não existe.
</details>

<details><summary>Para que serve o <code>/v1</code> em <code>/api/v1</code>?</summary>

Para poder lançar uma versão incompatível (`/api/v2`) sem quebrar quem ainda usa a primeira.
</details>
