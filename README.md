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
  routes/             HTTP: lê a requisição, valida e responde
  services/plano.js   regras de prioridade (funções puras)
  repositories/       SQL: o único lugar que fala com o banco
  db/database.js      abre o banco, migra e carrega o seed.json
  db/migrate.js       aplica db/migrations/NNN_nome.sql em ordem (PRAGMA user_version)
  db/seed.json        habilidades e cursos exportados da planilha
  datas.js            datas no fuso de São Paulo
  constantes.js       níveis, status e prioridades válidos
  errors.js           formato único de erro { erro, detalhes }
  validators.js       validação de entrada
test/                 testes de integração e unidade (Vitest + Supertest)
.github/workflows/    CI: npm test em cada PR
```

Mudou o schema? Crie `src/db/migrations/NNN_descricao.sql` com o próximo número. Nunca edite uma migração que já foi para a `develop`.

## Fluxo de branches

```
main ← develop ← feat/<nome>   (funcionalidade nova, ex.: feat/post-skills)
               ← mod/<nome>    (modificação no que já existe, ex.: mod/readme-fluxo-branches)
```

- `main`: só recebe o que já foi testado em `develop`.
- `develop`: integração. Cada tarefa ganha uma branch curta que sai dela e volta por PR.
- Começar uma tarefa: `git switch develop`, `git pull` e `git switch -c feat/<nome>`.
- Depois do merge, apague a branch (`git branch -d feat/<nome>`); a próxima tarefa ganha outra.
- Rode `npm test` antes de cada commit; o PR só é aceito com os testes passando.

## Trilha, roadmap e exercícios

- [`PLANO.md`](PLANO.md): o que estudar em cada mês (12 módulos).
- [`ROADMAP.md`](ROADMAP.md): como a API evolui até a v1.0.
- `exercicios/` (a partir da v0.4): exercícios de Node e SQL com testes automáticos.

Dica: não peça para a IA resolver o exercício. Use-a para tirar dúvidas e revisar, e garanta que você consegue explicar cada linha.
