import { DatabaseSync } from "node:sqlite";
import { migrar } from "./migrate.js";
import { sincronizarHabilidades, sincronizarCursos } from "./habilidades-cursos.js";
import { sincronizarTrilha } from "./trilha.js";
import { sincronizarExercicios } from "./exercicios.js";

/**
 * Abre (ou cria) o banco, aplica as migrações pendentes e sincroniza com os arquivos do repositório:
 * habilidades.json, cursos.json, trilha.json e exercicios/catalogo.json, nessa ordem
 * (a trilha aponta para habilidades; os exercícios, para tópicos da trilha).
 * Os arquivos mandam na definição; o progresso (status, autoavaliação, sessões) fica no banco.
 */
export function openDatabase(path = process.env.DB_PATH ?? "estudos.db") {
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON;");
  migrar(db);
  sincronizarHabilidades(db);
  sincronizarCursos(db);
  sincronizarTrilha(db);
  sincronizarExercicios(db);
  return db;
}
