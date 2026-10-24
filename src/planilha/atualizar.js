// A parte de arquivos do "API -> planilha": ler, fazer backup, gravar e conferir.
// As regras ficam em alteracoes.js (o quê) e xlsx.js (como mexer no arquivo).
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { FUSO } from "../datas.js";
import { mesDoPlano } from "../services/plano.js";
import { resumirModulo } from "../services/trilha.js";
import { abrir, conferir, gravar, lerAba } from "./xlsx.js";
import { calcularAlteracoes, COLUNAS_DE_ID } from "./alteracoes.js";

const ABAS_LIDAS = ["Premissas", "Cronograma", "Habilidades", "Cursos"];

/** O que a planilha precisa da API. O status dos módulos considera o mês de `agora` (para "Atrasado"). */
export function dadosDaApi(repos, agora = new Date()) {
  const planoInicio = repos.config.planoInicio();
  const mes = mesDoPlano(planoInicio, agora);
  return {
    planoInicio,
    mes,
    habilidades: repos.skills.listar(),
    cursos: repos.courses.listar(),
    modulos: repos.trilha.listarModulos().map((m) => resumirModulo(m, mes)),
  };
}

// sv-SE formata como "2026-10-24 21:30:05": ordena bem como nome de arquivo.
const formatoCarimbo = new Intl.DateTimeFormat("sv-SE", {
  timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
});

/** Copia a planilha para ../backups-planilha/ e apaga os backups mais antigos além de `manter`. */
export function fazerBackup(caminho, bytes, agora, manter) {
  const pasta = join(dirname(caminho), "backups-planilha");
  mkdirSync(pasta, { recursive: true });
  const nome = basename(caminho, extname(caminho));
  const carimbo = formatoCarimbo.format(agora).replace(" ", "_").replace(/:/g, "-");
  const destino = join(pasta, `${nome}_${carimbo}.xlsx`);
  writeFileSync(destino, bytes);

  const antigos = readdirSync(pasta).filter((f) => f.startsWith(`${nome}_`) && f.endsWith(".xlsx")).sort();
  for (const f of antigos.slice(0, Math.max(0, antigos.length - manter))) rmSync(join(pasta, f));
  return destino;
}

/**
 * Calcula as alterações e, com `gravar`, aplica na planilha.
 * Sem `gravar`, só simula: a planilha não é aberta para escrita.
 * @param {string} caminho  arquivo .xlsx
 * @param {Parameters<typeof calcularAlteracoes>[1]} dados  dados da API
 * @returns {{ alteracoes: object[], avisos: string[], gravou: boolean, backup?: string }}
 */
export function atualizarPlanilha(caminho, dados, { gravar: deveGravar = false, hoje, agora = new Date(), manterBackups = 10 }) {
  if (!existsSync(caminho)) {
    throw new Error(`Planilha não encontrada em ${caminho}. Use a variável PLANILHA_PATH para indicar outro arquivo.`);
  }
  // O Excel cria "~$Nome.xlsx" ao lado enquanto a planilha está aberta. Gravar por baixo dele
  // faria você perder o que digitou lá (ou o Excel perderia o que gravamos).
  const trava = join(dirname(caminho), `~$${basename(caminho)}`);
  if (deveGravar && existsSync(trava)) {
    throw new Error("A planilha está aberta no Excel. Feche-a e rode de novo.");
  }

  const original = readFileSync(caminho);
  const planilha = abrir(original);
  const abas = Object.fromEntries(ABAS_LIDAS.map((aba) => [aba, lerAba(planilha, aba)]));
  const { alteracoes, avisos } = calcularAlteracoes(abas, dados, { hoje });
  if (!deveGravar || alteracoes.length === 0) return { alteracoes, avisos, gravou: false };

  const novo = gravar(planilha, alteracoes.map(({ aba, celula, depois }) => ({ aba, celula, valor: depois })), {
    larguras: COLUNAS_DE_ID.map(({ aba, numColuna, largura }) => ({ aba, coluna: numColuna, largura })),
  });
  // Confere em memória, antes de tocar no disco: só as células pedidas podem ter mudado.
  const problemas = conferir(original, novo, alteracoes);
  if (problemas.length) {
    throw new Error(`A conferência encontrou mudanças inesperadas; nada foi gravado.\n- ${problemas.join("\n- ")}`);
  }

  const backup = fazerBackup(caminho, original, agora, manterBackups);
  // Grava num arquivo ao lado e troca de nome: se algo falhar no meio, a planilha original fica inteira.
  const temporario = `${caminho}.novo`;
  writeFileSync(temporario, novo);
  renameSync(temporario, caminho);
  if (!readFileSync(caminho).equals(Buffer.from(novo))) {
    copyFileSync(backup, caminho);
    throw new Error(`O arquivo gravado não conferiu com o esperado; a planilha foi restaurada do backup (${backup}).`);
  }
  return { alteracoes, avisos, gravou: true, backup };
}
