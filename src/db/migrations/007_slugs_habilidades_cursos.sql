-- Identificadores fixos (slugs) para habilidades e cursos, vindos de habilidades.json e cursos.json.
-- A definição (nome, área, evidência, meses...) passa a vir desses arquivos a cada abertura do banco,
-- como a trilha; a autoavaliação e o status continuam no banco. Os bancos que já existem recebem os
-- slugs na próxima sincronização, casando pelo nome uma única vez (ver src/db/habilidades-cursos.js).

ALTER TABLE skills ADD COLUMN slug TEXT;    -- ex.: 'sql-postgresql'
ALTER TABLE courses ADD COLUMN slug TEXT;   -- ex.: 'curso-dev'

CREATE UNIQUE INDEX idx_skills_slug ON skills (slug);
CREATE UNIQUE INDEX idx_courses_slug ON courses (slug);
