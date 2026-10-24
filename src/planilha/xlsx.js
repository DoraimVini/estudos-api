// Leitura e edição cirúrgica de um .xlsx, sem regravar a planilha inteira.
// Um .xlsx é um zip de arquivos XML. Cada aba é um xl/worksheets/sheetN.xml, e cada célula é
// <c r="G6" s="20">...</c>, onde s aponta para o estilo (cor, borda, formato). Aqui só se troca o
// conteúdo das células pedidas, mantendo o s; todo o resto do arquivo continua byte a byte igual.
// (Bibliotecas que leem e regravam tudo, como a exceljs, perdiam larguras e validações desta planilha.)
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";

const ENTIDADES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

const decodificar = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (inteira, e) => {
  if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
  return ENTIDADES[e] ?? inteira;
});

const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Atributos de uma tag: ' r="A1" s="3"' -> { r: "A1", s: "3" } */
function atributos(texto) {
  return Object.fromEntries([...texto.matchAll(/([\w:]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]));
}

/** Texto de um <si> ou <is>: junta todos os <t> (texto com formatação vem em pedaços). */
const textoDosT = (xml) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => decodificar(m[1])).join("");

/** "AB12" -> { coluna: "AB", numColuna: 28, linha: 12 } */
export function referencia(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) throw new Error(`Referência de célula inválida: ${ref}`);
  const numColuna = [...m[1]].reduce((n, letra) => n * 26 + letra.charCodeAt(0) - 64, 0);
  return { coluna: m[1], numColuna, linha: Number(m[2]) };
}

/**
 * Abre o .xlsx (bytes) e descobre qual arquivo é cada aba pelo nome.
 * @returns {{ arquivos: Record<string, Uint8Array>, abas: Map<string, string>, compartilhados: string[] }}
 */
