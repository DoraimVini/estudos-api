import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

const seed = JSON.parse(
  readFileSync(new URL("./seed.json", import.meta.url), "utf8"),
);

export const NIVEIS = ["Júnior", "Pleno", "Sênior"];
export const STATUS = ["Não iniciado", "Em andamento", "Concluído", "Atrasado", "N/A"];
export const PRIORIDADES = ["Alta", "Média", "Baixa"];

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS skills (
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

  CREATE TABLE IF NOT EXISTS courses (
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

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    data TEXT NOT NULL,
    minutos INTEGER NOT NULL CHECK (minutos > 0),
    notas TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

/** Abre (ou cria) o banco, aplica o schema e carrega os dados da planilha se estiver vazio. */
export function openDatabase(path = process.env.DB_PATH ?? "estudos.db") {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  seedIfEmpty(db);
  return db;
}

function seedIfEmpty(db) {
  const { total } = db.prepare("SELECT COUNT(*) AS total FROM skills").get();
  if (total > 0) return;

  db.exec("BEGIN");
  try {
    db.prepare("INSERT OR REPLACE INTO config (chave, valor) VALUES ('plano_inicio', ?)")
      .run(seed.plano_inicio);

    const insertSkill = db.prepare(`
      INSERT INTO skills (nivel, area, nome, evidencia, onde_estudar, mes_inicio, mes_fim, hoje, meta, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const s of seed.skills) {
      insertSkill.run(s.nivel, s.area, s.nome, s.evidencia, s.onde_estudar,
        s.mes_inicio, s.mes_fim, s.hoje, s.meta, s.status);
    }

    const insertCourse = db.prepare(`
      INSERT INTO courses (nome, plataforma, conteudo, motivo, mes_inicio, mes_fim, prioridade, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of seed.courses) {
      insertCourse.run(c.nome, c.plataforma, c.conteudo, c.motivo,
        c.mes_inicio, c.mes_fim, c.prioridade, c.status);
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function getConfig(db, chave) {
  return db.prepare("SELECT valor FROM config WHERE chave = ?").get(chave)?.valor;
}
