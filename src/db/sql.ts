import type { DatabaseSync, SQLInputValue } from "node:sqlite";

// O node:sqlite não sabe o formato das linhas: devolve Record<string, ...> genérico.
// Estas funções dizem ao TypeScript que formato esperar. É uma promessa nossa, não uma checagem:
// o tipo tem que bater com o SELECT (os tipos das tabelas ficam em src/tipos.ts).

/** Primeira linha da consulta, ou undefined se não houver. */
export function umaLinha<T>(db: DatabaseSync, sql: string, ...params: SQLInputValue[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

/** Todas as linhas da consulta. */
export function linhas<T>(db: DatabaseSync, sql: string, ...params: SQLInputValue[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}

/** Consulta que sempre devolve uma linha (COUNT, SUM, PRAGMA...). */
export function linhaUnica<T>(db: DatabaseSync, sql: string, ...params: SQLInputValue[]): T {
  const linha = umaLinha<T>(db, sql, ...params);
  if (linha === undefined) throw new Error(`Consulta sem resultado: ${sql}`);
  return linha;
}
