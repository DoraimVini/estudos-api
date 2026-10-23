# Modelar avaliações com restrições

**Módulo 5 · SQL e PostgreSQL · tópico: Restrições** · banco: [a loja](../README.md)

A loja quer que clientes avaliem produtos. Uma boa modelagem faz o **banco** recusar dados errados, mesmo que a API tenha um bug.

## O que fazer

Em `solucao.sql`, escreva o `CREATE TABLE avaliacoes` com estas colunas e regras:

| Coluna | Regra |
|---|---|
| `id` | chave primária |
| `cliente_id` | obrigatório; precisa existir em `clientes` |
| `produto_id` | obrigatório; precisa existir em `produtos`; **se o produto for apagado, as avaliações dele também somem** |
| `nota` | obrigatória; inteiro de **1 a 5** |
| `comentario` | opcional |
| `data` | obrigatória |

E mais uma regra: **cada cliente avalia cada produto no máximo uma vez.**

O teste cria a tabela com o seu SQL e tenta inserir dados válidos e inválidos. Cada inserção inválida precisa ser recusada pelo banco.

## Dicas
- `NOT NULL`, `CHECK (...)`, `REFERENCES tabela(coluna)`, `ON DELETE CASCADE`, `UNIQUE (coluna1, coluna2)`.
- Veja como `src/db/migrations/002_trilha.sql`, desta API, usa essas mesmas restrições.

## Rodar

```bash
npm run exercicio sql/08
```

## Pronto quando
Os testes passam e você explica por que validar também no banco, e não só na API.
