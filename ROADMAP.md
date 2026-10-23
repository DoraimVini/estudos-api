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

### v0.2 · Fundação (antes de 01/11)
- Camadas: `routes/` (HTTP) → `services/` (regras) → `repositories/` (SQL).
- Migrações versionadas (`db/migrations/NNN_nome.sql` + `PRAGMA user_version`).
- Datas no fuso de São Paulo (hoje uma sessão após as 21h cai no dia seguinte).
- CI: GitHub Actions rodando `npm test` em cada PR.

### v0.3 · Trilha (antes de 01/11)
- `trilha.json` com os 12 módulos detalhados: tópicos, recursos, mini-projeto, critério de pronto.
- Tabelas `modulos`, `topicos`, `recursos`; `modulos.skill_id` liga à habilidade da planilha.
- `GET /modulos`, `GET /modulos/:id`, `PATCH /topicos/:id` (status do tópico).
- Sessões ligadas a um tópico (`topico_id`).
- `/proximo` passa a mostrar o módulo do mês, os próximos tópicos e as habilidades prioritárias.
- `npm run plano` gera o `PLANO.md`.

### v0.4 · Exercícios (antes de 01/11)
- `exercicios/node/` (módulos 2 e 3) e `exercicios/sql/` (módulo 5), cada um com `README.md`, arquivo para completar e testes.
- `npm run exercicio node/01` roda os testes daquele exercício e, se passarem, marca como resolvido.
- `GET /exercicios?modulo=5&status=pendente`; `/proximo` sugere o próximo exercício.
- Testes dos exercícios ficam fora do `npm test` (senão o CI falharia até você resolver).

### v0.5 · TypeScript
- Projeto convertido, `strict` ligado, `tsc --noEmit` no CI. Exercícios continuam em JavaScript.

### v0.6 · PostgreSQL + Docker
- `docker-compose.yml` com PostgreSQL; migrações reescritas para PostgreSQL.
- Exercícios de SQL rodam em PostgreSQL.

### v0.7 · Autenticação
- Um usuário (você): senha com hash, sessão em cookie, rotas protegidas exceto `/status`.

### v0.8 · Front
- Next.js em `web/` (API vai para `api/`, com npm workspaces).
- Telas: o que estudar agora, trilha com tópicos, registro de sessão (Pomodoro), exercícios.

### v0.9 · Deploy
- Deploy automático a cada merge na `main`. Plataforma a escolher (precisa de conta sua).

### v1.0 · Observabilidade e release
- Logs estruturados com id de requisição e tempo de resposta.
- PR de `develop` para `main`: primeiro release.

## Decisões adiadas
- **v0.6:** PostgreSQL também nos testes (container no CI) ou só em dev e produção.
- **v0.9:** plataforma de deploy (Render, Fly.io, Railway…).
