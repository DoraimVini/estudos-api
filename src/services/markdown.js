const meses = (m) =>
  m.mes_inicio === m.mes_fim ? `mês ${m.mes_inicio}` : `meses ${m.mes_inicio}–${m.mes_fim}`;

function moduloEmMarkdown(m) {
  return [
    `### ${m.id}. ${m.nome} · ${meses(m)}`,
    "",
    `**Objetivo:** ${m.objetivo}`,
    "",
    "**Tópicos**",
    "",
    ...m.topicos.map((t, i) => `${i + 1}. **${t.nome}:** ${t.descricao}`),
    "",
    "**Recursos**",
    "",
    ...m.recursos.map((r) => `- [${r.titulo}](${r.url}) (${r.tipo})`),
    "",
    `**Mini-projeto:** ${m.mini_projeto}`,
    "",
    `**Pronto quando:** ${m.pronto_quando}`,
    "",
  ];
}

/** Gera o PLANO.md a partir da trilha. Função pura: o mesmo JSON sempre gera o mesmo texto. */
export function trilhaEmMarkdown(trilha) {
  const linhas = [
    "# Trilha de estudos",
    "",
    "> Gerado de `src/db/trilha.json` por `npm run plano`. Não edite à mão: edite o JSON e rode o script.",
    "",
    trilha.intro,
    "",
  ];

  for (const [fase, titulo] of Object.entries(trilha.fases)) {
    linhas.push(`## ${titulo}`, "");
    for (const m of trilha.modulos.filter((mod) => String(mod.fase) === fase)) {
      linhas.push(...moduloEmMarkdown(m));
    }
  }

  linhas.push("## Depois do mês 12", "", trilha.depois, "");
  linhas.push("## Contínuo", "", ...trilha.continuo.map((c) => `- ${c}`), "");
  return linhas.join("\n");
}
