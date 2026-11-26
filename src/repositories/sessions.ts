import type { DatabaseSync } from "node:sqlite";
import type { Session } from "../tipos.ts";
import { linhas, linhaUnica, umaLinha } from "../db/sql.ts";

/** Sessão com os nomes da habilidade, do curso e do tópico (listar). */
export interface SessionComNomes extends Session {
  skill_nome: string | null;
  course_nome: string | null;
  topico_nome: string | null;
  modulo_id: number | null;
}

export type NovaSessao = Pick<Session, "skill_id" | "course_id" | "topico_id" | "data" | "minutos" | "notas">;

/** Acesso à tabela sessions (sessões de estudo). */
export function sessionsRepository(db: DatabaseSync) {
  return {
    /** Sessões entre duas datas AAAA-MM-DD (inclusive), mais recentes primeiro. */
    listar({ de = "0000-01-01", ate = "9999-12-31" }: { de?: string; ate?: string } = {}): SessionComNomes[] {
      return linhas<SessionComNomes>(db, `
        SELECT s.*, sk.nome AS skill_nome, c.nome AS course_nome,
               t.nome AS topico_nome, t.modulo_id
        FROM sessions s
        LEFT JOIN skills sk ON sk.id = s.skill_id
        LEFT JOIN courses c ON c.id = s.course_id
        LEFT JOIN topicos t ON t.id = s.topico_id
        WHERE s.data >= ? AND s.data <= ?
        ORDER BY s.data DESC, s.id DESC`, de, ate);
    },

    criar({ skill_id, course_id, topico_id, data, minutos, notas }: NovaSessao): Session | undefined {
      const { lastInsertRowid } = db.prepare(`
        INSERT INTO sessions (skill_id, course_id, topico_id, data, minutos, notas)
        VALUES (?, ?, ?, ?, ?, ?)`)
        .run(skill_id, course_id, topico_id, data, minutos, notas);
      return umaLinha<Session>(db, "SELECT * FROM sessions WHERE id = ?", lastInsertRowid);
    },

    /** true se apagou */
    apagar(id: number): boolean {
      return Number(db.prepare("DELETE FROM sessions WHERE id = ?").run(id).changes) > 0;
    },

    minutosDesde(data: string): number {
      return linhaUnica<{ minutos: number }>(db,
        "SELECT COALESCE(SUM(minutos), 0) AS minutos FROM sessions WHERE data >= ?", data).minutos;
    },

    habilidadesMaisEstudadas(limite = 5) {
      return linhas<{ id: number; nome: string; minutos: number }>(db, `
        SELECT sk.id, sk.nome, SUM(s.minutos) AS minutos
        FROM sessions s JOIN skills sk ON sk.id = s.skill_id
        GROUP BY sk.id ORDER BY minutos DESC LIMIT ?`, limite);
    },
  };
}
