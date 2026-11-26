import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { Course } from "../tipos.ts";
import { linhas, umaLinha } from "../db/sql.ts";

export interface FiltrosCourse { prioridade?: string; status?: string }
export type CamposCourse = Partial<Pick<Course, "status" | "prioridade">>;

/** Acesso à tabela courses. */
export function coursesRepository(db: DatabaseSync) {
  const buscar = (id: number) => umaLinha<Course>(db, "SELECT * FROM courses WHERE id = ?", id);

  return {
    listar({ prioridade, status }: FiltrosCourse = {}): Course[] {
      const filtros: string[] = [];
      const params: SQLInputValue[] = [];
      if (prioridade) { filtros.push("prioridade = ?"); params.push(prioridade); }
      if (status) { filtros.push("status = ?"); params.push(status); }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      return linhas<Course>(db, `SELECT * FROM courses ${where} ORDER BY mes_inicio, id`, ...params);
    },

    buscar,

    existe: (id: number) => Boolean(buscar(id)),

    /** Atualiza só os campos enviados. Retorna o curso atualizado ou undefined se não existir. */
    atualizar(id: number, campos: CamposCourse): Course | undefined {
      const atual = buscar(id);
      if (!atual) return undefined;
      const novo = { ...atual, ...campos };
      db.prepare("UPDATE courses SET status = ?, prioridade = ? WHERE id = ?")
        .run(novo.status, novo.prioridade, id);
      return buscar(id);
    },
  };
}
