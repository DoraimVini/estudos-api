// Valores de domínio aceitos pela API (os mesmos das listas suspensas da planilha).
// "as const" faz o TypeScript guardar os valores exatos, e não só "string[]".
export const NIVEIS = ["Júnior", "Pleno", "Sênior"] as const;
export const STATUS = ["Não iniciado", "Em andamento", "Concluído", "Atrasado", "N/A"] as const;
export const PRIORIDADES = ["Alta", "Média", "Baixa"] as const;
// Tópicos da trilha só têm três estados (o banco também restringe com CHECK).
export const STATUS_TOPICO = ["Não iniciado", "Em andamento", "Concluído"] as const;
// Exercício só vira 'Resolvido' quando os testes passam (npm run exercicio).
export const STATUS_EXERCICIO = ["Pendente", "Resolvido"] as const;

export type Nivel = (typeof NIVEIS)[number];
export type Status = (typeof STATUS)[number];
export type Prioridade = (typeof PRIORIDADES)[number];
export type StatusTopico = (typeof STATUS_TOPICO)[number];
export type StatusExercicio = (typeof STATUS_EXERCICIO)[number];
