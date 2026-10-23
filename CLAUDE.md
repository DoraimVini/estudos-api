# estudos-api: contexto para o Claude Code

## Quem sou e para que serve este projeto
- Vini, Rio de Janeiro. Game dev (Unity/C#, Godot) migrando para dev full stack júnior.
- Este projeto é ao mesmo tempo ferramenta e treino: uma base condensada de estudos para usar
  em paralelo ao Curso.dev, e uma API que diz o que estudar agora.
- O que estudar em cada mês está em `PLANO.md` (trilha de módulos). A planilha `..\Plano_3_anos_Vini.xlsx`
  fica para visto, orçamento, candidaturas e riscos.
- Responda em português. Explique o porquê das mudanças: estou aprendendo.
- A API é construída pelo Claude, seguindo o `ROADMAP.md`; eu reviso cada PR, então explique as decisões na descrição.
- Nos exercícios de `exercicios/`, me oriente e revise; não escreva a solução se eu não pedir.

## Stack e comandos
- Node.js >= 22.13 (usa `node:sqlite`, sem dependência nativa), Express 5, ESM.
- Testes: Vitest + Supertest (`test/api.test.js`). Rodar sempre antes de commitar.
- `npm install` · `npm run dev` · `npm test` · `npm run db:reset`
- Banco: `estudos.db` (SQLite, fora do Git). Dados iniciais em `src/db/seed.json`, exportados da planilha.

## Arquitetura
- `src/app.js` monta o app sem abrir porta (os testes usam banco `:memory:` e data congelada via `opcoes.agora`).
- Camadas: `routes/` (HTTP, validação) → `services/` (regras puras) → `repositories/` (todo o SQL). Rotas recebem `repos`, nunca o `db`.
- Schema só muda por migração nova em `src/db/migrations/` (`PRAGMA user_version`); nunca editar migração já mergeada.
- Datas de calendário via `src/datas.js` (fuso America/Sao_Paulo), nunca `toISOString().slice(0, 10)`.
- Validação em `src/validators.js`; erros sempre no formato `{ erro, detalhes }`.
- Regra de prioridade em `src/services/plano.js` (`pontuarSkill`, `proximasPrioridades`). Plano começa em 01/11/2026 = mês 1.

## Convenções
- Nomes de domínio em português (skills/courses/sessions nas rotas por enquanto; campos em português).
- Cada mudança com teste. Commits pequenos e descritivos em português.
- Branches: `main` ← `develop` ← `feat/<nome>` ou `mod/<nome>`, uma por tarefa, com PR para `develop`.
- Cada versão do `ROADMAP.md` numa branch `feat/` própria com PR.
- GitHub: `DoraimVini/estudos-api`. Commits com o e-mail noreply do GitHub.

## Onde estou no plano (out/2026)
- Curso.dev (Filipe Deschamps) é a base; projeto do curso no repo `clone-tabnews`. Acesso ao curso em recuperação.
- Também fiz o curso de Lógica/Python da EV.G (repo `evg-logic-python`).
- Exercício 1 do README concluído (out/2026): projeto no GitHub, fluxo com branches e PRs.
- Próximo: módulos 1 e 2 do `PLANO.md` (Git e JavaScript moderno) a partir de 01/11/2026.
  Mini-projetos de cada módulo ficam em repos próprios, não nesta API.
- Inglês: fluente; só praticar conversação.
- Graduação: decisão pendente (tecnólogo ADS EAD ou adiar). Provas presenciais são o ponto crítico,
  porque devo me mudar para os EUA em 2028.
