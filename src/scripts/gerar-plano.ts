// Gera o PLANO.md a partir de src/db/trilha.json.  Uso: npm run plano
import { writeFileSync } from "node:fs";
import { TRILHA } from "../db/trilha.ts";
import { trilhaEmMarkdown } from "../services/markdown.ts";

const destino = new URL("../../PLANO.md", import.meta.url);
writeFileSync(destino, trilhaEmMarkdown(TRILHA));
console.log(`PLANO.md gerado com ${TRILHA.modulos.length} módulos.`);
