import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { Skill } from "../tipos.ts";
import { linhas, linhaUnica, umaLinha } from "../db/sql.ts";

export interface FiltrosSkill { nivel?: string; status?: string; area?: string }
export type CamposSkill = Partial<Pick<Skill, "hoje" | "meta" | "status">>;
export interface ResumoNivel {
  total: number;
  concluidas: number;
  media_hoje: number | null;
  media_meta: number | null;
}

/** Acesso à tabela skills. Único lugar que escreve SQL sobre habilidades. */
export function skillsRepository(db: DatabaseSync) {
  const buscar = (id: number) => umaLinha<Skill>(db, "SELECT * FROM skills WHERE id = ?", id);

  return {
    listar({ nivel, status, area }: FiltrosSkill = {}): Skill[] {
      const filtros: string[] = [];
      const params: SQLInputValue[] = [];
      if (nivel) { filtros.push("nivel = ?"); params.push(nivel); }
      if (status) { filtros.push("status = ?"); params.push(status); }
      if (area) { filtros.push("area = ?"); params.push(area); }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      return linhas<Skill>(db, `SELECT * FROM skills ${where} ORDER BY id`, ...params);
    },

    buscar,

    existe: (id: number) => Boolean(buscar(id)),

    /** Atualiza só os campos enviados. Retorna a habilidade atualizada ou undefined se não existir. */
    atualizar(id: number, campos: CamposSkill): Skill | undefined {
      const atual = buscar(id);
      if (!atual) return undefined;
      const novo = { ...atual, ...campos };
      db.prepare("UPDATE skills SET hoje = ?, meta = ?, status = ? WHERE id = ?")
        .run(novo.hoje, novo.meta, novo.status, id);
      return buscar(id);
    },

    resumoPorNivel(nivel: string): ResumoNivel {
      const r = linhaUnica<Omit<ResumoNivel, "concluidas"> & { concluidas: number | null }>(db, `
        SELECT COUNT(*) AS total,
               SUM(status = 'Concluído') AS concluidas,
               ROUND(AVG(hoje), 1) AS media_hoje,
               ROUND(AVG(meta), 1) AS media_meta
        FROM skills WHERE nivel = ?`, nivel);
      return { ...r, concluidas: r.concluidas ?? 0 };
    },
  };
}
