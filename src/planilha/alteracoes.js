// Regra pura de "API -> planilha": recebe as células atuais da planilha e os dados da API e devolve
// a lista de células a mudar. Não lê nem grava arquivo (isso fica em src/scripts/planilha.js).
// A API é dona dos estudos; a planilha continua dona de visto, orçamento, candidaturas e riscos,
// então só as colunas abaixo são escritas. Fórmulas, custos e as outras abas nunca são tocados.
import { NIVEIS } from "../constantes.js";

/** Último mês do plano de 3 anos: depois dele, a planilha escreve "Após o plano". */
export const ULTIMO_MES = 36;

/** Curso que aparece em todo mês da coluna "Estudos" do Cronograma enquanto estiver na janela. */
const CURSO_BASE = "curso-dev";

// Na planilha, os temas de estudo ainda aparecem como cursos (eram cursos antes de virar módulos).
// Só é usado na primeira vez, para preencher a coluna de id; depois, a linha é achada pelo id.
const CURSOS_QUE_VIRARAM_MODULO = {
  "Git e GitHub avançado": "git",
  TypeScript: "typescript",
  "SQL / PostgreSQL": "sql",
  CS50: "computacao",
  "React / Next.js": "react",
  "Testes automatizados": "testes",
  "Docker + deploy": "docker",
  "CI/CD (GitHub Actions)": "ci-cd",
};
const PREFIXO_MODULO = "modulo:";

const TITULO_ID = "id (API)";

// Layout esperado. Se alguém mudar a planilha (inserir coluna, renomear cabeçalho), o script para
// em vez de escrever no lugar errado.
const CABECALHOS = {
  Cronograma: { linha: 1, colunas: { A: "Nº", D: "Estudos" } },
  Habilidades: {
    linha: 4,
    colunas: {
      A: "Nível", B: "Área", C: "Habilidade", D: "Como provar (evidência)", E: "Onde estudar",
      F: "Meses do plano", G: "Hoje (1–5)", H: "Meta (1–5)", I: "Falta", J: "Status",
    },
  },
  Cursos: { linha: 1, colunas: { A: "Curso / estudo", E: "Mês início", F: "Mês fim", G: "Prioridade", M: "Status" } },
};

/** Colunas de id criadas pelo script (com a largura que elas ganham). */
export const COLUNAS_DE_ID = [
  { aba: "Habilidades", coluna: "K", numColuna: 11, largura: 24 },
  { aba: "Cursos", coluna: "O", numColuna: 15, largura: 24 },
];
const COLUNA_ID = Object.fromEntries(COLUNAS_DE_ID.map((c) => [c.aba, c.coluna]));

/** "1–6", "7" ou "Após o plano", no mesmo formato que a planilha já usava. */
export function mesesDoPlano(inicio, fim) {
  if (inicio == null) return null;
  if (inicio > ULTIMO_MES) return "Após o plano";
  return fim == null || fim === inicio ? String(inicio) : `${inicio}–${fim}`;
}

/** Data guardada pelo Excel (número de dias desde 30/12/1899) -> "AAAA-MM-DD". */
export function dataDoExcel(valor) {
  if (typeof valor === "string") return valor.slice(0, 10);
  if (typeof valor !== "number") return null;
  return new Date(Date.UTC(1899, 11, 30) + Math.round(valor) * 86_400_000).toISOString().slice(0, 10);
}

const vazio = (v) => v === null || v === undefined || v === "";
const iguais = (a, b) => (vazio(a) && vazio(b)) || a === b;

function conferirCabecalhos(abas) {
  for (const [aba, { linha, colunas }] of Object.entries(CABECALHOS)) {
    for (const [coluna, esperado] of Object.entries(colunas)) {
      const achado = abas[aba].get(`${coluna}${linha}`)?.valor;
      if (achado !== esperado) {
        throw new Error(`A aba ${aba} mudou de formato: esperava "${esperado}" em ${coluna}${linha}, encontrei "${achado ?? ""}".`);
      }
    }
  }
}

/** Linhas de dados de uma tabela: da linha `inicio` em diante, enquanto `continua(linha)` for verdade. */
function linhasDeDados(inicio, continua) {
  const linhas = [];
  for (let n = inicio; continua(n); n++) linhas.push(n);
  return linhas;
}

