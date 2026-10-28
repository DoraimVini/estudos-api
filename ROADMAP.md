# Roadmap da API

A API é a base condensada de estudos: serve a trilha (`PLANO.md`), registra o progresso e traz exercícios de Node e SQL com correção automática.
Cada versão é uma branch `feat/` com PR para `develop`. A `v1.0` vai para a `main` como primeiro release.

## Decisões

| Tema | Decisão | Por quê |
|---|---|---|
| Fonte da trilha | `src/db/trilha.json`; `npm run plano` gera o `PLANO.md` | Trilha fechada antes de começar: um arquivo só, API e texto nunca divergem |
| Quem constrói | Claude constrói a API; Vini revisa cada PR e resolve os exercícios | Pronta a tempo, e a prática fica nos exercícios |
| Exercícios | Pasta `exercicios/` com enunciado, arquivo para completar e testes | Correção automática; a API registra o que foi resolvido |
| Cursos | `courses` fica só com cursos externos (Curso.dev, graduação, certificações) | Temas de estudo viram módulos da trilha |
| Ordem | Fundação e trilha antes de 01/11; o resto em seguida | Migrações precisam existir antes dos dados reais |

## Versões

### v0.2 · Fundação (antes de 01/11) ✅
- Camadas: `routes/` (HTTP) → `services/` (regras) → `repositories/` (SQL).
- Migrações versionadas (`db/migrations/NNN_nome.sql` + `PRAGMA user_version`).
- Datas no fuso de São Paulo (hoje uma sessão após as 21h cai no dia seguinte).
- CI: GitHub Actions rodando `npm test` em cada PR.

### v0.3 · Trilha (antes de 01/11) ✅
- `trilha.json` com os 13 módulos detalhados: tópicos, recursos, mini-projeto, critério de pronto.
- Tabelas `modulos`, `topicos`, `recursos`; `modulos.skill_id` liga à habilidade da planilha.
- `GET /modulos`, `GET /modulos/:id`, `PATCH /topicos/:id` (status do tópico).
- Sessões ligadas a um tópico (`topico_id`).
- `/proximo` passa a mostrar o módulo do mês, os próximos tópicos e as habilidades prioritárias.
- `npm run plano` gera o `PLANO.md`.
- `courses` reduzida a cursos externos (migração 003).

### v0.4 · Exercícios (antes de 01/11) ✅
- 18 exercícios: `exercicios/js/` (módulo 2), `exercicios/node/` (módulo 4) e `exercicios/sql/` (módulo 5, banco de uma loja), cada um com `README.md`, esqueleto e testes.
- `exercicios/catalogo.json` é a lista oficial; migração 004 e sincronização como na trilha.
- `npm run exercicio js/01` roda os testes daquele exercício e, se passarem, marca como `Resolvido`.
- `GET /exercicios?modulo=5&status=Pendente`, `GET /exercicios/:id` (com enunciado); `/proximo` sugere os próximos.
- Testes dos exercícios ficam fora do `npm test` (senão o CI falharia até você resolver).

### v0.5 · Painel web ✅ (adiantado: sem ele, não dava para estudar)
- HTML, CSS e módulos JS puros em `public/`, servidos pela própria API (sem build, sem dependência nova).
- Páginas Agora, Trilha, Progresso e Habilidades; Pomodoro que registra a sessão no tópico.
- `iniciar.cmd`: dois cliques sobem a API e abrem o painel.
- Pendente: no celular, o Pomodoro ocupa a primeira tela inteira.
- **Conteúdo de estudo por tópico** (`conteudo/`), escrito a partir da documentação oficial, com a página do tópico no painel e `npm run links`.
  Meses 1 e 2 completos (módulos 1–4, 37 tópicos). Os outros 77 tópicos entram antes do mês em que cada módulo começa.

### v0.5.x · Base para crescer (antes de 01/11)
- **Ids estáveis** (migração 006): módulos e tópicos ganham `slug` no `trilha.json`. O progresso, as sessões, os exercícios e os arquivos de conteúdo seguem o slug, então dá para reordenar ou mover tópicos sem trocar o progresso de lugar.
- **Uma fonte por dado** (migração 007): o `seed.json` vira `habilidades.json` e `cursos.json`, com `slug` e sincronizados
  como a trilha (a definição vem do arquivo; autoavaliação, status e prioridade ficam no banco). A data de início vai para o `trilha.json`.
- **API → planilha** (`npm run planilha`): a API é dona dos estudos e atualiza só as células de estudo da planilha,
  que continua sendo o plano mestre (visto, orçamento, candidaturas, riscos). Simula por padrão; `--gravar` com backup e conferência.
- **Proteção das branches**: rulesets versionados em `.github/rulesets/` (`main` e `develop` só por PR com CI verde,
  sem apagar nem force push; a `main` só recebe a `develop`, conferido pelo job `origem` do CI).
- **Exercícios de Git** (6): cada um prepara um repositório de treino em `..\treino-git\` e o teste confere o estado
  dele (staging, merge, conflito, remotos, revert/reflog, segredos).
- **Exercícios de HTML/CSS** (5): semântica, formulário e acessibilidade (estrutura lida sem navegador); cascata/box model
  e flexbox/grid/media queries como previsão, com gabarito conferido num navegador e guardado como hash.

### v0.6 · TypeScript
- API convertida, `strict` ligado, `tsc --noEmit` no CI. Exercícios e painel continuam em JavaScript.

### v0.7 · PostgreSQL + Docker
- `docker-compose.yml` com PostgreSQL; migrações reescritas para PostgreSQL.
- Exercícios de SQL rodam em PostgreSQL.

### v0.8 · Autenticação
- Um usuário (você): senha com hash, sessão em cookie, rotas protegidas exceto `/status`.

### v0.9 · Front em Next.js
- Substitui o painel da v0.5: Next.js em `web/` (API vai para `api/`, com npm workspaces).

### v0.10 · Deploy
- Deploy automático a cada merge na `main`. Plataforma a escolher (precisa de conta sua).

### v1.0 · Observabilidade e release
- Logs estruturados com id de requisição e tempo de resposta.
- PR de `develop` para `main`: primeiro release.

## Decisões adiadas
- **v0.7:** PostgreSQL também nos testes (container no CI) ou só em dev e produção.
- **v0.10:** plataforma de deploy (Render, Fly.io, Railway…).
- **Sem versão:** pré-requisitos entre módulos (`modulos.depende_de`), com o `/proximo` respeitando dependências e não só prazos. Hoje a ordem dos meses já segue as dependências, e um teste garante que cada módulo cabe na janela da sua habilidade.
