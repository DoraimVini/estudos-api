import { DatabaseSync } from "node:sqlite";
import { migrar } from "./migrate.ts";
import { sincronizarHabilidades, sincronizarCursos } from "./habilidades-cursos.ts";
import { sincronizarTrilha } from "./trilha.ts";
import { sincronizarExercicios } from "./exercicios.ts";

/**
 * Abre (ou cria) o banco, aplica as migrações pendentes e sincroniza com os arquivos do repositório:
 * habilidades.json, cursos.json, trilha.json e exercicios/catalogo.json, nessa ordem
 * (a trilha aponta para habilidades; os exercícios, para tópicos da trilha).
 * Os arquivos mandam na definição; o progresso (status, autoavaliação, sessões) fica no banco.
 */
export function openDatabase(path: string = process.env.DB_PATH ?? "estudos.db"): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON;");
  migrar(db);
  sincronizarHabilidades(db);
  sincronizarCursos(db);
  sincronizarTrilha(db);
  sincronizarExercicios(db);
  return db;
}
