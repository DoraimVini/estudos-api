# estudos-api: contexto para o Claude Code

## Quem sou e para que serve este projeto
- Vini, Rio de Janeiro. Game dev (Unity/C#, Godot) migrando para dev full stack júnior.
- Este projeto é ao mesmo tempo ferramenta e treino: uma base condensada de estudos para usar
  em paralelo ao Curso.dev, e uma API que diz o que estudar agora.
- O que estudar em cada mês está na trilha: fonte em `src/db/trilha.json`, `PLANO.md` gerado por `npm run plano`
  (nunca editar o `PLANO.md` à mão). A planilha `..\Plano_3_anos_Vini.xlsx` fica para visto, orçamento, candidaturas e riscos.
- Responda em português. Explique o porquê das mudanças: estou aprendendo.
- A API é construída pelo Claude, seguindo o `ROADMAP.md`; eu reviso cada PR, então explique as decisões na descrição.
- Nos exercícios de `exercicios/`, me oriente e revise; não escreva a solução se eu não pedir.
  Nunca commitar solução em `exercicios/` (um teste da API verifica que os esqueletos continuam vazios).

## Stack e comandos
- Node.js >= 22.13 (usa `node:sqlite`, sem dependência nativa), Express 5, ESM.
- Testes: Vitest + Supertest (`test/*.test.js`). Rodar sempre antes de commitar.
  Testes de `exercicios/` rodam à parte (`vitest.exercicios.config.js`), fora do `npm test` e do CI.
- `npm install` · `npm run dev` · `npm test` · `npm run db:reset` · `npm run plano` · `npm run exercicio [slug]` · `npm run planilha [-- --gravar]`
- Banco: `estudos.db` (SQLite, fora do Git). Definições em `src/db/habilidades.json`, `cursos.json` e `trilha.json`
  (inclui `plano_inicio`), sincronizadas por slug a cada abertura; o progresso (autoavaliação, status, sessões) fica no banco.
  Dados de estudo: a API é a dona e escreve na planilha, nunca o contrário (`npm run planilha`, em `src/planilha/`).
- Planilha: tem dados pessoais, nunca entra no repo (testes usam planilha sintética). Só se editam as células-alvo no XML
  (`src/planilha/xlsx.js`): bibliotecas que regravam o arquivo inteiro (exceljs) estragam larguras e validações.
  Nunca gravar na planilha real sem eu pedir; para testar, usar uma cópia com `PLANILHA_PATH`.

## Arquitetura
- `src/app.js` monta o app sem abrir porta (os testes usam banco `:memory:` e data congelada via `opcoes.agora`).
- Camadas: `routes/` (HTTP, validação) → `services/` (regras puras) → `repositories/` (todo o SQL). Rotas recebem `repos`, nunca o `db`.
- Schema só muda por migração nova em `src/db/migrations/` (`PRAGMA user_version`); nunca editar migração já mergeada.
- Datas de calendário via `src/datas.js` (fuso America/Sao_Paulo), nunca `toISOString().slice(0, 10)`.
- Validação em `src/validators.js`; erros sempre no formato `{ erro, detalhes }`.
- Regra de prioridade em `src/services/plano.js` (`pontuarSkill`, `proximasPrioridades`). Plano começa em 01/11/2026 = mês 1.
- Habilidades e cursos: `src/db/habilidades-cursos.js`, mesmo modelo da trilha (slug fixo; `inicial` só vale ao criar).
- Trilha: `sincronizarTrilha` (em `src/db/trilha.js`) roda a cada abertura do banco. Tópico é identificado pelo
  `slug` (fixo, único na trilha inteira; nunca renomear um slug que já tem progresso); a ordem é só exibição.
  Status do módulo é derivado dos tópicos (`src/services/trilha.js`), nunca guardado.
- Exercícios: catálogo em `exercicios/catalogo.json`, sincronizado por slug (`src/db/exercicios.js`); cada
  exercício aponta para o slug do tópico.
  Só `npm run exercicio` marca como Resolvido (não há PATCH de propósito).
  Exercícios de Git (`exercicios/git/`): `preparar.js` monta um repositório de treino em `..\treino-git\` (fora do repo)
  e o teste confere o estado dele; validar cada um com `TREINO_GIT` numa pasta temporária (sem resolver falha, resolvido passa).
- Painel web em `public/` (HTML/CSS/JS puros, sem build), servido pelo Express na raiz. Roteamento por hash;
  cada página em `public/js/paginas/` exporta `{ titulo, render(param), acoes }`. Todo texto vindo da API passa por `esc()`.
- Conteúdo de estudo em `conteudo/<slug do módulo>/<slug do tópico>.md`, servido por `GET /topicos/:id` e aberto pelo
  botão Estudar. Regras: ler a página oficial ANTES de escrever (nunca de memória); texto próprio, sem copiar a
  documentação; links para a seção exata; preferir pt-BR, mas usar en-US quando a tradução estiver desatualizada (e avisar);
  seções obrigatórias "Em poucas palavras", "Leia na documentação oficial" (2+ links) e "Confira se entendeu";
  comandos que funcionem no PowerShell; não entregar a solução dos exercícios. Rodar `npm run links` antes de commitar.
- Meu `estudos.db` tem dados reais: para testar no navegador, usar `DB_PATH=demo.db` em outra porta (`.claude/launch.json`).
  Se o meu `npm run dev` estiver rodando (`--watch`), ele reinicia com o código da branch e aplica migrações novas
  no `estudos.db`: avisar antes de criar migração.
- Windows: PowerShell bloqueia `npm.ps1`; uso `npm.cmd` ou o `iniciar.cmd`.

## Convenções
- Nomes de domínio em português (skills/courses/sessions nas rotas por enquanto; campos em português).
- Cada mudança com teste. Commits pequenos e descritivos em português.
- Branches: `main` ← `develop` ← `feat/<nome>` ou `mod/<nome>`, uma por tarefa, com PR para `develop`.
  Protegidas por rulesets (`.github/rulesets/`): push direto, force push e apagar `main`/`develop` são recusados;
  merge só por PR com o check `testes` verde (e `origem` na `main`). Renomear um job do CI exige mudar o ruleset junto.
- Cada versão do `ROADMAP.md` numa branch `feat/` própria com PR.
- GitHub: `DoraimVini/estudos-api`. Commits com o e-mail noreply do GitHub.

## Onde estou no plano (out/2026)
- Curso.dev (Filipe Deschamps) é a base; projeto do curso no repo `clone-tabnews`. Acesso ao curso em recuperação.
- Também fiz o curso de Lógica/Python da EV.G (repo `evg-logic-python`).
- Exercício 1 do README concluído (out/2026): projeto no GitHub, fluxo com branches e PRs.
- Próximo: módulos 1 e 2 do `PLANO.md` (Git e JavaScript moderno) a partir de 01/11/2026,
  com o módulo 3 (HTML, CSS e acessibilidade) em paralelo até o mês 6.
  Mini-projetos de cada módulo ficam em repos próprios, não nesta API.
- Inglês: fluente; só praticar conversação.
- Graduação: decisão pendente (tecnólogo ADS EAD ou adiar). Provas presenciais são o ponto crítico,
  porque devo me mudar para os EUA em 2028.