/**
 * Casa cada linha da planilha com um item da API: pela coluna de id ou, se ela estiver vazia, pelo nome.
 * Recusa linha sem par, item da API sem linha e dois itens na mesma linha.
 * @returns {Map<number, string>} linha -> id
 */
function casarLinhas(aba, celulas, linhas, colunaNome, idPorNome, idsValidos) {
  const colunaId = COLUNA_ID[aba];
  const casadas = new Map();
  const usados = new Map();
  for (const n of linhas) {
    const idNaPlanilha = celulas.get(`${colunaId}${n}`)?.valor;
    const nome = celulas.get(`${colunaNome}${n}`)?.valor;
    const id = vazio(idNaPlanilha) ? idPorNome.get(nome) : String(idNaPlanilha);
    if (id === undefined) throw new Error(`${aba}, linha ${n}: "${nome}" não existe na API (e a coluna ${colunaId} está vazia).`);
    if (!idsValidos.has(id)) throw new Error(`${aba}, linha ${n}: o id "${id}" da coluna ${colunaId} não existe na API.`);
    if (usados.has(id)) throw new Error(`${aba}: "${id}" aparece nas linhas ${usados.get(id)} e ${n}.`);
    usados.set(id, n);
    casadas.set(n, id);
  }
  return casadas;
}

/**
 * Calcula o que mudar na planilha.
 * @param {Record<"Premissas"|"Cronograma"|"Habilidades"|"Cursos", Map<string, { valor: any, formula: boolean }>>} abas
 * @param {{ planoInicio: string, habilidades: object[], cursos: object[], modulos: object[] }} dados
 *   modulos: { slug, nome, mes_inicio, mes_fim, status, atrasado } (já resumidos com o mês atual)
 * @param {{ hoje: string }} opcoes  data de hoje (AAAA-MM-DD) para o carimbo
 * @returns {{ alteracoes: { aba: string, celula: string, antes: any, depois: any }[], avisos: string[] }}
 */
