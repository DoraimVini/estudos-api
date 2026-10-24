import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import { openDatabase } from "../src/db/database.js";
import { HABILIDADES, CURSOS, sincronizarHabilidades } from "../src/db/habilidades-cursos.js";
import { criarRepositorios } from "../src/repositories/index.js";
import { abrir, conferir, definirCelula, gravar, lerAba, referencia } from "../src/planilha/xlsx.js";
import { calcularAlteracoes, dataDoExcel, mesesDoPlano } from "../src/planilha/alteracoes.js";
import { atualizarPlanilha, dadosDaApi, fazerBackup } from "../src/planilha/atualizar.js";

// A planilha real tem dados pessoais e nunca entra no repositório. Estes testes montam uma
// planilha sintética com o mesmo layout: abas, cabeçalhos, fórmulas, validação e linha de total.

// 15/02/2027 = mês 4 do plano: módulos dos meses 1–3 não concluídos estão atrasados.
const AGORA = new Date("2027-02-15T12:00:00Z");
const HOJE = "2027-02-15";
const INICIO_EXCEL = 46327; // 01/11/2026 como o Excel guarda datas

const MODULOS_NA_PLANILHA = [
  "Git e GitHub avançado", "TypeScript", "SQL / PostgreSQL", "CS50",
  "React / Next.js", "Testes automatizados", "Docker + deploy", "CI/CD (GitHub Actions)",
];

const texto = (valor, s = 1) => ({ texto: valor, s });
const numero = (valor, s = 2) => ({ numero: valor, s });
const formula = (f, s = 2) => ({ formula: f, s });
const vazia = (s = 4) => ({ s });

/** Planilha sintética como objeto { aba: { "A1": célula } }; os testes alteram antes de serializar. */
function modeloPadrao() {
  const premissas = { A3: texto("Data de início do plano"), B3: numero(INICIO_EXCEL) };

  const cronograma = { A1: texto("Nº"), B1: texto("Mês"), D1: texto("Estudos"), I1: texto("Status") };
  for (let mes = 1; mes <= 36; mes++) {
    const n = mes + 1;
    Object.assign(cronograma, {
      [`A${n}`]: numero(mes), [`B${n}`]: formula(`EDATE(Premissas!$B$3,A${n}-1)`),
      [`D${n}`]: texto(`Plano antigo do mês ${mes}`), [`I${n}`]: texto("Não iniciado"),
    });
  }

  const cabecalhosHab = ["Nível", "Área", "Habilidade", "Como provar (evidência)", "Onde estudar",
    "Meses do plano", "Hoje (1–5)", "Meta (1–5)", "Falta", "Status"];
  const habilidades = { A1: texto("Rota de habilidades"), A2: texto("Preencha 'Hoje' de 1 a 5.", 3) };
  cabecalhosHab.forEach((t, i) => { habilidades[`${"ABCDEFGHIJ"[i]}4`] = texto(t, 5); });
  HABILIDADES.forEach((h, i) => {
    const n = i + 5;
    Object.assign(habilidades, {
      [`A${n}`]: texto(h.nivel), [`B${n}`]: texto(h.area), [`C${n}`]: texto(h.nome),
      [`D${n}`]: texto(h.evidencia ?? ""), [`E${n}`]: texto(h.onde_estudar ?? ""),
      [`F${n}`]: texto(mesesDoPlano(h.mes_inicio, h.mes_fim)), [`G${n}`]: vazia(), [`H${n}`]: numero(h.inicial.meta, 4),
      [`I${n}`]: formula(`IF(G${n}="","",MAX(0,H${n}-G${n}))`), [`J${n}`]: texto("Não iniciado"),
    });
  });
  habilidades.A34 = texto("Resumo por nível");
  habilidades.B35 = formula('COUNTIF($A$5:$A$32,"Júnior")');

  const cabecalhosCursos = { A: "Curso / estudo", E: "Mês início", F: "Mês fim", G: "Prioridade", L: "Total (R$)", M: "Status", N: "Fonte / observação" };
  const cursos = Object.fromEntries(Object.entries(cabecalhosCursos).map(([c, t]) => [`${c}1`, texto(t, 5)]));
  const linhasCursos = [
    { nome: CURSOS[0].nome, e: 1, f: 12, g: "Alta", m: "Em andamento" },
    ...MODULOS_NA_PLANILHA.map((nome, i) => ({ nome, e: i + 1, f: i + 1, g: "Alta", m: "Não iniciado" })),
    ...CURSOS.slice(1).map((c) => ({ nome: c.nome, e: c.mes_inicio, f: c.mes_fim, g: c.inicial.prioridade, m: c.inicial.status })),
  ];
  linhasCursos.forEach((c, i) => {
    const n = i + 2;
    Object.assign(cursos, {
      [`A${n}`]: texto(c.nome), [`E${n}`]: numero(c.e), [`F${n}`]: numero(c.f), [`G${n}`]: texto(c.g),
      [`H${n}`]: vazia(), [`L${n}`]: formula(`N(H${n})*2`), [`M${n}`]: texto(c.m), [`N${n}`]: texto("Custo US$100 (confirmar)"),
    });
  });
  const total = linhasCursos.length + 2;
  cursos[`A${total}`] = texto("Total (inclui opcional)");
  cursos[`L${total}`] = formula(`SUM(L2:L${total - 1})`);

  const orcamento = { A1: texto("Orçamento"), B2: formula(`Cursos!L${total}`) };
  return { Premissas: premissas, Cronograma: cronograma, Habilidades: habilidades, Cursos: cursos, "Orçamento": orcamento };
}

