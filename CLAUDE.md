# estudos-api: contexto para o Claude Code

## Quem sou e para que serve este projeto
- Vini, Rio de Janeiro. Game dev (Unity/C#, Godot) migrando para dev full stack júnior.
- Este projeto é ao mesmo tempo ferramenta e treino: uma API que diz o que estudar agora,
  com base no meu plano de 3 anos (planilha `..\Plano_3_anos_Vini.xlsx`).
- Responda em português. Explique o porquê das mudanças: estou aprendendo.
- Nos exercícios do README, me oriente e revise; não escreva a solução inteira se eu não pedir.

## Stack e comandos
- Node.js >= 22.13 (usa `node:sqlite`, sem dependência nativa), Express 5, ESM.
- Testes: Vitest + Supertest (`test/api.test.js`). Rodar sempre antes de commitar.
- `npm install` · `npm run dev` · `npm test` · `npm run db:reset`
- Banco: `estudos.db` (SQLite, fora do Git). Dados iniciais em `src/db/seed.json`, exportados da planilha.

## Arquitetura
- `src/app.js` monta o app sem abrir porta (os testes usam banco `:memory:` e data congelada via `opcoes.agora`).
- Rotas em `src/routes/`; validação em `src/validators.js`; erros sempre no formato `{ erro, detalhes }`.
- Regra de prioridade em `src/services/plano.js` (`pontuarSkill`, `proximasPrioridades`). Plano começa em 01/11/2026 = mês 1.

## Convenções
- Nomes de domínio em português (skills/courses/sessions nas rotas por enquanto; campos em português).
- Cada mudança com teste. Commits pequenos e descritivos em português.
- Cada exercício do README numa branch própria com PR.

## Onde estou no plano (out/2026)
- Curso.dev (Filipe Deschamps) é a base; projeto do curso no repo `clone-tabnews`. Acesso ao curso em recuperação.
- Também fiz o curso de Lógica/Python da EV.G (repo `evg-logic-python`).
- Próximos passos de estudo: Git → JavaScript/TypeScript → SQL → Node/APIs (meses 1–6 do plano).
- Graduação: avaliando tecnólogo em ADS EAD (provas presenciais são o ponto crítico, porque devo me mudar para os EUA em 2028).
- Próximo exercício: exercício 1 do README (publicar no GitHub e passar a trabalhar com branches e PRs).
