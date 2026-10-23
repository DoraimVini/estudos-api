> **Tempo estimado:** 50 min · **Fontes:** MDN (*Overview of HTTP*, *HTTP request methods*, *HTTP response status codes*)

## Em poucas palavras

HTTP é a conversa entre **cliente** (navegador, app, `curl`) e **servidor**. O cliente manda uma **requisição**, e o servidor devolve **uma resposta**. Cada requisição é **independente**: o HTTP não lembra da anterior (*stateless*). Quando é preciso "lembrar", como num login, isso é feito por cima, com cookies ou tokens.

## Anatomia de uma requisição e de uma resposta

```http
POST /api/v1/sessions HTTP/1.1          ← método, caminho, versão
Host: localhost:3000                    ← headers (cabeçalhos)
Content-Type: application/json
                                        ← linha em branco
{"topico_id": 12, "minutos": 25}        ← corpo (opcional)
```

```http
HTTP/1.1 201 Created                    ← versão, status, mensagem
Content-Type: application/json; charset=utf-8
                                        ← linha em branco
{"id": 7, "topico_id": 12, "minutos": 25, ...}
```

**Headers** que você vai ver sempre: `Content-Type` (o formato do corpo), `Accept` (o formato que o cliente quer de volta), `Authorization` (credenciais) e `Location` (onde está o recurso criado ou para onde redirecionar).

## Métodos

| Método | Para quê | Seguro? | Idempotente? |
|---|---|---|---|
| `GET` | Ler | Sim | Sim |
| `POST` | Criar ou disparar uma ação | Não | **Não** |
| `PUT` | Substituir o recurso inteiro | Não | Sim |
| `PATCH` | Alterar parte do recurso | Não | Não* |
| `DELETE` | Apagar | Não | Sim |

- **Seguro**: não altera nada no servidor (só lê).
- **Idempotente**: repetir a mesma requisição dá o mesmo efeito que fazê-la uma vez. Apagar o item 7 duas vezes deixa o item 7 apagado; criar com `POST` duas vezes cria **dois** registros. É por isso que navegadores avisam antes de reenviar um formulário.

\* Pela especificação, `PATCH` não é garantidamente idempotente. Na prática, um `PATCH {"status": "Concluído"}` costuma ser.

## Status codes

| Faixa | Significa | Os que você mais vai usar |
|---|---|---|
| **2xx** | Deu certo | `200 OK`, `201 Created` (+ `Location`), `204 No Content` (sem corpo) |
| **3xx** | Vá para outro lugar | `301`/`302` (redirecionamento), `304 Not Modified` (use o cache) |
| **4xx** | **O cliente** errou | `400` (requisição inválida), `401` (não autenticado), `403` (sem permissão), `404` (não existe), `405` (método não permitido), `409` (conflito), `415` (formato do corpo não suportado), `422`, `429` (requisições demais) |
| **5xx** | **O servidor** errou | `500` (erro inesperado), `503` (indisponível) |

A regra que ajuda a escolher: **4xx = o cliente pode corrigir e tentar de novo; 5xx = o problema é seu**. Atenção ao `401` x `403`: `401` é "não sei quem você é", e `403` é "sei quem você é, mas você não pode".

## Na prática

Com a API rodando, use o `curl` de verdade. No PowerShell, `curl` é um apelido de outro comando, então digite **`curl.exe`**:

```bash
curl.exe -i http://localhost:3000/api/v1/status
curl.exe -i http://localhost:3000/api/v1/skills/9999
curl.exe -i -X DELETE http://localhost:3000/api/v1/status
```

O `-i` mostra o status e os headers da resposta. Veja o `200` e o `404`. No terceiro, o método errado, esta API responde **`404`, e não `405`**: o Express procura uma rota que case método **e** caminho, e se nenhuma casar cai no "rota não encontrada". Responder `405` com o header `Allow` exige programar isso, que é exatamente o que o exercício `node/02` pede.

Depois abra o painel com a aba **Network** do DevTools e compare: são as mesmas mensagens.

## Armadilhas comuns

- **Responder `200` com `{"erro": ...}` no corpo.** O status existe para isso: clientes, logs e monitoramento olham para ele.
- **`GET` que altera dados**: crawlers e pré-carregamento do navegador podem disparar sem querer.
- **Esquecer o `Content-Type: application/json`** ao enviar JSON: o servidor não interpreta o corpo.
- **`500` para erro do cliente**: dado inválido é `400`, e não falha do servidor.

## Leia na documentação oficial

1. [MDN · Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview): leia [HTTP flow](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview#http_flow) e [HTTP Messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview#http_messages).
2. [MDN · HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods): a tabela de métodos seguros, idempotentes e cacheáveis. Veja também o glossário de [Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent).
3. [MDN · HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status): a lista completa. Leia ao menos [Successful responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#successful_responses) e [Client error responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#client_error_responses).

## Pratique

Exercício com correção automática: **node/02 · Servidor HTTP sem Express**: montar requisição e resposta "na mão", com o módulo `node:http`.

```bash
npm run exercicio node/02
```

## Confira se entendeu

<details><summary>Quais partes tem uma resposta HTTP?</summary>

A linha de status (versão, código e mensagem), os headers, uma linha em branco e o corpo (opcional).
</details>

<details><summary>Por que <code>POST</code> não é idempotente e <code>DELETE</code> é?</summary>

Repetir um `POST` cria outro recurso a cada vez. Repetir um `DELETE` do mesmo recurso deixa o servidor no mesmo estado: o recurso continua apagado.
</details>

<details><summary>Qual a diferença entre <code>401</code> e <code>403</code>?</summary>

`401`: o servidor não sabe quem você é (falta autenticação ou ela é inválida). `403`: ele sabe quem você é, mas você não tem permissão.
</details>

<details><summary>O cliente mandou um campo obrigatório vazio. Qual faixa de status, e por quê?</summary>

4xx (normalmente `400`): o erro é do cliente, que pode corrigir e tentar de novo.
</details>
