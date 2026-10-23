-- Schema inicial (v0.1): habilidades e cursos da planilha, sessões de estudo.

CREATE TABLE config (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nivel TEXT NOT NULL,
  area TEXT NOT NULL,
  nome TEXT NOT NULL,
  evidencia TEXT,
  onde_estudar TEXT,
  mes_inicio INTEGER,
  mes_fim INTEGER,
  hoje INTEGER CHECK (hoje IS NULL OR hoje BETWEEN 1 AND 5),
  meta INTEGER NOT NULL CHECK (meta BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'Não iniciado'
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  plataforma TEXT,
  conteudo TEXT,
  motivo TEXT,
  mes_inicio INTEGER,
  mes_fim INTEGER,
  prioridade TEXT NOT NULL DEFAULT 'Média',
  status TEXT NOT NULL DEFAULT 'Não iniciado'
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  data TEXT NOT NULL,
  minutos INTEGER NOT NULL CHECK (minutos > 0),
  notas TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
