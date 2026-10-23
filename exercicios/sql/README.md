# Exercícios de SQL: a loja

Todos os exercícios usam o mesmo banco, criado do zero a cada teste a partir de [`_loja/loja.sql`](_loja/loja.sql). Leia esse arquivo antes de começar: entender os dados é metade do trabalho.

```
clientes (id, nome, cidade)
produtos (id, nome, categoria, preco_centavos)
pedidos (id, cliente_id → clientes, data, status: 'enviado' | 'entregue' | 'cancelado')
itens_pedido (pedido_id → pedidos, produto_id → produtos, quantidade, preco_unitario_centavos)
```

- **Dinheiro em centavos inteiros:** `8990` = R$ 89,90.
- **Um pedido tem vários itens** (1:N), e um produto aparece em vários pedidos: `itens_pedido` é a tabela de ligação do N:N.
- **O valor de um item** é `quantidade × preco_unitario_centavos`, o preço do dia da compra, não o preço atual do produto.

Os testes rodam no SQLite por enquanto. Evite funções que só existem nele: o mesmo SQL deve rodar no PostgreSQL, que chega na v0.6.

Para explorar os dados enquanto pensa, cole o `loja.sql` em https://sqliteonline.com/ e teste suas consultas lá.
