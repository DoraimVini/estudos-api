// Apaga o banco local e recria a partir dos arquivos do repositório (habilidades, cursos, trilha e exercícios).
import { rmSync } from "node:fs";
import { openDatabase } from "./database.ts";
import { linhaUnica } from "./sql.ts";

const path = process.env.DB_PATH ?? "estudos.db";
rmSync(path, { force: true });
const db = openDatabase(path);
const { total } = linhaUnica<{ total: number }>(db, "SELECT COUNT(*) AS total FROM skills");
console.log(`Banco recriado em ${path} com ${total} habilidades.`);
db.close();
