# Reajuste de preços com UPDATE

**Módulo 6 · SQL e PostgreSQL · tópico: Escrita** · banco: [a loja](../README.md)

## O que fazer

Em `solucao.sql`, escreva o comando que **aumenta em 10% o preço de todos os produtos de Eletrônicos**. O resultado precisa continuar em **centavos inteiros**. As outras categorias não podem mudar.

Desta vez não é um `SELECT`: o teste roda o seu comando e depois confere a tabela.

## Dicas
- `UPDATE tabela SET coluna = expressão WHERE condição`. **Sem `WHERE`, você muda a tabela inteira.** Sempre escreva o `WHERE` primeiro.
- `preco_centavos * 1.1` usa ponto flutuante e pode gerar `13200.000000000002`. Pense numa conta só com inteiros, ou arredonde.
- Repare que o preço dos **pedidos antigos** (`itens_pedido`) não deve mudar: eles guardam o preço do dia da compra. Por isso essa coluna existe.

## Rodar

```bash
npm run exercicio sql/07
```
