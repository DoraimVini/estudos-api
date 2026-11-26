import { readFileSync } from "node:fs";
import type { DatabaseSync, SQLInputValue } from "node:sqlite";
import { conferirSlug } from "./slug.ts";
import type { ItemArquivo } from "../tipos.ts";

const ler = (arquivo: string) => JSON.parse(readFileSync(new URL(arquivo, import.meta.url), "utf8"));

/** Habilidades do plano (fonte única: src/db/habilidades.json). */
export const HABILIDADES: ItemArquivo[] = ler("./habilidades.json").habilidades;

/** Cursos externos (fonte única: src/db/cursos.json). */
export const CURSOS: ItemArquivo[] = ler("./cursos.json").cursos;

/** Deixa a tabela skills igual ao habilidades.json. hoje, meta e status são do painel. */
export function sincronizarHabilidades(db: DatabaseSync, habilidades: ItemArquivo[] = HABILIDADES) {
  sincronizar(db, "skills", habilidades, {
    rotulo: "Habilidade",
    definicao: ["nivel", "area", "nome", "evidencia", "onde_estudar", "mes_inicio", "mes_fim"],
    inicial: ["meta"],
  });
}

/** Deixa a tabela courses igual ao cursos.json. prioridade e status são do painel. */
export function sincronizarCursos(db: DatabaseSync, cursos: ItemArquivo[] = CURSOS) {
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
interface Regras { rotulo: string; definicao: string[]; inicial: string[] }

function sincronizar(db: DatabaseSync, tabela: "skills" | "courses", itens: ItemArquivo[], { rotulo, definicao, inicial }: Regras) {
  const vistos = new Set<string>();
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
      // Os valores vêm do JSON: só texto, número ou null chegam ao banco.
      const valores = definicao.map((c) => (item[c] ?? null) as SQLInputValue);
      const linha = (porSlug.get(item.slug) ?? semSlug.get(item.nome)) as { id: number } | undefined;
      const id = linha?.id;
      if (id === undefined) {
        return Number(inserir.run(item.slug, ...valores, ...inicial.map((c) => item.inicial?.[c] ?? null)).lastInsertRowid);
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
