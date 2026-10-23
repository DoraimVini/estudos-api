# Trilha de estudos

Base condensada para estudar em paralelo ao Curso.dev. Início: 01/11/2026 = mês 1.
Cada módulo tem: **tópicos** (o essencial, nada além), **recursos** (gratuitos), **mini-projeto** (repo próprio, com PR) e **pronto quando** (critério para passar adiante).

## Fase 1 · Fundamentos (meses 1–6)

### 1. Git e GitHub · mês 1
- **Tópicos:** commit, branch, merge x rebase, conflitos, PR e code review, `.gitignore`, mensagens de commit.
- **Recursos:** Pro Git (caps. 1–3), GitHub Skills.
- **Mini-projeto:** repo de anotações de estudo; gere um conflito de propósito e resolva via PR.
- **Pronto quando:** você trabalha só com branches e PRs sem consultar comando.

### 2. JavaScript moderno · meses 1–2
- **Tópicos:** tipos e coerção, escopo e closures, arrays (`map`/`filter`/`reduce`), desestruturação, módulos ESM, Promises, `async`/`await`, event loop, `fetch`, tratamento de erros.
- **Recursos:** javascript.info (partes 1 e 2), MDN.
- **Mini-projeto:** CLI que consulta uma API pública (ex.: clima) e trata erro de rede e de entrada.
- **Pronto quando:** você explica o event loop e escreve código assíncrono sem `.then` aninhado.

### 3. Node e APIs REST · mês 2
- **Tópicos:** HTTP (métodos, status, headers), Express (rotas, middleware), validação, formato de erro, design REST.
- **Recursos:** MDN HTTP, docs do Node e do Express.
- **Mini-projeto:** API de encurtador de links (criar, redirecionar, contar acessos) com testes.
- **Pronto quando:** você escolhe o status code certo sem consultar e cada rota tem teste.

### 4. TypeScript · mês 3
- **Tópicos:** tipos básicos, `type` x `interface`, unions e narrowing, generics, `tsconfig`, tipar Express.
- **Recursos:** TypeScript Handbook.
- **Mini-projeto:** converter o encurtador para TypeScript com `strict` ligado.
- **Pronto quando:** `tsc --noEmit` passa sem nenhum `any`.

### 5. SQL e PostgreSQL · mês 4
- **Tópicos:** `SELECT`/`WHERE`/`ORDER BY`, `JOIN`, `GROUP BY`/`HAVING`, subqueries, modelagem (1:N, N:N, normalização), índices, migrations.
- **Recursos:** SQLBolt, pgexercises, tutorial da doc do PostgreSQL.
- **Mini-projeto:** banco de uma biblioteca (livros, leitores, empréstimos) + 20 consultas comentadas.
- **Pronto quando:** você resolve um `JOIN` com agregação de cabeça.

### 6. Fundamentos de computação · mês 5
- **Tópicos:** CS50 semanas 0–5: algoritmos de busca e ordenação, Big O, memória, estruturas de dados.
- **Recursos:** CS50x (Harvard).
- **Mini-projeto:** problem sets do CS50 num repo, cada um com um README explicando a solução.
- **Pronto quando:** você explica a complexidade das próprias soluções.

### 7. Autenticação e segurança básica · mês 6
- **Tópicos:** hash de senha (bcrypt/argon2), sessão x JWT, cookies seguros, CORS, OWASP Top 10 (injeção, auth quebrada).
- **Recursos:** OWASP Cheat Sheets.
- **Mini-projeto:** contas de usuário no encurtador (cada um vê só os seus links).
- **Pronto quando:** você justifica a escolha entre sessão e JWT.

## Fase 2 · Portfólio (meses 7–12)

Resumida de propósito: detalhar os tópicos ao fim da Fase 1, com o que você já souber.

### 8. React e Next.js · mês 7
- **Tópicos:** componentes, props e estado, `useState`/`useEffect`, App Router, busca de dados, SSR x SSG.
- **Recursos:** react.dev (Learn), Next.js Learn.
- **Mini-projeto:** front do encurtador (login, lista de links, estatísticas).

### 9. Testes · mês 8
- **Tópicos:** unidade x integração x e2e, mocks, Testing Library, Playwright.
- **Mini-projeto:** e2e do fluxo principal do encurtador.

### 10. Docker e deploy · mês 9
- **Tópicos:** imagem, `Dockerfile`, `docker compose`, variáveis de ambiente, deploy.
- **Mini-projeto:** encurtador + PostgreSQL no compose, publicado com link no README.

### 11. CI/CD · mês 10
- **Tópicos:** GitHub Actions: testes em cada PR, deploy a cada merge.
- **Mini-projeto:** pipeline completo do encurtador.

### 12. AWS Cloud Practitioner · meses 11–12
- **Recursos:** AWS Skill Builder (Cloud Practitioner Essentials).
- **Entrega:** certificação.

## Depois do mês 12
System design básico, um projeto com usuários reais e entrevistas técnicas. Detalhar quando chegar lá.

## Contínuo
- **Inglês (conversação):** prática semanal de conversa; explicar em voz alta, em inglês, o mini-projeto do mês.
- **Progresso:** horas e autoavaliação registradas na API (`POST /sessions`, `PATCH /skills/:id`).
