# Quem gastou mais (GROUP BY + HAVING)

**Módulo 6 · SQL e PostgreSQL · tópico: Agregação** · banco: [a loja](../README.md)

## O que fazer

Em `solucao.sql`, calcule quanto cada cliente gastou em pedidos **não cancelados** e mostre só quem gastou **mais de R$ 250,00**, do maior total para o menor.

Colunas: `nome`, `total_centavos`.

O valor de cada item é `quantidade × preco_unitario_centavos`.

## Dicas
- Você vai precisar de três tabelas: `clientes`, `pedidos` e `itens_pedido`.
- "Não cancelado" inclui `enviado`: leia o enunciado com cuidado.
- `WHERE` filtra **linhas antes** de agrupar; `HAVING` filtra **grupos depois**. O limite de R$ 250,00 é sobre o total, então vai no `HAVING`.

## Rodar

```bash
npm run exercicio sql/05
```
