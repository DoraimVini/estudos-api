-- Banco de exemplo dos exercícios de SQL: uma pequena loja.
-- Dinheiro em centavos inteiros (8990 = R$ 89,90) para não ter erro de arredondamento.

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  preco_centavos INTEGER NOT NULL CHECK (preco_centavos > 0)
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('enviado', 'entregue', 'cancelado'))
);

-- preco_unitario_centavos guarda o preço do dia da compra (o preço do produto pode mudar depois).
CREATE TABLE itens_pedido (
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario_centavos INTEGER NOT NULL,
  PRIMARY KEY (pedido_id, produto_id)
);

INSERT INTO clientes (id, nome, cidade) VALUES
  (1, 'Ana', 'Rio de Janeiro'),
  (2, 'Bruno', 'São Paulo'),
  (3, 'Carla', 'Rio de Janeiro'),
  (4, 'Diego', 'Belo Horizonte'),
  (5, 'Elisa', 'São Paulo'),
  (6, 'Fábio', 'Curitiba');

INSERT INTO produtos (id, nome, categoria, preco_centavos) VALUES
  (1, 'Clean Code', 'Livros', 8990),
  (2, 'O Programador Pragmático', 'Livros', 7900),
  (3, 'Entendendo Algoritmos', 'Livros', 4500),
  (4, 'Pense em Python', 'Livros', 3990),
  (5, 'Teclado mecânico', 'Eletrônicos', 35000),
  (6, 'Mouse sem fio', 'Eletrônicos', 12000),
  (7, 'Monitor 24"', 'Eletrônicos', 89900),
  (8, 'Caneca dev', 'Acessórios', 3500),
  (9, 'Kit de adesivos', 'Acessórios', 1500),
  (10, 'Mochila para notebook', 'Acessórios', 18000);

INSERT INTO pedidos (id, cliente_id, data, status) VALUES
  (1, 1, '2026-09-02', 'entregue'),
  (2, 2, '2026-09-05', 'entregue'),
  (3, 1, '2026-09-20', 'entregue'),
  (4, 3, '2026-10-01', 'enviado'),
  (5, 4, '2026-10-03', 'cancelado'),
  (6, 2, '2026-10-10', 'entregue'),
  (7, 3, '2026-10-15', 'entregue');

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario_centavos) VALUES
  (1, 1, 1, 8990),
  (1, 8, 2, 3500),
  (2, 5, 1, 35000),
  (2, 6, 1, 12000),
  (3, 3, 1, 4500),
  (4, 7, 1, 89900),
  (5, 10, 1, 18000),
  (6, 2, 1, 7900),
  (6, 9, 3, 1500),
  (7, 4, 2, 3990),
  (7, 8, 1, 3500);
