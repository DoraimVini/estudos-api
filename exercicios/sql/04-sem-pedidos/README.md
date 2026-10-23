# Clientes que nunca compraram

**Módulo 5 · SQL e PostgreSQL · tópico: JOINs** · banco: [a loja](../README.md)

## O que fazer

Em `solucao.sql`, liste o `nome` dos clientes que **nunca fizeram nenhum pedido**, em ordem alfabética. Um pedido cancelado ainda conta como pedido feito.

## Dicas
- `INNER JOIN` só traz quem tem par nas duas tabelas. `LEFT JOIN` traz todos da esquerda, com `NULL` onde não há par.
- Depois do `LEFT JOIN`, filtre as linhas em que o lado direito ficou `NULL`. Atenção: o certo é `IS NULL`, e não `= NULL`.
- Bônus: resolva também com `NOT EXISTS` e compare as duas versões.

## Rodar

```bash
npm run exercicio sql/04
```
