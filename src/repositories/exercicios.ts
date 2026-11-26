import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import type { ExercicioComNomes } from "../tipos.ts";
import { linhas, linhaUnica, umaLinha } from "../db/sql.ts";

/** Acesso à tabela exercicios. */
export function exerciciosRepository(db: DatabaseSync) {
  const SELECT_COM_NOMES = `
    SELECT e.*, m.nome AS modulo_nome, t.nome AS topico_nome
    FROM exercicios e
    JOIN modulos m ON m.id = e.modulo_id
    LEFT JOIN topicos t ON t.id = e.topico_id`;
  const buscarPorSlug = (slug: string) =>
    umaLinha<ExercicioComNomes>(db, `${SELECT_COM_NOMES} WHERE e.slug = ?`, slug);

  return {
    listar({ modulo, status }: { modulo?: number; status?: string } = {}): ExercicioComNomes[] {
      const filtros: string[] = [];
      const params: SQLInputValue[] = [];
      if (modulo !== undefined) { filtros.push("e.modulo_id = ?"); params.push(modulo); }
      if (status) { filtros.push("e.status = ?"); params.push(status); }
      const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";
      return linhas<ExercicioComNomes>(db, `${SELECT_COM_NOMES} ${where} ORDER BY e.ordem`, ...params);
    },

    buscar: (id: number) => umaLinha<ExercicioComNomes>(db, `${SELECT_COM_NOMES} WHERE e.id = ?`, id),

    buscarPorSlug,

    /**
     * Registra uma tentativa vinda de npm run exercicio.
     * Passou: vira 'Resolvido' (a data da primeira vez fica). Falhou: só soma a tentativa.
     * @param hoje data AAAA-MM-DD
     */
    registrarTentativa(slug: string, passou: boolean, hoje: string) {
      db.prepare(`
        UPDATE exercicios SET
          tentativas = tentativas + 1,
          status = CASE WHEN ? THEN 'Resolvido' ELSE status END,
          resolvido_em = CASE WHEN ? AND resolvido_em IS NULL THEN ? ELSE resolvido_em END
        WHERE slug = ?`).run(passou ? 1 : 0, passou ? 1 : 0, hoje, slug);
      return buscarPorSlug(slug);
    },

    resumo() {
      return linhaUnica<{ total: number; resolvidos: number }>(db, `
        SELECT COUNT(*) AS total, COALESCE(SUM(status = 'Resolvido'), 0) AS resolvidos
        FROM exercicios`);
    },
  };
}
