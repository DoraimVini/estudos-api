// Apaga o banco local e recria a partir do seed.json (dados da planilha).
import { rmSync } from "node:fs";
import { openDatabase } from "./database.js";

const path = process.env.DB_PATH ?? "estudos.db";
rmSync(path, { force: true });
const db = openDatabase(path);
const { total } = db.prepare("SELECT COUNT(*) AS total FROM skills").get();
console.log(`Banco recriado em ${path} com ${total} habilidades.`);
db.close();
