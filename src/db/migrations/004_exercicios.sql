-- Exercícios com correção automática (v0.4), carregados de exercicios/catalogo.json.
-- O status só muda para 'Resolvido' quando os testes do exercício passam (npm run exercicio).

CREATE TABLE exercicios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,            -- pasta do exercício, ex.: 'sql/03-join'
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  topico_id INTEGER REFERENCES topicos(id) ON DELETE SET NULL,
  ordem INTEGER NOT NULL,               -- posição no catálogo
  titulo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Resolvido')),
  tentativas INTEGER NOT NULL DEFAULT 0,
  resolvido_em TEXT
);

CREATE INDEX idx_exercicios_modulo ON exercicios (modulo_id);
