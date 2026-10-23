# Pedidos com o nome do cliente

**Módulo 5 · SQL e PostgreSQL · tópico: JOINs** · banco: [a loja](../README.md)

## O que fazer

Em `solucao.sql`, liste os **pedidos entregues** com o nome de quem comprou, do mais antigo para o mais recente.

Colunas: `pedido` (id do pedido), `data`, `cliente` (nome do cliente).

## Dicas
- O nome está em `clientes`, e o pedido só tem `cliente_id`: junte as tabelas com `JOIN ... ON`.
- Use apelidos curtos (`FROM pedidos p JOIN clientes c ON ...`) e qualifique as colunas (`p.id`, `c.nome`).

## Rodar

```bash
npm run exercicio sql/03
```
