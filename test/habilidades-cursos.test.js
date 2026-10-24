import { describe, it, expect, beforeEach } from "vitest";
import { openDatabase } from "../src/db/database.js";
import {
  HABILIDADES, CURSOS, sincronizarHabilidades, sincronizarCursos,
} from "../src/db/habilidades-cursos.js";
import { TRILHA, sincronizarTrilha } from "../src/db/trilha.js";

let db;

beforeEach(() => {
  db = openDatabase(":memory:");
});

const skill = (slug) => db.prepare("SELECT * FROM skills WHERE slug = ?").get(slug);
const curso = (slug) => db.prepare("SELECT * FROM courses WHERE slug = ?").get(slug);
const total = (tabela) => db.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get().n;

describe("habilidades.json e cursos.json (consistência)", () => {
  it("têm as 28 habilidades e os 8 cursos externos, com o valor inicial preenchido", () => {
    expect(HABILIDADES).toHaveLength(28);
    expect(CURSOS).toHaveLength(8);
    for (const h of HABILIDADES) expect(h.inicial.meta, h.slug).toBeGreaterThanOrEqual(1);
    for (const c of CURSOS) expect(c.inicial.status && c.inicial.prioridade, c.slug).toBeTruthy();
  });

  it("banco novo nasce na ordem dos arquivos, com slugs e a data de início da trilha", () => {
    // Os ids seguem a ordem do JSON: os testes e o painel contam com isso (ex.: skill 8 = Git).
    const slugs = db.prepare("SELECT slug FROM skills ORDER BY id").all().map((s) => s.slug);
    expect(slugs).toEqual(HABILIDADES.map((h) => h.slug));
    expect(skill("git-github").id).toBe(8);
    expect(curso("curso-dev")).toMatchObject({ status: "Em andamento", prioridade: "Alta" });
    expect(db.prepare("SELECT valor FROM config WHERE chave = 'plano_inicio'").get().valor)
      .toBe(TRILHA.plano_inicio);
  });
});

describe("sincronizarHabilidades e sincronizarCursos", () => {
  it("atualiza a definição sem perder a autoavaliação", () => {
    db.prepare("UPDATE skills SET hoje = 2, meta = 5, status = 'Em andamento' WHERE slug = 'sql-postgresql'").run();

    const habilidades = structuredClone(HABILIDADES);
    const sql = habilidades.find((h) => h.slug === "sql-postgresql");
    sql.nome = "SQL e PostgreSQL";
    sql.mes_fim = 4;
    sql.inicial.meta = 3; // "inicial" só vale ao criar: não pode sobrescrever a meta do painel
    sincronizarHabilidades(db, habilidades);

    expect(skill("sql-postgresql"))
      .toMatchObject({ id: 7, nome: "SQL e PostgreSQL", mes_fim: 4, hoje: 2, meta: 5, status: "Em andamento" });
  });

  it("atualiza o curso sem perder status e prioridade", () => {
    db.prepare("UPDATE courses SET status = 'Concluído', prioridade = 'Baixa' WHERE slug = 'aws-cloud-practitioner'").run();

    const cursos = structuredClone(CURSOS);
    cursos.find((c) => c.slug === "aws-cloud-practitioner").mes_inicio = 12;
    sincronizarCursos(db, cursos);

    expect(curso("aws-cloud-practitioner"))
      .toMatchObject({ mes_inicio: 12, status: "Concluído", prioridade: "Baixa" });
  });

  it("cria o que entrou com os valores iniciais e apaga o que saiu", () => {
    const sessao = db.prepare("INSERT INTO sessions (data, minutos, skill_id) VALUES ('2026-11-10', 25, ?)")
      .run(skill("stakeholders").id).lastInsertRowid;

    const habilidades = structuredClone(HABILIDADES).filter((h) => h.slug !== "stakeholders");
    habilidades.push({ slug: "ingles-tecnico", nivel: "Júnior", area: "Comunicação",
      nome: "Inglês técnico em entrevistas", mes_inicio: 13, mes_fim: 18, inicial: { meta: 4 } });
    sincronizarHabilidades(db, habilidades);

    expect(skill("stakeholders")).toBeUndefined();
    expect(skill("ingles-tecnico")).toMatchObject({ meta: 4, hoje: null, status: "Não iniciado", evidencia: null });
    expect(total("skills")).toBe(28);
    // A sessão continua existindo, só sem habilidade (ON DELETE SET NULL).
    expect(db.prepare("SELECT skill_id FROM sessions WHERE id = ?").get(sessao).skill_id).toBeNull();
  });

  it("banco anterior à migração 007 recebe os slugs pelo nome, sem perder o progresso", () => {
    // Estado de um banco antigo logo depois da migração 007: colunas criadas, slugs ainda vazios.
    db.exec("UPDATE skills SET slug = NULL; UPDATE courses SET slug = NULL");
    db.prepare("UPDATE skills SET hoje = 3, status = 'Em andamento' WHERE id = 8").run();
    db.prepare("UPDATE courses SET status = 'Concluído' WHERE nome = 'Curso.dev'").run();
    const cursoDev = db.prepare("SELECT id FROM courses WHERE nome = 'Curso.dev'").get().id;

    sincronizarHabilidades(db);
    sincronizarCursos(db);

    expect(skill("git-github")).toMatchObject({ id: 8, hoje: 3, status: "Em andamento" });
    expect(curso("curso-dev")).toMatchObject({ id: cursoDev, status: "Concluído" });
    expect(db.prepare("SELECT COUNT(*) AS n FROM skills WHERE slug IS NULL").get().n).toBe(0);
    expect(total("skills")).toBe(28);
    expect(total("courses")).toBe(8);
  });

  it("recusa slug repetido, slug inválido ou valor inicial faltando, sem alterar nada", () => {
    const repetido = structuredClone(HABILIDADES);
    repetido[1].slug = repetido[0].slug;
    repetido[0].nome = "Outro nome";
    expect(() => sincronizarHabilidades(db, repetido)).toThrow(/slug "logica-e-estruturas-de-dados" repetido/);
    expect(skill("logica-e-estruturas-de-dados").nome).toBe(HABILIDADES[0].nome);

    const invalido = structuredClone(CURSOS);
    invalido[0].slug = "Curso.dev";
    expect(() => sincronizarCursos(db, invalido)).toThrow(/Curso "Curso.dev": slug "Curso.dev" inválido/);

    const semInicial = structuredClone(CURSOS);
    delete semInicial[0].inicial.status;
    expect(() => sincronizarCursos(db, semInicial)).toThrow(/curso-dev: falta "inicial.status"/);
  });

  it("a trilha recusa data de início inválida", () => {
    const trilha = structuredClone(TRILHA);
    trilha.plano_inicio = "01/11/2026";
    expect(() => sincronizarTrilha(db, trilha)).toThrow(/plano_inicio "01\/11\/2026" inválido/);
  });
});