export function abrir(bytes) {
  const arquivos = unzipSync(bytes);
  const texto = (caminho) => {
    if (!arquivos[caminho]) throw new Error(`O arquivo não parece uma planilha do Excel (falta ${caminho}).`);
    return strFromU8(arquivos[caminho]);
  };

  // workbook.xml diz o nome e o r:id de cada aba; o .rels diz qual arquivo é cada r:id.
  const destinos = new Map([...texto("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b([^>]*)\/?>/g)]
    .map(([, a]) => atributos(a))
    .map((r) => [r.Id, r.Target.startsWith("/") ? r.Target.slice(1) : `xl/${r.Target}`]));
  const abas = new Map([...texto("xl/workbook.xml").matchAll(/<sheet\b([^>]*)\/>/g)]
    .map(([, a]) => atributos(a))
    .map((s) => [decodificar(s.name), destinos.get(s["r:id"])]));

  // Textos repetidos ficam em sharedStrings.xml e a célula guarda só o índice (t="s").
  const compartilhados = arquivos["xl/sharedStrings.xml"]
    ? [...texto("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map(([, si]) => textoDosT(si))
    : [];
  return { arquivos, abas, compartilhados };
}

function caminhoDaAba(planilha, aba) {
  const caminho = planilha.abas.get(aba);
  if (!caminho) throw new Error(`A planilha não tem a aba "${aba}".`);
  return caminho;
}

const CELULA = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;

/** Valor de uma célula a partir do XML dela. Fórmula vale o resultado guardado. */
function valorDaCelula(attrs, interno = "", compartilhados) {
  const v = /<v>([\s\S]*?)<\/v>/.exec(interno)?.[1];
  switch (attrs.t) {
    case "s": return compartilhados[Number(v)] ?? null;
    case "inlineStr": return textoDosT(interno);
    case "str": case "e": return v === undefined ? null : decodificar(v);
    case "b": return v === "1";
    default: return v === undefined || v === "" ? null : Number(v);
  }
}

/**
 * Todas as células de uma aba.
 * @returns {Map<string, { valor: string|number|boolean|null, formula: boolean, estilo: string|undefined }>}
 */
export function lerAba(planilha, aba) {
  const xml = strFromU8(planilha.arquivos[caminhoDaAba(planilha, aba)]);
  const dados = /<sheetData>([\s\S]*?)<\/sheetData>/.exec(xml)?.[1] ?? "";
  const celulas = new Map();
  for (const [, a, interno] of dados.matchAll(CELULA)) {
    const attrs = atributos(a);
    celulas.set(attrs.r, {
      valor: valorDaCelula(attrs, interno, planilha.compartilhados),
      formula: /<f[\s>/]/.test(interno ?? ""),
      estilo: attrs.s,
    });
  }
  return celulas;
}

/** XML da aba sem as partes que a gravação pode mudar: células, tamanho e larguras. */
const resto = (xml) => xml
  .replace(/<sheetData>[\s\S]*<\/sheetData>/, "")
  .replace(/<dimension\b[^>]*\/>/, "")
  .replace(/<cols>[\s\S]*?<\/cols>/, "");

/**
 * Compara a planilha original com a gravada e lista tudo que mudou além do pedido.
 * Lista vazia = só as células pedidas mudaram (o resto está igual byte a byte ou célula a célula).
 * @returns {string[]} problemas
 */
export function conferir(bytesOriginais, bytesNovos, alteracoes) {
  const original = abrir(bytesOriginais);
  const novo = abrir(bytesNovos);
  const problemas = [];
  const pedidas = new Map(alteracoes.map((a) => [`${a.aba}!${a.celula}`, a.depois]));
  const abasTocadas = new Set(alteracoes.map((a) => a.aba));
  const caminhosTocados = new Set([...abasTocadas].map((aba) => original.abas.get(aba)));

  const nomes = (p) => Object.keys(p.arquivos).sort().join("|");
  if (nomes(original) !== nomes(novo)) problemas.push("a lista de arquivos internos mudou");

  for (const [caminho, bytes] of Object.entries(original.arquivos)) {
    const outro = novo.arquivos[caminho];
    if (!outro) continue;
    if (caminhosTocados.has(caminho)) {
      if (resto(strFromU8(bytes)) !== resto(strFromU8(outro))) problemas.push(`${caminho}: mudou fora das células`);
    } else if (caminho === "xl/workbook.xml") {
      if (strFromU8(bytes) !== strFromU8(outro).replace(' fullCalcOnLoad="1"', "")
        && strFromU8(bytes) !== strFromU8(outro).replace('<calcPr fullCalcOnLoad="1"/>', "")) {
        problemas.push("xl/workbook.xml: mudou além do pedido de recálculo");
      }
    } else if (Buffer.compare(Buffer.from(bytes), Buffer.from(outro)) !== 0) {
      problemas.push(`${caminho}: mudou e não devia`);
    }
  }

  for (const aba of abasTocadas) {
    const antes = lerAba(original, aba);
    const depois = lerAba(novo, aba);
    for (const ref of new Set([...antes.keys(), ...depois.keys()])) {
      const a = antes.get(ref);
      const d = depois.get(ref);
      const chave = `${aba}!${ref}`;
      if (pedidas.has(chave)) {
        const esperado = pedidas.get(chave);
        if ((d?.valor ?? null) !== esperado) problemas.push(`${chave}: esperava "${esperado}", ficou "${d?.valor}"`);
        if (a && a.estilo !== d?.estilo) problemas.push(`${chave}: o estilo mudou`);
      } else if (!a || !d || a.valor !== d.valor || a.formula !== d.formula || a.estilo !== d.estilo) {
        problemas.push(`${chave}: mudou e não estava na lista`);
      }
    }
  }
  return problemas;
}

/** XML de uma célula com o valor novo. Texto vai inline (t="inlineStr"), sem mexer no sharedStrings.xml. */
function xmlDaCelula(ref, extras, valor) {
  const abre = `<c r="${ref}"${extras}`;
  if (valor === undefined) throw new Error(`Valor indefinido para a célula ${ref}.`);
  if (valor === null || valor === "") return `${abre}/>`;
  if (typeof valor === "number") return `${abre} t="n"><v>${valor}</v></c>`;
  return `${abre} t="inlineStr"><is><t xml:space="preserve">${escapar(String(valor))}</t></is></c>`;
}

/** Atributos que a célula mantém (estilo e outros), sem r e t, que são reescritos. */
const extrasDe = (attrs) => Object.entries(attrs)
  .filter(([k]) => k !== "r" && k !== "t")
  .map(([k, v]) => ` ${k}="${v}"`).join("");

/**
 * Grava `valor` na célula `ref` do XML de uma aba.
 * - Célula existente: troca só o conteúdo e mantém o estilo. Recusa se ela tiver fórmula.
 * - Célula nova: herda o estilo da vizinha à esquerda na mesma linha ou, se não houver, da célula
 *   de cima. A linha é criada se ainda não existir.
 */
export function definirCelula(xml, ref, valor) {
  const { numColuna, linha } = referencia(ref);
  const reLinha = new RegExp(`<row\\b[^>]*?\\br="${linha}"[^>]*?(?:/>|>[\\s\\S]*?</row>)`);
  const atual = reLinha.exec(xml)?.[0];

  if (atual === undefined) {
    const estilo = estiloAcima(xml, numColuna, linha);
    const novaLinha = `<row r="${linha}">${xmlDaCelula(ref, estilo, valor)}</row>`;
    // Insere antes da primeira linha de número maior (as linhas ficam em ordem) ou no fim.
    const depois = [...xml.matchAll(/<row\b([^>]*)>/g)].find(([, a]) => Number(atributos(a).r) > linha);
    if (depois) return xml.slice(0, depois.index) + novaLinha + xml.slice(depois.index);
    if (!xml.includes("</sheetData>")) throw new Error("Aba sem <sheetData>: não sei onde criar a linha.");
    return xml.replace("</sheetData>", () => `${novaLinha}</sheetData>`);
  }

  const abertura = /^<row\b[^>]*?(?=\/?>)/.exec(atual)[0];
  const celulas = [...(atual.endsWith("/>") ? "" : atual.slice(abertura.length + 1, -"</row>".length)).matchAll(CELULA)]
    .map(([texto, a, interno]) => ({ texto, attrs: atributos(a), interno }));
  const existente = celulas.find((c) => c.attrs.r === ref);

  let novas;
  if (existente) {
    if (/<f[\s>/]/.test(existente.interno ?? "")) throw new Error(`A célula ${ref} tem fórmula: não vou sobrescrever.`);
    novas = celulas.map((c) => (c === existente ? xmlDaCelula(ref, extrasDe(c.attrs), valor) : c.texto));
  } else {
    const antes = celulas.filter((c) => referencia(c.attrs.r).numColuna < numColuna);
    const vizinha = antes.at(-1);
    const estilo = vizinha?.attrs.s ? ` s="${vizinha.attrs.s}"` : estiloAcima(xml, numColuna, linha);
    novas = [...antes.map((c) => c.texto), xmlDaCelula(ref, estilo, valor),
      ...celulas.slice(antes.length).map((c) => c.texto)];
  }
  // Substituição com função: com texto, "$&" ou "$1" num valor (ex.: "US$100") seriam interpretados.
  return xml.replace(atual, () => `${abertura}>${novas.join("")}</row>`);
}

/** Estilo da célula mais próxima acima, na mesma coluna (ou nenhum). */
function estiloAcima(xml, numColuna, linha) {
  let melhor;
  for (const [, a] of xml.matchAll(/<c\b([^>]*?)\/?>/g)) {
    const attrs = atributos(a);
    if (!attrs.r || !attrs.s) continue;
    const r = referencia(attrs.r);
    if (r.numColuna === numColuna && r.linha < linha && (!melhor || r.linha > melhor.linha)) melhor = { linha: r.linha, s: attrs.s };
  }
  return melhor ? ` s="${melhor.s}"` : "";
}

/** Amplia o <dimension ref="A1:J42"/> para incluir a célula (o Excel usa isso como dica do tamanho da aba). */
function ampliarDimensao(xml, ref) {
  return xml.replace(/<dimension ref="([A-Z]+\d+):([A-Z]+)(\d+)"\s*\/>/, (inteira, inicio, coluna, linha) => {
    const fim = referencia(`${coluna}${linha}`);
    const nova = referencia(ref);
    if (nova.numColuna <= fim.numColuna && nova.linha <= fim.linha) return inteira;
    const col = nova.numColuna > fim.numColuna ? nova.coluna : coluna;
    return `<dimension ref="${inicio}:${col}${Math.max(fim.linha, nova.linha)}"/>`;
  });
}

/** Dá largura a uma coluna que ainda não tem nenhuma definida (ex.: a coluna nova de id). */
export function definirLargura(xml, numColuna, largura) {
  const cols = [...xml.matchAll(/<col\b([^>]*)\/>/g)];
  if (cols.some(([, a]) => Number(atributos(a).min) <= numColuna && numColuna <= Number(atributos(a).max))) return xml;
  const col = `<col min="${numColuna}" max="${numColuna}" width="${largura}" customWidth="true"/>`;
  const depois = cols.find(([, a]) => Number(atributos(a).min) > numColuna);
  if (depois) return xml.slice(0, depois.index) + col + xml.slice(depois.index);
  if (xml.includes("</cols>")) return xml.replace("</cols>", () => `${col}</cols>`);
  return xml.replace(/<sheetData>/, () => `<cols>${col}</cols><sheetData>`);
}

/**
 * Aplica as alterações e devolve os bytes do novo .xlsx.
 * @param {{ aba: string, celula: string, valor: string|number|null }[]} alteracoes
 * @param {{ larguras?: { aba: string, coluna: number, largura: number }[] }} opcoes
 */
export function gravar(planilha, alteracoes, { larguras = [] } = {}) {
  const saida = { ...planilha.arquivos };
  const xmls = new Map();
  const xmlDa = (aba) => {
    const caminho = caminhoDaAba(planilha, aba);
    if (!xmls.has(caminho)) xmls.set(caminho, strFromU8(planilha.arquivos[caminho]));
    return caminho;
  };

  for (const { aba, celula, valor } of alteracoes) {
    const caminho = xmlDa(aba);
    xmls.set(caminho, ampliarDimensao(definirCelula(xmls.get(caminho), celula, valor), celula));
  }
  for (const { aba, coluna, largura } of larguras) {
    const caminho = xmlDa(aba);
    xmls.set(caminho, definirLargura(xmls.get(caminho), coluna, largura));
  }
  for (const [caminho, xml] of xmls) saida[caminho] = strToU8(xml);

  // As fórmulas (ex.: "Falta" = Meta - Hoje) guardam o último resultado; isto pede ao Excel para
  // recalcular tudo ao abrir, senão ele mostraria o valor antigo.
  const workbook = strFromU8(planilha.arquivos["xl/workbook.xml"]);
  if (!/<calcPr\b[^>]*fullCalcOnLoad=/.test(workbook)) {
    // Sem <calcPr>, ele entra logo depois de <definedNames> ou de <sheets> (a ordem dos elementos importa).
    const ancora = ["</definedNames>", "</externalReferences>", "</sheets>"].find((a) => workbook.includes(a));
    saida["xl/workbook.xml"] = strToU8(/<calcPr\b/.test(workbook)
      ? workbook.replace(/<calcPr\b/, () => '<calcPr fullCalcOnLoad="1"')
      : workbook.replace(ancora, () => `${ancora}<calcPr fullCalcOnLoad="1"/>`));
  }
  return zipSync(saida, { level: 6 });
}
