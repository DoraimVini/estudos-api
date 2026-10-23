// Valores de domínio aceitos pela API (os mesmos das listas suspensas da planilha).
export const NIVEIS = ["Júnior", "Pleno", "Sênior"];
export const STATUS = ["Não iniciado", "Em andamento", "Concluído", "Atrasado", "N/A"];
export const PRIORIDADES = ["Alta", "Média", "Baixa"];
// Tópicos da trilha só têm três estados (o banco também restringe com CHECK).
export const STATUS_TOPICO = ["Não iniciado", "Em andamento", "Concluído"];
// Exercício só vira 'Resolvido' quando os testes passam (npm run exercicio).
export const STATUS_EXERCICIO = ["Pendente", "Resolvido"];
