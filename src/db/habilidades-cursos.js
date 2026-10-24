import { readFileSync } from "node:fs";
import { conferirSlug } from "./slug.js";

const ler = (arquivo) => JSON.parse(readFileSync(new URL(arquivo, import.meta.url), "utf8"));

/** Habilidades do plano (fonte única: src/db/habilidades.json). */
export const HABILIDADES = ler("./habilidades.json").habilidades;

/** Cursos externos (fonte única: src/db/cursos.json). */
export const CURSOS = ler("./cursos.json").cursos;

/** Deixa a tabela skills igual ao habilidades.json. hoje, meta e status são do painel. */
export function sincronizarHabilidades(db, habilidades = HABILIDADES) {
  sincronizar(db, "skills", habilidades, {
    rotulo: "Habilidade",
    definicao: ["nivel", "area", "nome", "evidencia", "onde_estudar", "mes_inicio", "mes_fim"],
    inicial: ["meta"],
  });
}

/** Deixa a tabela courses igual ao cursos.json. prioridade e status são do painel. */
export function sincronizarCursos(db, cursos = CURSOS) {
  sincronizar(db, "courses", cursos, {
    rotulo: "Curso",
    definicao: ["nome", "plataforma", "conteudo", "motivo", "mes_inicio", "mes_fim"],
    inicial: ["prioridade", "status"],
  });
}

/**
 * Sincroniza uma tabela com a lista do JSON, sem perder o progresso.
 * - Cada linha é identificada pelo slug. Bancos criados antes da migração 007 ainda não têm slug:
 *   casam pelo nome, uma única vez (depois disso toda linha tem slug).
 * - Os campos de `definicao` vêm sempre do JSON. Os de `inicial` só são usados ao criar a linha;
 *   depois quem manda é o painel (PATCH), então a sincronização nunca os sobrescreve.
 * - O que saiu do JSON é apagado (sessões ligadas ficam com NULL).
 */
function sincronizar(db, tabela, itens, { rotulo, definicao, inicial }) {
  const vistos = new Set();
  for (const item of itens) {
    conferirSlug(item.slug, `${rotulo} "${item.nome}"`, vistos);
    for (const campo of inicial) {
      if (item.inicial?.[campo] == null) throw new Error(`${rotulo} ${item.slug}: falta "inicial.${campo}".`);
    }
  }

  // Nomes de tabela e coluna vêm das constantes acima, nunca do JSON.
  const porSlug = db.prepare(`SELECT id FROM ${tabela} WHERE slug = ?`);
  const semSlug = db.prepare(`SELECT id FROM ${tabela} WHERE slug IS NULL AND nome = ?`);
  const atualizar = db.prepare(
    `UPDATE ${tabela} SET slug = ?, ${definicao.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`,
  );
  const colunas = ["slug", ...definicao, ...inicial];
  const inserir = db.prepare(
    `INSERT INTO ${tabela} (${colunas.join(", ")}) VALUES (${colunas.map(() => "?").join(", ")})`,
  );

  db.exec("BEGIN");
  try {
    const manter = itens.map((item) => {
      const valores = definicao.map((c) => item[c] ?? null);
      const id = (porSlug.get(item.slug) ?? semSlug.get(item.nome))?.id;
      if (id === undefined) {
        return Number(inserir.run(item.slug, ...valores, ...inicial.map((c) => item.inicial[c])).lastInsertRowid);
      }
      atualizar.run(item.slug, ...valores, id);
      return id;
    });
    db.prepare(`DELETE FROM ${tabela} WHERE id NOT IN (${manter.map(() => "?").join(", ")})`).run(...manter);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
