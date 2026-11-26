// A parte de arquivos do "API -> planilha": ler, fazer backup, gravar e conferir.
// As regras ficam em alteracoes.ts (o quê) e xlsx.ts (como mexer no arquivo).
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { FUSO } from "../datas.ts";
import { mesDoPlano } from "../services/plano.ts";
import { resumirModulo } from "../services/trilha.ts";
import { abrir, conferir, gravar, lerAba } from "./xlsx.ts";
import { calcularAlteracoes, COLUNAS_DE_ID } from "./alteracoes.ts";
import type { Abas, DadosDaApi } from "./alteracoes.ts";
import type { Repositorios } from "../repositories/index.ts";

const ABAS_LIDAS = ["Premissas", "Cronograma", "Habilidades", "Cursos"] as const;

/** O que a planilha precisa da API. O status dos módulos considera o mês de `agora` (para "Atrasado"). */
export function dadosDaApi(repos: Repositorios, agora: Date = new Date()): DadosDaApi & { mes: number } {
  const planoInicio = repos.config.planoInicio();
  if (planoInicio === undefined) throw new Error("plano_inicio não está no banco.");
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
export function fazerBackup(caminho: string, bytes: Uint8Array, agora: Date, manter: number): string {
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
 * @param caminho  arquivo .xlsx
 */
export function atualizarPlanilha(
  caminho: string,
  dados: DadosDaApi,
  { gravar: deveGravar = false, hoje, agora = new Date(), manterBackups = 10 }:
    { gravar?: boolean; hoje: string; agora?: Date; manterBackups?: number },
) {
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
  const abas = Object.fromEntries(ABAS_LIDAS.map((aba) => [aba, lerAba(planilha, aba)])) as Abas;
  const { alteracoes, avisos } = calcularAlteracoes(abas, dados, { hoje });
  if (!deveGravar || alteracoes.length === 0) return { alteracoes, avisos, gravou: false, backup: undefined };

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