const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Serializa o modelo num .xlsx: textos no sharedStrings.xml, como o Excel faz. */
function montarXlsx(modelo) {
  const compartilhados = [];
  const indice = (t) => (compartilhados.includes(t) ? compartilhados : compartilhados.push(t) && compartilhados).indexOf(t);

  const xmlDaAba = (celulas) => {
    const linhas = new Map();
    for (const [ref, c] of Object.entries(celulas)) {
      const { linha } = referencia(ref);
      if (!linhas.has(linha)) linhas.set(linha, []);
      linhas.get(linha).push([ref, c]);
    }
    const dados = [...linhas.keys()].sort((a, b) => a - b).map((n) => {
      const cs = linhas.get(n).sort(([a], [b]) => referencia(a).numColuna - referencia(b).numColuna).map(([ref, c]) => {
        if (c.texto !== undefined) return `<c r="${ref}" s="${c.s}" t="s"><v>${indice(c.texto)}</v></c>`;
        if (c.numero !== undefined) return `<c r="${ref}" s="${c.s}" t="n"><v>${c.numero}</v></c>`;
        if (c.formula !== undefined) return `<c r="${ref}" s="${c.s}" t="str"><f>${escapar(c.formula)}</f><v></v></c>`;
        return `<c r="${ref}" s="${c.s}"/>`;
      });
      return `<row r="${n}" ht="15">${cs.join("")}</row>`;
    });
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
      + '<dimension ref="A1:N40"/><cols><col min="1" max="1" width="20" customWidth="true"/></cols>'
      + `<sheetData>${dados.join("")}</sheetData>`
      + '<dataValidations count="1"><dataValidation type="list" sqref="J5:J32"><formula1>"Não iniciado,Concluído"</formula1></dataValidation></dataValidations>'
      + "</worksheet>";
  };

  // Os arquivos das abas ficam fora de ordem de propósito: o nome da aba é achado pelo .rels.
  const nomes = Object.keys(modelo).reverse();
  const arquivos = {};
  nomes.forEach((aba, i) => { arquivos[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(xmlDaAba(modelo[aba])); });
  const ordem = Object.keys(modelo);
  arquivos["xl/workbook.xml"] = strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
    + ordem.map((aba, i) => `<sheet name="${aba}" sheetId="${i + 1}" r:id="rId${nomes.indexOf(aba) + 1}"/>`).join("")
    + '</sheets><calcPr iterateCount="100"/></workbook>');
  arquivos["xl/_rels/workbook.xml.rels"] = strToU8('<?xml version="1.0" encoding="UTF-8"?>'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + nomes.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
    + "</Relationships>");
  arquivos["xl/sharedStrings.xml"] = strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${compartilhados.map((t) => `<si><t xml:space="preserve">${escapar(t)}</t></si>`).join("")}</sst>`);
  arquivos["xl/styles.xml"] = strToU8("<styleSheet/>");
  return zipSync(arquivos);
}

let db;
let repos;
let pasta;
let caminho;

beforeEach(() => {
  db = openDatabase(":memory:");
  repos = criarRepositorios(db);
  pasta = mkdtempSync(join(tmpdir(), "estudos-planilha-"));
  caminho = join(pasta, "Plano.xlsx");
});

afterEach(() => rmSync(pasta, { recursive: true, force: true }));

const dados = () => dadosDaApi(repos, AGORA);
const abasDe = (bytes) => {
  const p = abrir(bytes);
  return Object.fromEntries(["Premissas", "Cronograma", "Habilidades", "Cursos"].map((a) => [a, lerAba(p, a)]));
};
const calcular = (modelo) => calcularAlteracoes(abasDe(montarXlsx(modelo)), dados(), { hoje: HOJE });
const mudou = (alteracoes, aba, celula) => alteracoes.find((a) => a.aba === aba && a.celula === celula)?.depois;

describe("xlsx: leitura e edição cirúrgica", () => {
  it("lê textos compartilhados, números e fórmulas, achando a aba pelo nome", () => {
    const cursos = lerAba(abrir(montarXlsx(modeloPadrao())), "Cursos");
    expect(cursos.get("A2")).toEqual({ valor: "Curso.dev", formula: false, estilo: "1" });
    expect(cursos.get("E2")).toMatchObject({ valor: 1, formula: false });
    expect(cursos.get("L2")).toMatchObject({ formula: true });
    expect(() => lerAba(abrir(montarXlsx(modeloPadrao())), "Visto")).toThrow(/não tem a aba "Visto"/);
  });

  it("troca o valor mantendo o estilo e grava texto literalmente (inclusive $ e <)", () => {
    const xml = '<sheetData><row r="2"><c r="A2" s="7" t="s"><v>0</v></c><c r="B2" s="8"/></row></sheetData>';
    const novo = definirCelula(xml, "A2", 'US$& <custo> "único"');
    expect(novo).toContain('<c r="A2" s="7" t="inlineStr"><is><t xml:space="preserve">US$&amp; &lt;custo&gt; &quot;único&quot;</t></is></c><c r="B2" s="8"/>');
    expect(definirCelula(xml, "B2", 4)).toContain('<c r="B2" s="8" t="n"><v>4</v></c>');
  });

  it("célula nova herda o estilo da vizinha; linha nova entra na ordem certa", () => {
    const xml = '<sheetData><row r="2"><c r="A2" s="3"/></row><row r="4"><c r="A4" s="5"/><c r="J4" s="7"/></row></sheetData>';
    expect(definirCelula(xml, "K4", "id")).toContain('<c r="J4" s="7"/><c r="K4" s="7" t="inlineStr">');
    // A3 não existe: a linha 3 é criada entre a 2 e a 4, com o estilo de A2 (a célula de cima).
    expect(definirCelula(xml, "A3", "carimbo")).toMatch(/<row r="2">.*<\/row><row r="3"><c r="A3" s="3" t="inlineStr">.*<\/row><row r="4">/);
  });

  it("nunca sobrescreve fórmula", () => {
    const xml = '<sheetData><row r="5"><c r="I5" s="2" t="str"><f>H5-G5</f><v></v></c></row></sheetData>';
    expect(() => definirCelula(xml, "I5", 1)).toThrow(/I5 tem fórmula/);
  });

  it("gravar muda só as células pedidas; a conferência acusa qualquer outra mudança", () => {
    const original = montarXlsx(modeloPadrao());
    const pedidas = [{ aba: "Habilidades", celula: "G5", depois: 3 }, { aba: "Habilidades", celula: "K4", depois: "id (API)" }];
    const novo = gravar(abrir(original), pedidas.map((a) => ({ ...a, valor: a.depois })));
    expect(conferir(original, novo, pedidas)).toEqual([]);

    // Fora a aba editada e o pedido de recálculo, todo arquivo interno continua byte a byte igual.
    const arquivos = unzipSync(novo);
    const abaEditada = abrir(original).abas.get("Habilidades");
    for (const [nome, bytes] of Object.entries(unzipSync(original))) {
      if (nome !== abaEditada && nome !== "xl/workbook.xml") expect(arquivos[nome], nome).toEqual(bytes);
    }
    expect(strFromU8(arquivos["xl/workbook.xml"])).toContain('<calcPr fullCalcOnLoad="1" iterateCount="100"/>');

    // Mudança extra na mesma aba: acusada célula a célula. Em outra aba: acusada pelo arquivo inteiro.
    const mesmaAba = gravar(abrir(original), [{ aba: "Habilidades", celula: "G5", valor: 3 }, { aba: "Habilidades", celula: "D5", valor: "x" }]);
    expect(conferir(original, mesmaAba, pedidas.slice(0, 1))).toEqual(["Habilidades!D5: mudou e não estava na lista"]);
    const outraAba = gravar(abrir(original), [{ aba: "Habilidades", celula: "G5", valor: 3 }, { aba: "Cursos", celula: "N2", valor: "x" }]);
    expect(conferir(original, outraAba, pedidas.slice(0, 1))).toEqual([`${abrir(original).abas.get("Cursos")}: mudou e não devia`]);
  });

  it("converte a data guardada pelo Excel", () => {
    expect(dataDoExcel(INICIO_EXCEL)).toBe("2026-11-01");
    expect(dataDoExcel("2026-11-01T00:00:00")).toBe("2026-11-01");
  });
});

describe("calcularAlteracoes (API -> planilha)", () => {
  it("primeira vez: preenche os ids pelo nome e escreve as colunas de estudo", () => {
    const { alteracoes, avisos } = calcular(modeloPadrao());

    expect(mudou(alteracoes, "Habilidades", "K4")).toBe("id (API)");
    expect(mudou(alteracoes, "Habilidades", "K5")).toBe(HABILIDADES[0].slug);
    expect(mudou(alteracoes, "Cursos", "O1")).toBe("id (API)");
    expect(mudou(alteracoes, "Cursos", "O3")).toBe("modulo:git");
    expect(mudou(alteracoes, "Habilidades", "A3")).toMatch(/vêm da API.*Atualizado em 15\/02\/2027/);
    // Mês 3 = HTML/CSS (1–6) + SQL (3); o Curso.dev (1–12) aparece em todo mês da janela dele.
    expect(mudou(alteracoes, "Cronograma", "D4")).toBe("Curso.dev + HTML, CSS e acessibilidade + SQL e PostgreSQL.");
    expect(alteracoes.some((a) => a.aba === "Cronograma" && referencia(a.celula).linha > 13)).toBe(false);
    expect(avisos).toEqual([]);
  });

  it("tema que virou módulo: meses e status vêm do módulo, inclusive Atrasado; a prioridade fica", () => {
    const { alteracoes } = calcular(modeloPadrao());
    // Linha 3 = Git (módulo do mês 1, nada concluído, estamos no mês 4); linha 4 = TypeScript (mês 4).
    expect(mudou(alteracoes, "Cursos", "M3")).toBe("Atrasado");
    expect(mudou(alteracoes, "Cursos", "E4")).toBe(4);
    expect(mudou(alteracoes, "Cursos", "M4")).toBeUndefined(); // "Não iniciado" nos dois lados
    expect(alteracoes.some((a) => a.aba === "Cursos" && a.celula.startsWith("G") && referencia(a.celula).linha <= 10)).toBe(false);
  });

  it("autoavaliação e status vêm da API e avisam quando algo da planilha vai ser apagado", () => {
    db.prepare("UPDATE skills SET hoje = 2, status = 'Em andamento' WHERE slug = 'git-github'").run();
    const modelo = modeloPadrao();
    modelo.Habilidades.G5 = numero(3, 4); // "Hoje" preenchido só na planilha

    const { alteracoes, avisos } = calcular(modelo);
    const linhaGit = HABILIDADES.findIndex((h) => h.slug === "git-github") + 5;
    expect(mudou(alteracoes, "Habilidades", `G${linhaGit}`)).toBe(2);
    expect(mudou(alteracoes, "Habilidades", `J${linhaGit}`)).toBe("Em andamento");
    expect(alteracoes.find((a) => a.celula === "G5")).toMatchObject({ antes: 3, depois: null });
    expect(avisos).toEqual([expect.stringMatching(/^Habilidades!G5: "3" vai ser apagado/)]);
  });

  it("recusa planilha com outra data de início, cabeçalho mudado ou linha desconhecida", () => {
    const outraData = modeloPadrao();
    outraData.Premissas.B3 = numero(INICIO_EXCEL + 30);
    expect(() => calcular(outraData)).toThrow(/data de início difere: planilha .* = 2026-12-01, API = 2026-11-01/);

    const colunaNova = modeloPadrao();
    colunaNova.Habilidades.J4 = texto("Situação", 5);
    expect(() => calcular(colunaNova)).toThrow(/esperava "Status" em J4, encontrei "Situação"/);

    const inventada = modeloPadrao();
    inventada.Habilidades.C6 = texto("Habilidade que só existe na planilha");
    expect(() => calcular(inventada)).toThrow(/linha 6: "Habilidade que só existe na planilha" não existe na API/);

    const semLinha = modeloPadrao();
    for (const c of "ABCDEFGHIJ") delete semLinha.Habilidades[`${c}32`];
    expect(() => calcular(semLinha)).toThrow(/Habilidades sem linha na planilha: stakeholders/);
  });
});

describe("atualizarPlanilha (arquivo, backup e trava)", () => {
  it("simulação não toca no arquivo", () => {
    const bytes = montarXlsx(modeloPadrao());
    writeFileSync(caminho, bytes);
    const r = atualizarPlanilha(caminho, dados(), { hoje: HOJE });
    expect(r.gravou).toBe(false);
    expect(r.alteracoes.length).toBeGreaterThan(0);
    expect(readFileSync(caminho).equals(Buffer.from(bytes))).toBe(true);
    expect(existsSync(join(pasta, "backups-planilha"))).toBe(false);
  });

  it("grava com backup; rodar de novo não muda nada; renomear na API acha a linha pelo id", () => {
    const bytes = montarXlsx(modeloPadrao());
    writeFileSync(caminho, bytes);
    const r = atualizarPlanilha(caminho, dados(), { gravar: true, hoje: HOJE, agora: AGORA });
    expect(r.gravou).toBe(true);
    expect(readFileSync(r.backup).equals(Buffer.from(bytes))).toBe(true);
    expect(lerAba(abrir(readFileSync(caminho)), "Habilidades").get("K5").valor).toBe(HABILIDADES[0].slug);

    expect(atualizarPlanilha(caminho, dados(), { gravar: true, hoje: "2027-02-16" }).alteracoes).toEqual([]);

    const renomeadas = structuredClone(HABILIDADES);
    renomeadas[0].nome = "Lógica e estruturas de dados";
    sincronizarHabilidades(db, renomeadas);
    const { alteracoes } = atualizarPlanilha(caminho, dados(), { gravar: true, hoje: "2027-02-16" });
    expect(alteracoes.map((a) => `${a.celula}=${a.depois}`)).toEqual([
      "C5=Lógica e estruturas de dados",
      "A3=Colunas A–H, J e K vêm da API estudos-api (npm run planilha): edite pelo painel. Atualizado em 16/02/2027.",
    ]);
  });

  it("recusa gravar com a planilha aberta no Excel", () => {
    writeFileSync(caminho, montarXlsx(modeloPadrao()));
    writeFileSync(join(pasta, "~$Plano.xlsx"), "");
    expect(() => atualizarPlanilha(caminho, dados(), { gravar: true, hoje: HOJE })).toThrow(/aberta no Excel/);
    expect(atualizarPlanilha(caminho, dados(), { hoje: HOJE }).gravou).toBe(false); // simular pode
  });

  it("guarda só os backups mais recentes", () => {
    for (let dia = 10; dia <= 13; dia++) {
      fazerBackup(caminho, Buffer.from(`v${dia}`), new Date(`2027-02-${dia}T15:00:00Z`), 2);
    }
    expect(readdirSync(join(pasta, "backups-planilha"))).toEqual([
      "Plano_2027-02-12_12-00-00.xlsx", "Plano_2027-02-13_12-00-00.xlsx",
    ]);
  });
});