export function calcularAlteracoes(abas, dados, { hoje }) {
  const inicioNaPlanilha = dataDoExcel(abas.Premissas.get("B3")?.valor);
  if (inicioNaPlanilha !== dados.planoInicio) {
    throw new Error(`A data de início difere: planilha (Premissas!B3) = ${inicioNaPlanilha}, API = ${dados.planoInicio}. Acerte uma das duas antes.`);
  }
  conferirCabecalhos(abas);

  const desejado = []; // { aba, celula, valor }
  const definir = (aba, celula, valor) => desejado.push({ aba, celula, valor: vazio(valor) ? null : valor });

  // Cronograma: coluna "Estudos" dos meses cobertos pela trilha.
  const cronograma = abas.Cronograma;
  const ultimoMesDaTrilha = Math.max(...dados.modulos.map((m) => m.mes_fim));
  const cursoBase = dados.cursos.find((c) => c.slug === CURSO_BASE);
  for (const n of linhasDeDados(2, (n) => typeof cronograma.get(`A${n}`)?.valor === "number")) {
    const mes = cronograma.get(`A${n}`).valor;
    if (mes > ultimoMesDaTrilha) continue;
    const partes = [
      ...(cursoBase && cursoBase.mes_inicio <= mes && mes <= cursoBase.mes_fim ? [cursoBase.nome] : []),
      ...dados.modulos.filter((m) => m.mes_inicio <= mes && mes <= m.mes_fim).map((m) => m.nome),
    ];
    definir("Cronograma", `D${n}`, partes.length ? `${partes.join(" + ")}.` : null);
  }

  // Habilidades: a linha inteira, menos a fórmula "Falta" (I).
  const habilidades = abas.Habilidades;
  const habPorSlug = new Map(dados.habilidades.map((h) => [h.slug, h]));
  const linhasHab = linhasDeDados(5, (n) => NIVEIS.includes(habilidades.get(`A${n}`)?.valor));
  const casadasHab = casarLinhas("Habilidades", habilidades, linhasHab, "C",
    new Map(dados.habilidades.map((h) => [h.nome, h.slug])), new Set(habPorSlug.keys()));
  const semLinha = dados.habilidades.filter((h) => ![...casadasHab.values()].includes(h.slug));
  if (semLinha.length) {
    throw new Error(`Habilidades sem linha na planilha: ${semLinha.map((h) => h.slug).join(", ")}. `
      + "Crie a linha (copiando uma existente, para levar a fórmula de Falta) e ponha o id na coluna K.");
  }
  definir("Habilidades", "K4", TITULO_ID);
  for (const [n, slug] of casadasHab) {
    const h = habPorSlug.get(slug);
    const valores = {
      A: h.nivel, B: h.area, C: h.nome, D: h.evidencia, E: h.onde_estudar,
      F: mesesDoPlano(h.mes_inicio, h.mes_fim), G: h.hoje, H: h.meta, J: h.status, K: h.slug,
    };
    for (const [coluna, valor] of Object.entries(valores)) definir("Habilidades", `${coluna}${n}`, valor);
  }

  // Cursos: externos (da API) e os que viraram módulo (meses e status vêm do módulo).
  const cursos = abas.Cursos;
  const cursoPorSlug = new Map(dados.cursos.map((c) => [c.slug, c]));
  const moduloPorId = new Map(dados.modulos.map((m) => [`${PREFIXO_MODULO}${m.slug}`, m]));
  const linhasCursos = linhasDeDados(2, (n) => {
    const nome = cursos.get(`A${n}`)?.valor;
    return !vazio(nome) && !String(nome).startsWith("Total");
  });
  const idPorNome = new Map([
    ...dados.cursos.map((c) => [c.nome, c.slug]),
    ...Object.entries(CURSOS_QUE_VIRARAM_MODULO).map(([nome, slug]) => [nome, `${PREFIXO_MODULO}${slug}`]),
  ]);
  const casadasCursos = casarLinhas("Cursos", cursos, linhasCursos, "A", idPorNome,
    new Set([...cursoPorSlug.keys(), ...moduloPorId.keys()]));
  const cursosSemLinha = dados.cursos.filter((c) => ![...casadasCursos.values()].includes(c.slug));
  if (cursosSemLinha.length) {
    throw new Error(`Cursos sem linha na planilha: ${cursosSemLinha.map((c) => c.slug).join(", ")}. `
      + "Crie a linha (copiando uma existente, para levar a fórmula de Total) e ponha o id na coluna O.");
  }
  definir("Cursos", "O1", TITULO_ID);
  for (const [n, id] of casadasCursos) {
    const curso = cursoPorSlug.get(id);
    if (curso) {
      for (const [coluna, valor] of Object.entries({
        E: curso.mes_inicio, F: curso.mes_fim, G: curso.prioridade, M: curso.status, O: id,
      })) definir("Cursos", `${coluna}${n}`, valor);
    } else {
      const m = moduloPorId.get(id);
      // A prioridade (G) de um tema que virou módulo continua sendo da planilha: a trilha não tem prioridade.
      for (const [coluna, valor] of Object.entries({
        E: m.mes_inicio, F: m.mes_fim, M: m.atrasado ? "Atrasado" : m.status, O: id,
      })) definir("Cursos", `${coluna}${n}`, valor);
    }
  }

  const alteracoes = [];
  const avisos = [];
  for (const { aba, celula, valor } of desejado) {
    const atual = abas[aba].get(celula);
    if (atual?.formula) throw new Error(`${aba}!${celula} tem fórmula: a planilha mudou de formato, não vou sobrescrever.`);
    const antes = atual?.valor ?? null;
    if (iguais(antes, valor)) continue;
    if (!vazio(antes) && vazio(valor)) {
      avisos.push(`${aba}!${celula}: "${antes}" vai ser apagado (na API está vazio). Se o valor da planilha é o certo, registre no painel antes de gravar.`);
    }
    alteracoes.push({ aba, celula, antes, depois: valor });
  }

  // O carimbo só entra quando há outra mudança, para "nada a atualizar" continuar sendo nada.
  if (alteracoes.length) {
    const [ano, mes, dia] = hoje.split("-");
    const carimbo = `Colunas A–H, J e K vêm da API estudos-api (npm run planilha): edite pelo painel. Atualizado em ${dia}/${mes}/${ano}.`;
    const antes = habilidades.get("A3")?.valor ?? null;
    if (!iguais(antes, carimbo)) alteracoes.push({ aba: "Habilidades", celula: "A3", antes, depois: carimbo });
  }
  return { alteracoes, avisos };
}
