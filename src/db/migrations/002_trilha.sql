-- Trilha de estudos (v0.3): módulos, tópicos e recursos, carregados de src/db/trilha.json.
-- O status do módulo não é guardado: é calculado a partir dos tópicos.

CREATE TABLE modulos (
  id INTEGER PRIMARY KEY,               -- número do módulo na trilha (1–12)
  nome TEXT NOT NULL,
  fase INTEGER NOT NULL,
  mes_inicio INTEGER NOT NULL,
  mes_fim INTEGER NOT NULL CHECK (mes_fim >= mes_inicio),
  objetivo TEXT NOT NULL,
  mini_projeto TEXT,
  pronto_quando TEXT,
  skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL
);

CREATE TABLE topicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,               -- posição dentro do módulo; identifica o tópico ao sincronizar
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'Não iniciado'
    CHECK (status IN ('Não iniciado', 'Em andamento', 'Concluído')),
  concluido_em TEXT,
  UNIQUE (modulo_id, ordem)
);

CREATE TABLE recursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL
);

-- Sessões de estudo podem apontar para um tópico.
ALTER TABLE sessions ADD COLUMN topico_id INTEGER REFERENCES topicos(id) ON DELETE SET NULL;

CREATE INDEX idx_topicos_modulo ON topicos (modulo_id);
CREATE INDEX idx_sessions_data ON sessions (data);
