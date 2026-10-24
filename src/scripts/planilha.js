// Atualiza as colunas de estudo da planilha do plano com os dados da API.
//   npm run planilha              -> simula: mostra o que mudaria, sem gravar
//   npm run planilha -- --gravar  -> grava (com backup em ..\backups-planilha\)
// A planilha fica fora do repositório: ..\Plano_3_anos_Vini.xlsx (ou PLANILHA_PATH).
import { fileURLToPath } from "node:url";
import { openDatabase } from "../db/database.js";
import { criarRepositorios } from "../repositories/index.js";
import { hojeISO } from "../datas.js";
import { atualizarPlanilha, dadosDaApi } from "../planilha/atualizar.js";

const CAMINHO = process.env.PLANILHA_PATH
  ?? fileURLToPath(new URL("../../../Plano_3_anos_Vini.xlsx", import.meta.url));
const GRAVAR = process.argv.includes("--gravar");

const dados = dadosDaApi(criarRepositorios(openDatabase()));

const curto = (v) => {
  if (v === null || v === undefined || v === "") return "(vazio)";
  const texto = typeof v === "string" ? `"${v}"` : String(v);
  return texto.length > 70 ? `${texto.slice(0, 67)}..."` : texto;
};

try {
  const { alteracoes, avisos, gravou, backup } = atualizarPlanilha(CAMINHO, dados, { gravar: GRAVAR, hoje: hojeISO() });
  console.log(`Planilha: ${CAMINHO} (mês ${dados.mes} do plano)\n`);
  if (alteracoes.length === 0) {
    console.log("A planilha já está em dia com a API. Nada a mudar.");
  } else {
    for (const a of alteracoes) console.log(`  ${a.aba}!${a.celula}: ${curto(a.antes)} → ${curto(a.depois)}`);
    console.log(`\n${alteracoes.length} célula(s).`);
    for (const aviso of avisos) console.log(`⚠️  ${aviso}`);
    console.log(gravou
      ? `\n✅ Gravado. Backup da versão anterior: ${backup}`
      : "\nSimulação: nada foi gravado. Para gravar: npm run planilha -- --gravar");
  }
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exitCode = 1;
}
