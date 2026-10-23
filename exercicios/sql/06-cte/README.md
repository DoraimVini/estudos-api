# Acima da média da categoria

**Módulo 5 · SQL e PostgreSQL · tópico: Subqueries e CTEs** · banco: [a loja](../README.md)

## O que fazer

Em `solucao.sql`, liste os produtos que custam **mais que a média da própria categoria**. Ordene por categoria (alfabética) e, dentro dela, do mais caro para o mais barato.

Colunas: `nome`, `categoria`, `preco_centavos`.

## Dicas
- Primeiro calcule a média de cada categoria; depois compare cada produto com a média da categoria dele.
- Com CTE fica legível:
  ```sql
  WITH medias AS (
    SELECT ... FROM produtos GROUP BY ...
  )
  SELECT ... FROM produtos JOIN medias ON ...
  ```
- Bônus: resolva também com uma subquery correlacionada no `WHERE` e compare a legibilidade.

## Rodar

```bash
npm run exercicio sql/06
```
