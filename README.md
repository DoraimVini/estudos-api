# estudos-api

API REST que organiza meus estudos de dev full stack a partir do plano de 3 anos.
Ela já vem carregada com as 28 habilidades (júnior → pleno → sênior) e os cursos da planilha,
e responde **o que estudar agora**, em ordem de prioridade, com o motivo de cada sugestão.

## Requisitos

- Node.js **22.13 ou mais novo** (usa o SQLite que já vem no Node, `node:sqlite`: nada para compilar).

## Como estudar com ela

Dê dois cliques em **`iniciar.cmd`**: ele sobe a API e abre o painel em http://localhost:3000.

| Página | Para quê |
|---|---|
| **Agora** | Módulos do mês com os próximos tópicos, exercícios e habilidades prioritárias. **Estudar** escolhe o tópico do Pomodoro |
| **Trilha** | Os 13 módulos; cada um com tópicos, recursos, mini-projeto e exercícios (com o enunciado) |
| **Progresso** | Tópicos, exercícios e horas; sessões dos últimos 14 dias (dá para apagar) |
| **Habilidades** | Autoavaliação (1–5), meta e status; salva a cada mudança |

O **Pomodoro** fica ao lado de todas as páginas: escolha o tópico, inicie e, no fim, registre a sessão. O tópico passa para "Em andamento" sozinho.

No PowerShell, se `npm` der erro de "execução de scripts", use `npm.cmd` (ex.: `npm.cmd run dev`) ou libere com `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## Como rodar

```bash
npm install
npm run dev        # painel em http://localhost:3000, API em /api/v1; reinicia ao salvar arquivos
npm test           # roda os testes da API (Vitest + Supertest)
npm run db:reset   # apaga o banco local e recarrega os dados da planilha
npm run plano      # gera o PLANO.md a partir de src/db/trilha.json
npm run exercicio  # lista os exercícios; npm run exercicio js/01 roda um deles
npm run links      # confere se os links da trilha e do conteúdo continuam no ar (precisa de internet)
```

O banco fica no arquivo `estudos.db` (fora do Git). Para outro caminho: `DB_PATH=meu.db npm start`.

## Endpoints (`/api/v1`)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/status` | Saúde da API |
| GET | `/proximo?limite=3&mes=4` | **O que estudar agora**: módulos do mês (atrasados primeiro) com os próximos tópicos, exercícios pendentes, habilidades por prioridade e cursos do mês |
| GET | `/progresso` | Tópicos concluídos, exercícios resolvidos, resumo por nível e horas dos últimos 7 dias |
| GET | `/modulos?fase=1` | Módulos da trilha com status e progresso calculados |
| GET | `/modulos/:id` | Um módulo com tópicos, recursos, exercícios e a habilidade ligada |
| GET | `/exercicios?modulo=5&status=Pendente` | Exercícios (`Pendente` ou `Resolvido`) |
| GET | `/exercicios/:id` | Um exercício com o enunciado e o comando para rodar os testes |
| GET | `/topicos/:id` | Um tópico |
| PATCH | `/topicos/:id` | Atualiza `status` (`Não iniciado`, `Em andamento`, `Concluído`) |
| GET | `/skills?nivel=Júnior&status=Em andamento&area=Backend` | Lista habilidades |
| GET | `/skills/:id` | Uma habilidade |
| PATCH | `/skills/:id` | Atualiza `hoje` (1–5 ou null), `meta` (1–5), `status` |
| GET | `/courses?prioridade=Alta&status=Não iniciado` | Lista cursos |
| PATCH | `/courses/:id` | Atualiza `status`, `prioridade` |
| GET | `/sessions?de=2026-11-01&ate=2026-11-30` | Sessões de estudo no período |
| POST | `/sessions` | Registra uma sessão: `{ topico_id?, skill_id?, course_id?, minutos, data?, notas? }` |
| DELETE | `/sessions/:id` | Apaga uma sessão |

Status válidos: `Não iniciado`, `Em andamento`, `Concluído`, `Atrasado`, `N/A`.

### Exemplos com curl

```bash
# 1. Faça sua autoavaliação (1 = nunca usei · 5 = ensino outras pessoas)
curl -X PATCH localhost:3000/api/v1/skills/3 -H "Content-Type: application/json" \
  -d '{"hoje": 2, "status": "Em andamento"}'

# 2. Pergunte o que estudar (cada tópico sugerido vem com o id)
curl localhost:3000/api/v1/proximo

# 3. Registre o que estudou (a sessão conta para a habilidade do módulo)
curl -X POST localhost:3000/api/v1/sessions -H "Content-Type: application/json" \
  -d '{"topico_id": 12, "minutos": 50, "notas": "Closures com exemplos"}'

# 4. Marque o tópico como concluído
curl -X PATCH localhost:3000/api/v1/topicos/12 -H "Content-Type: application/json" \
  -d '{"status": "Concluído"}'

# 5. Veja o progresso
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
  services/           regras puras: prioridade (plano.js), trilha (trilha.js), PLANO.md (markdown.js)
  repositories/       SQL: o único lugar que fala com o banco
  db/database.js      abre o banco, migra, carrega o seed.json e sincroniza a trilha
  db/migrate.js       aplica db/migrations/NNN_nome.sql em ordem (PRAGMA user_version)
  db/seed.json        habilidades e cursos exportados da planilha
  db/trilha.json      fonte da trilha: módulos, tópicos e recursos
  db/trilha.js        sincroniza o trilha.json com o banco sem perder o progresso
  db/exercicios.js    sincroniza exercicios/catalogo.json com o banco e lê os enunciados
  scripts/            npm run plano (gera o PLANO.md) e npm run exercicio (roda e registra)
  datas.js            datas no fuso de São Paulo
  constantes.js       níveis, status e prioridades válidos
  errors.js           formato único de erro { erro, detalhes }
  validators.js       validação de entrada
test/                 testes de integração e unidade (Vitest + Supertest)
conteudo/             conteúdo de estudo de cada tópico (<módulo>/<tópico>.md, pelos slugs da trilha)
exercicios/           exercícios de JS, Node e SQL com testes próprios (fora do npm test)
public/               painel web: HTML, CSS e módulos JS puros, servidos pela própria API
  js/app.js           roteamento por hash (#/agora, #/trilha/5) e despacho das ações (data-acao)
  js/paginas/         uma página por arquivo: agora, trilha, progresso, habilidades
iniciar.cmd           dois cliques: sobe a API e abre o painel
.github/workflows/    CI: npm test em cada PR
```

Mudou o schema? Crie `src/db/migrations/NNN_descricao.sql` com o próximo número. Nunca edite uma migração que já foi para a `develop`.

Mudou a trilha? Edite `src/db/trilha.json` e rode `npm run plano`. O banco se atualiza sozinho ao abrir, mantendo o status dos tópicos (identificados por módulo + posição). Um teste falha se o `PLANO.md` ficar desatualizado.

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

- [`PLANO.md`](PLANO.md): o que estudar em cada mês (13 módulos).
- [`ROADMAP.md`](ROADMAP.md): como a API evolui até a v1.0.
- [`exercicios/`](exercicios/README.md): 18 exercícios de JavaScript, Node e SQL com correção automática.

Dica: não peça para a IA resolver o exercício. Use-a para tirar dúvidas e revisar, e garanta que você consegue explicar cada linha.
