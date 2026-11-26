// Formato das linhas que saem do banco. Espelham as tabelas das migrações (src/db/migrations/).
// O SQLite devolve INTEGER como number e TEXT como string; coluna sem NOT NULL pode vir null.
// Se uma migração nova mudar uma tabela, atualize o tipo aqui junto.

export interface Skill {
  id: number;
  slug: string | null;
  nivel: string;
  area: string;
  nome: string;
  evidencia: string | null;
  onde_estudar: string | null;
  mes_inicio: number | null;
  mes_fim: number | null;
  hoje: number | null;
  meta: number;
  status: string;
}

export interface Course {
  id: number;
  slug: string | null;
  nome: string;
  plataforma: string | null;
  conteudo: string | null;
  motivo: string | null;
  mes_inicio: number | null;
  mes_fim: number | null;
  prioridade: string;
  status: string;
}

export interface Session {
  id: number;
  skill_id: number | null;
  course_id: number | null;
  topico_id: number | null;
  data: string;
  minutos: number;
  notas: string | null;
  criado_em: string;
}

export interface Modulo {
  id: number;
  slug: string | null;
  nome: string;
  fase: number;
  mes_inicio: number;
  mes_fim: number;
  objetivo: string;
  mini_projeto: string | null;
  pronto_quando: string | null;
  skill_id: number | null;
}

/** Módulo com a contagem de tópicos (consulta de listarModulos/buscarModulo). */
export interface ModuloComContagem extends Modulo {
  skill_nome: string | null;
  total_topicos: number;
  concluidos: number;
  em_andamento: number;
}

export interface Topico {
  id: number;
  modulo_id: number;
  slug: string | null;
  ordem: number;
  nome: string;
  descricao: string | null;
  status: string;
  concluido_em: string | null;
}

/** Tópico com o nome e o slug do módulo e a habilidade ligada (buscarTopico). */
export interface TopicoDetalhado extends Topico {
  modulo_nome: string;
  modulo_slug: string | null;
  skill_id: number | null;
}

export interface Recurso {
  id: number;
  modulo_id: number;
  ordem: number;
  titulo: string;
  url: string;
  tipo: string;
}

export interface Exercicio {
  id: number;
  slug: string;
  modulo_id: number;
  topico_id: number | null;
  ordem: number;
  titulo: string;
  status: string;
  tentativas: number;
  resolvido_em: string | null;
}

/** Exercício com os nomes do módulo e do tópico (consultas do repositório). */
export interface ExercicioComNomes extends Exercicio {
  modulo_nome: string;
  topico_nome: string | null;
}

// Formato dos arquivos JSON do repositório (definições que o banco sincroniza ao abrir).

/** src/db/trilha.json */
export interface TrilhaArquivo {
  plano_inicio: string;
  intro: string;
  fases: Record<string, string>;
  depois: string;
  continuo: string[];
  modulos: ModuloArquivo[];
}

export interface ModuloArquivo {
  id: number;
  slug: string;
  nome: string;
  fase: number;
  mes_inicio: number;
  mes_fim: number;
  skill?: string;
  objetivo: string;
  topicos: { slug: string; nome: string; descricao?: string }[];
  recursos: { titulo: string; url: string; tipo: string }[];
  mini_projeto?: string;
  pronto_quando?: string;
}

/** Item de habilidades.json ou cursos.json: campos de definição + valores iniciais. */
export interface ItemArquivo {
  slug: string;
  nome: string;
  inicial?: Record<string, string | number | null>;
  [campo: string]: unknown;
}

/** Item de exercicios/catalogo.json */
export interface ExercicioArquivo {
  slug: string;
  topico: string;
  titulo: string;
}
