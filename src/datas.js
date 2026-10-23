// Datas "de calendário" (AAAA-MM-DD) sempre no fuso de quem estuda.
// toISOString() usa UTC: às 22h no Rio ele já devolve o dia seguinte.
export const FUSO = "America/Sao_Paulo";

const formatoISO = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }); // en-CA formata como AAAA-MM-DD

/** Dia de hoje em São Paulo, no formato AAAA-MM-DD. */
export function hojeISO(agora = new Date()) {
  return formatoISO.format(agora);
}

/** Soma (ou subtrai) dias de uma data AAAA-MM-DD. */
export function somarDias(iso, dias) {
  const data = new Date(`${iso}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}
