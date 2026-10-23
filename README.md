# estudos-api

API REST que organiza meus estudos de dev full stack a partir do plano de 3 anos.
Ela já vem carregada com as 28 habilidades (júnior → pleno → sênior) e os cursos da planilha,
e responde **o que estudar agora**, em ordem de prioridade, com o motivo de cada sugestão.

## Requisitos

- Node.js **22.13 ou mais novo** (usa o SQLite que já vem no Node, `node:sqlite`: nada para compilar).

## Como rodar

```bash
npm install
npm run dev        # sobe em http://localhost:3000 e reinicia ao salvar arquivos
npm test           # roda os testes (Vitest + Supertest)
npm run db:reset   # apaga o banco local e recarrega os dados da planilha
```

O banco fica no arquivo `estudos.db` (fora do Git). Para outro caminho: `DB_PATH=meu.db npm start`.

## Endpoints (`/api/v1`)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/status` | Saúde da API |
| GET | `/proximo?limite=3&mes=4` | **O que estudar agora**: habilidades por prioridade + cursos do mês |
| GET | `/progresso` | Resumo por nível e horas estudadas nos últimos 7 dias |
| GET | `/skills?nivel=Júnior&status=Em andamento&area=Backend` | Lista habilidades |
| GET | `/skills/:id` | Uma habilidade |
| PATCH | `/skills/:id` | Atualiza `hoje` (1–5 ou null), `meta` (1–5), `status` |
| GET | `/courses?prioridade=Alta&status=Não iniciado` | Lista cursos |
| PATCH | `/courses/:id` | Atualiza `status`, `prioridade` |
| GET | `/sessions?de=2026-11-01&ate=2026-11-30` | Sessões de estudo no período |
| POST | `/sessions` | Registra uma sessão: `{ skill_id?, course_id?, minutos, data?, notas? }` |
| DELETE | `/sessions/:id` | Apaga uma sessão |

Status válidos: `Não iniciado`, `Em andamento`, `Concluído`, `Atrasado`, `N/A`.

### Exemplos com curl

```bash
# 1. Faça sua autoavaliação (1 = nunca usei · 5 = ensino outras pessoas)
curl -X PATCH localhost:3000/api/v1/skills/3 -H "Content-Type: application/json" \
  -d '{"hoje": 2, "status": "Em andamento"}'

# 2. Pergunte o que estudar
curl localhost:3000/api/v1/proximo

# 3. Registre o que estudou
curl -X POST localhost:3000/api/v1/sessions -H "Content-Type: application/json" \
  -d '{"skill_id": 3, "minutos": 50, "notas": "Generics no TypeScript"}'

# 4. Veja o progresso
curl localhost:3000/api/v1/progresso
```

## Como a prioridade é calculada

Fica em `src/services/plano.js` (função `pontuarSkill`), de propósito num lugar só para você mexer:

- `(meta − hoje) × 2`: quanto mais longe da meta, mais prioridade (autoavaliação vazia conta como 1);
- nível: júnior +6, pleno +4, sênior +2;
- atrasada (o mês de fim no plano já passou): +1 por mês, até +6;
- "Em andamento": +2, para você terminar o que começou;
- só entram habilidades cujo mês de início já chegou; concluídas e com meta atingida saem da lista;
- empate: vence a que termina antes no plano.

O mês do plano é calculado a partir de 01/11/2026 (mês 1). Para simular outro mês: `?mes=10`.

## Estrutura

```
src/
  app.js              monta o Express (sem abrir porta; usado pelos testes)
  server.js           abre a porta
  errors.js           formato único de erro { erro, detalhes }
  validators.js       validação de entrada
  db/database.js      schema SQLite + carga inicial do seed.json
  db/seed.json        habilidades e cursos exportados da planilha
  routes/             skills, courses, sessions, plano (/proximo e /progresso)
  services/plano.js   regras de prioridade
test/api.test.js      18 testes de integração e unidade
```

## Exercícios para evoluir (na ordem do plano)

Cada um treina uma habilidade da aba Habilidades. Faça com testes antes de considerar pronto.

1. **Git** (meses 1–2): suba o projeto para o GitHub e faça cada exercício abaixo numa branch com PR.
2. **TypeScript** (mês 3): converta o projeto para TypeScript (`tsx` para rodar, `tsc --noEmit` no teste).
3. **SQL** (mês 4): crie `GET /sessions/semanal` que agrupa minutos por semana com SQL puro.
4. **API**: crie `POST /skills` para adicionar habilidades novas, com validação e testes.
5. **Autenticação** (meses 6–10): proteja as rotas de escrita com login (senha com hash + JWT ou sessão).
6. **React/Next** (mês 7): faça um front que mostra o `/proximo` e um botão "estudei 25 min" (Pomodoro).
7. **PostgreSQL + Docker** (meses 4 e 9): troque o SQLite por PostgreSQL rodando num `docker-compose.yml`, com migrations versionadas.
8. **CI/CD** (mês 10): GitHub Actions rodando `npm test` em cada PR; depois, deploy automático.
9. **Observabilidade** (pleno): logs estruturados com id de requisição e tempo de resposta.

Dica: não peça para a IA fazer o exercício inteiro. Use-a para tirar dúvidas e revisar, e garanta que você consegue explicar cada linha.
