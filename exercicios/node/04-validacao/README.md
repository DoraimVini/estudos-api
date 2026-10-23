# Validar o corpo de uma requisição

**Módulo 4 · Node e APIs REST · tópico: Validação**

Regra de ouro: **nunca confie no cliente**. Antes de gravar qualquer coisa, a API confere tipo, formato e campos. Uma boa validação devolve **todos** os erros de uma vez, e não só o primeiro, para quem chama corrigir tudo numa tentativa.

## O que fazer

Em `solucao.js`, **`validarTarefa(corpo)`** valida o corpo de um `POST /tarefas`:

| Campo | Regra |
|---|---|
| `titulo` | obrigatório; texto; depois de tirar os espaços das pontas, de 3 a 100 caracteres |
| `prazo` | opcional; texto `AAAA-MM-DD` com uma data **que existe** (`2026-02-30` é inválida) |
| `prioridade` | opcional; `"baixa"`, `"media"` ou `"alta"`; padrão `"media"` |
| qualquer outro | proibido |

Retorno:
- válido: `{ ok: true, valor: { titulo, prazo, prioridade } }`, com `titulo` sem espaços nas pontas, `prazo` igual a `null` quando não vier e `prioridade` com o padrão aplicado;
- inválido: `{ ok: false, erros: [{ campo, mensagem }] }`, com **um erro por campo problemático** (campos extras incluídos, cada um com o próprio nome em `campo`);
- se o corpo nem for um objeto (`null`, array, texto): `{ ok: false, erros: [{ campo: "corpo", mensagem }] }`.

As mensagens são livres, mas precisam ser texto não vazio e úteis para quem lê.

## Dicas
- Monte um array `erros`, vá adicionando e decida no final.
- Data real: crie `new Date(`${prazo}T00:00:00Z`)` e confira se `toISOString().slice(0, 10)` volta igual ao texto.
- `Array.isArray` é necessário porque `typeof []` é `"object"`.

## Rodar

```bash
npm run exercicio node/04
```

## Pronto quando
Os testes passam e você explica por que validar no front-end não dispensa validar na API.
