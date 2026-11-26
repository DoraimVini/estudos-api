import type { DatabaseSync } from "node:sqlite";
import type { ModuloComContagem, Recurso, Topico, TopicoDetalhado } from "../tipos.ts";
import { linhas, linhaUnica, umaLinha } from "../db/sql.ts";

export interface ResumoTrilha { total_topicos: number; concluidos: number; em_andamento: number }

/** Acesso a modulos, topicos e recursos. */
export function trilhaRepository(db: DatabaseSync) {
  const buscarTopico = (id: number) => umaLinha<TopicoDetalhado>(db, `
    SELECT t.*, m.nome AS modulo_nome, m.slug AS modulo_slug, m.skill_id
    FROM topicos t JOIN modulos m ON m.id = t.modulo_id
    WHERE t.id = ?`, id);

  // Contagem de tópicos por status, junto com cada módulo.
  const MODULOS_COM_CONTAGEM = `
    SELECT m.*, sk.nome AS skill_nome,
           COUNT(t.id) AS total_topicos,
           COALESCE(SUM(t.status = 'Concluído'), 0) AS concluidos,
           COALESCE(SUM(t.status = 'Em andamento'), 0) AS em_andamento
    FROM modulos m
    LEFT JOIN topicos t ON t.modulo_id = m.id
    LEFT JOIN skills sk ON sk.id = m.skill_id`;

  return {
    listarModulos({ fase }: { fase?: number } = {}): ModuloComContagem[] {
      const where = fase === undefined ? "" : "WHERE m.fase = ?";
      const params = fase === undefined ? [] : [fase];
      return linhas<ModuloComContagem>(db, `${MODULOS_COM_CONTAGEM} ${where} GROUP BY m.id ORDER BY m.id`, ...params);
    },

    buscarModulo(id: number): ModuloComContagem | undefined {
      return umaLinha<ModuloComContagem>(db, `${MODULOS_COM_CONTAGEM} WHERE m.id = ? GROUP BY m.id`, id);
    },

    topicosDoModulo(moduloId: number): Topico[] {
      return linhas<Topico>(db, "SELECT * FROM topicos WHERE modulo_id = ? ORDER BY ordem", moduloId);
    },

    recursosDoModulo(moduloId: number): Recurso[] {
      return linhas<Recurso>(db, "SELECT * FROM recursos WHERE modulo_id = ? ORDER BY ordem", moduloId);
    },

    /** Todos os tópicos, agrupados por módulo: Map(modulo_id -> tópicos em ordem). */
    topicosPorModulo(): Map<number, Topico[]> {
      const mapa = new Map<number, Topico[]>();
      for (const t of linhas<Topico>(db, "SELECT * FROM topicos ORDER BY modulo_id, ordem")) {
        const doModulo = mapa.get(t.modulo_id) ?? [];
        doModulo.push(t);
        mapa.set(t.modulo_id, doModulo);
      }
      return mapa;
    },

    /** Tópico com o nome do módulo e a habilidade ligada a ele. */
    buscarTopico,

    atualizarTopico(id: number, { status, concluido_em }: { status: string; concluido_em: string | null }) {
      db.prepare("UPDATE topicos SET status = ?, concluido_em = ? WHERE id = ?").run(status, concluido_em, id);
      return buscarTopico(id);
    },

    resumo(): ResumoTrilha {
      return linhaUnica<ResumoTrilha>(db, `
        SELECT COUNT(*) AS total_topicos,
               COALESCE(SUM(status = 'Concluído'), 0) AS concluidos,
               COALESCE(SUM(status = 'Em andamento'), 0) AS em_andamento
        FROM topicos`);
    },
  };
}
