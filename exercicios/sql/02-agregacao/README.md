# Agregação por categoria

**Módulo 6 · SQL e PostgreSQL · tópico: Agregação** · banco: [a loja](../README.md)

## O que fazer

Em `solucao.sql`, escreva **uma consulta** que mostre, para cada categoria de produto:
- `categoria`;
- `produtos`: quantos produtos ela tem;
- `preco_medio`: o preço médio em centavos, **arredondado para inteiro**.

Em ordem alfabética de categoria.

## Dicas
- `GROUP BY` junta as linhas por categoria; `COUNT(*)` e `AVG(...)` calculam por grupo.
- `ROUND(valor)` arredonda. Para dar nome à coluna: `AS produtos`.
- Toda coluna do `SELECT` que não é agregação precisa estar no `GROUP BY`.

## Rodar

```bash
npm run exercicio sql/02
```
