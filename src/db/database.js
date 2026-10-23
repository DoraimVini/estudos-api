import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { migrar } from "./migrate.js";

const seed = JSON.parse(
  readFileSync(new URL("./seed.json", import.meta.url), "utf8"),
);

/** Abre (ou cria) o banco, aplica as migrações pendentes e carrega os dados da planilha se estiver vazio. */
export function openDatabase(path = process.env.DB_PATH ?? "estudos.db") {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON;");
  migrar(db);
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
