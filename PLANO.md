# Trilha de estudos

> Gerado de `src/db/trilha.json` por `npm run plano`. Não edite à mão: edite o JSON e rode o script.

Base condensada para estudar em paralelo ao Curso.dev. Início: 01/11/2026 = mês 1.
Cada módulo tem: **objetivo**, **tópicos** (o essencial, nada além), **recursos** (gratuitos), **mini-projeto** (repo próprio, com PR) e **pronto quando** (critério para passar adiante).

## Fase 1 · Fundamentos (meses 1–6)

### 1. Git e GitHub · mês 1

**Objetivo:** Versionar todo trabalho com branches e PRs, sem medo de errar.

**Tópicos**

1. **Modelo do Git:** Working tree, staging e repositório; o que é um commit (snapshot + pai) e o que é o HEAD.
2. **Commits bons:** Commits pequenos e atômicos; mensagem que diz o quê e o porquê.
3. **Branches:** Branch é só um ponteiro para um commit; criar, trocar (`git switch`) e apagar.
4. **Merge e rebase:** Fast-forward x merge commit; rebase reescreve histórico, então nunca em branch compartilhada.
5. **Conflitos:** Ler os marcadores `<<<<<<<`, decidir, testar e concluir o merge.
6. **Remotos:** `origin`, `fetch` x `pull`, `push -u`, branches de rastreamento e `--prune`.
7. **Pull requests e code review:** Descrição que explica o porquê; revisar código alheio com perguntas, não ordens.
8. **Desfazer coisas:** `restore`, `revert` x `reset`, e `reflog` para recuperar o que parecia perdido.
9. **.gitignore e segredos:** O que nunca vai para o repositório (.env, bancos, node_modules) e o que fazer se for.

**Recursos**

- [Pro Git, capítulos 1–3](https://git-scm.com/book/pt-br/v2) (livro)
- [Learn Git Branching](https://learngitbranching.js.org/?locale=pt_BR) (exercícios)
- [GitHub Skills](https://skills.github.com/) (curso)

**Mini-projeto:** Repo de anotações de estudo: gere um conflito de propósito em duas branches e resolva via PR.

**Pronto quando:** Você trabalha só com branches e PRs e recupera um commit "perdido" com o reflog sem consultar.

### 2. JavaScript moderno · meses 1–2

**Objetivo:** Ler e escrever JavaScript moderno com segurança, inclusive código assíncrono.

**Tópicos**

1. **Tipos e coerção:** Primitivos x objetos, `===` x `==`, truthy/falsy, `typeof`, `null` x `undefined`.
2. **Escopo e closures:** `let`/`const`, escopo de bloco, funções que lembram o ambiente onde nasceram.
3. **Funções:** Arrow functions, parâmetros padrão, rest/spread, funções como valor.
4. **this e classes:** Como `this` é definido, `class`, herança simples e quando preferir funções puras.
5. **Arrays:** `map`, `filter`, `reduce`, `find`, `some`, `sort` com comparador, sem mutar o original.
6. **Objetos:** Desestruturação, spread, `Object.entries`, cópia rasa x profunda, `structuredClone`.
7. **Módulos ESM:** `import`/`export`, default x nomeado, por que este projeto usa `"type": "module"`.
8. **Promises e async/await:** Estados de uma Promise, `await`, `Promise.all` x `Promise.allSettled`.
9. **Event loop:** Pilha, fila de tarefas e microtarefas: por que `setTimeout(fn, 0)` não roda na hora.
10. **Erros:** `try/catch` com `async`, classes de erro próprias, nunca engolir erro em silêncio.

**Recursos**

- [javascript.info (partes 1 e 2)](https://javascript.info/) (curso)
- [Event loop (javascript.info)](https://javascript.info/event-loop) (artigo)
- [Guia de JavaScript (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide) (documentação)

**Mini-projeto:** CLI que consulta uma API pública (ex.: clima) com `fetch`, trata erro de rede e de entrada e faz várias consultas em paralelo.

**Pronto quando:** Você explica o event loop e escreve código assíncrono sem `.then` aninhado.

### 3. Node e APIs REST · mês 2

**Objetivo:** Construir uma API HTTP correta, validada e testada.

**Tópicos**

1. **Runtime do Node:** O que o Node é (V8 + libuv), `process`, variáveis de ambiente, `node --watch`.
2. **Módulos nativos:** `fs/promises`, `path`, `URL`, `crypto`: o que já vem pronto sem instalar nada.
3. **npm:** `package.json`, dependencies x devDependencies, `package-lock.json`, scripts, semver.
4. **HTTP:** Métodos, status codes, headers, corpo, idempotência (GET/PUT/DELETE x POST).
5. **Design REST:** Recursos no plural, filtros por query string, aninhamento com moderação, versão na URL.
6. **Express:** Rotas, `Router`, `req`/`res`, ordem dos middlewares e o middleware de erro.
7. **Validação:** Nunca confiar no cliente: validar tipo, formato e campos extras; responder 400 com detalhes.
8. **Testes de API:** Supertest + Vitest: subir o app sem porta, banco em memória, data congelada.

**Recursos**

- [Learn Node.js](https://nodejs.org/en/learn) (documentação)
- [HTTP (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/HTTP) (documentação)
- [Status codes (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status) (documentação)
- [Guia do Express](https://expressjs.com/en/guide/routing.html) (documentação)

**Mini-projeto:** API de encurtador de links: criar, redirecionar (302) e contar acessos, com testes.

**Pronto quando:** Você escolhe o status code certo sem consultar e cada rota tem teste de sucesso e de erro.

### 4. TypeScript · mês 3

**Objetivo:** Usar o sistema de tipos para pegar erros antes de rodar o código.

**Tópicos**

1. **Por que tipos:** O que o TS verifica, o que não verifica (tipos somem no runtime) e o papel do `tsc`.
2. **Tipos básicos:** Primitivos, arrays, tuplas, objetos, `unknown` x `any`, inferência.
3. **type x interface:** Quando usar cada um; propriedades opcionais e `readonly`.
4. **Unions e narrowing:** Uniões, estreitar com `typeof`/`in`/discriminante, `never` para checar exaustividade.
5. **Funções tipadas:** Parâmetros, retorno, callbacks e funções que aceitam mais de um formato.
6. **Generics:** Funções e tipos genéricos, restrições com `extends`.
7. **Utility types:** `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`.
8. **Configuração:** `tsconfig.json`, `strict`, `tsc --noEmit` no CI, rodar com `tsx`.
9. **Dados de fora:** Tipar `Request`/`Response` do Express; dado externo é `unknown` até ser validado.

**Recursos**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) (documentação)
- [TypeScript Playground](https://www.typescriptlang.org/play) (ferramenta)
- [type-challenges](https://github.com/type-challenges/type-challenges) (exercícios)

**Mini-projeto:** Converter o encurtador para TypeScript com `strict` ligado.

**Pronto quando:** `tsc --noEmit` passa sem nenhum `any` explícito.

### 5. SQL e PostgreSQL · mês 4

**Objetivo:** Modelar um banco e escrever consultas sem depender de ORM.

**Tópicos**

1. **Modelo relacional:** Tabela, linha, coluna, chave primária e chave estrangeira.
2. **Consultas básicas:** `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `DISTINCT`, e `NULL` com `IS NULL`.
3. **Agregação:** `COUNT`, `SUM`, `AVG`, `GROUP BY` e `HAVING` (filtro depois do agrupamento).
4. **JOINs:** `INNER` x `LEFT JOIN`, juntar 3 tabelas, achar o que não tem par.
5. **Subqueries e CTEs:** Consulta dentro de consulta e `WITH` para deixar legível.
6. **Escrita:** `INSERT`, `UPDATE` e `DELETE` sempre com `WHERE`; `RETURNING` no PostgreSQL.
7. **Modelagem:** 1:N, N:N com tabela de ligação, normalização até a 3ª forma normal.
8. **Restrições:** `NOT NULL`, `UNIQUE`, `CHECK`, `ON DELETE` (cascade x set null).
9. **Índices:** O que um índice acelera, quanto custa na escrita, `EXPLAIN` básico.
10. **Transações e migrações:** `BEGIN`/`COMMIT`/`ROLLBACK` e versionar o schema (como este projeto faz).

**Recursos**

- [SQLBolt](https://sqlbolt.com/) (exercícios)
- [PostgreSQL Exercises](https://pgexercises.com/) (exercícios)
- [Tutorial do PostgreSQL](https://www.postgresql.org/docs/current/tutorial.html) (documentação)

**Mini-projeto:** Banco de uma biblioteca (livros, autores, leitores, empréstimos) com 20 consultas comentadas.

**Pronto quando:** Você resolve um JOIN com agregação de cabeça e explica por que cada índice existe.

### 6. Fundamentos de computação · mês 5

**Objetivo:** Entender o que acontece por baixo e analisar a eficiência do próprio código.

**Tópicos**

1. **Big O:** Contar operações: O(1), O(log n), O(n), O(n log n), O(n²), com exemplos do dia a dia.
2. **Busca:** Linear x binária; por que a binária exige dados ordenados.
3. **Ordenação:** Selection, bubble e merge sort; por que o `sort` da linguagem é O(n log n).
4. **Recursão:** Caso base, pilha de chamadas, quando trocar por laço.
5. **Memória:** Pilha x heap, ponteiros (em C), por que objetos em JS são passados por referência.
6. **Estruturas de dados:** Array, lista ligada, pilha, fila, hash table e árvore: custo de cada operação.
7. **Hash tables na prática:** `Map`/`Set` em JavaScript e quando usar no lugar de array.

**Recursos**

- [CS50x (semanas 0–5)](https://cs50.harvard.edu/x/) (curso)
- [VisuAlgo](https://visualgo.net/en) (ferramenta)

**Mini-projeto:** Problem sets do CS50 (semanas 0–5) num repo, cada um com README explicando a solução e a complexidade.

**Pronto quando:** Você explica a complexidade das próprias soluções e escolhe a estrutura de dados certa.

### 7. Autenticação e segurança básica · mês 6

**Objetivo:** Proteger uma aplicação com login seguro e evitar as falhas mais comuns.

**Tópicos**

1. **Autenticação x autorização:** Quem é você x o que você pode fazer; 401 x 403.
2. **Senhas:** Hash lento com sal (bcrypt/argon2); nunca criptografia reversível nem MD5/SHA puro.
3. **Sessão com cookie:** Id de sessão guardado no servidor; cookies `HttpOnly`, `Secure` e `SameSite`.
4. **JWT:** Estrutura, assinatura, expiração; por que revogar é difícil.
5. **Sessão x JWT:** Critérios de escolha para um app web próprio x uma API pública.
6. **CORS e CSRF:** O que o navegador bloqueia, o que não bloqueia e como `SameSite` ajuda.
7. **Injeção:** SQL injection e por que consultas parametrizadas (`?`) resolvem.
8. **Segredos:** Variáveis de ambiente, `.env` fora do Git, trocar o segredo quando vazar.
9. **OWASP Top 10:** Ler a lista e reconhecer cada item no próprio código.

**Recursos**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) (documentação)
- [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) (documentação)
- [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) (documentação)

**Mini-projeto:** Contas de usuário no encurtador: cada pessoa vê e apaga só os próprios links.

**Pronto quando:** Você justifica a escolha entre sessão e JWT e mostra onde seu código impede SQL injection.

## Fase 2 · Portfólio (meses 7–12)

### 8. React e Next.js · mês 7

**Objetivo:** Construir interfaces com React e publicá-las com Next.js.

**Tópicos**

1. **Componentes e JSX:** Componente é uma função que retorna UI; JSX, props e composição.
2. **Estado:** `useState`, estado mínimo, derivar em vez de duplicar, elevar estado.
3. **Eventos e formulários:** Inputs controlados, `onSubmit`, validação no cliente.
4. **Listas e chaves:** `map` para renderizar listas e por que a `key` precisa ser estável.
5. **Efeitos:** `useEffect` só para sincronizar com algo fora do React; quando não usar.
6. **App Router:** Pastas viram rotas; `layout`, `page`, rotas dinâmicas, `loading` e `error`.
7. **Server x Client Components:** O que roda no servidor, quando usar `"use client"`, buscar dados no servidor.
8. **Renderização:** SSR, SSG e revalidação: o problema que cada uma resolve.
9. **Acessibilidade básica:** HTML semântico, `label` em todo campo, foco visível, contraste.

**Recursos**

- [react.dev (Learn)](https://react.dev/learn) (documentação)
- [Next.js Learn](https://nextjs.org/learn) (curso)
- [Learn Accessibility (web.dev)](https://web.dev/learn/accessibility) (curso)

**Mini-projeto:** Front do encurtador: login, lista de links e estatísticas de acesso.

**Pronto quando:** Você explica quando um componente precisa de `"use client"` e busca dados sem `useEffect`.

### 9. Testes · mês 8

**Objetivo:** Testar com estratégia: rápido, confiável e no nível certo.

**Tópicos**

1. **Por que testar:** Teste como rede de segurança para refatorar; o que vale e o que não vale testar.
2. **Pirâmide de testes:** Muitos unitários, alguns de integração, poucos e2e; custo x confiança.
3. **Vitest:** `describe`/`it`/`expect`, `beforeEach`, testes isolados e determinísticos.
4. **Dublês:** Mock, stub e fake; congelar a data (como o `opcoes.agora` deste projeto).
5. **Testes de integração:** API + banco real em memória; preparar e limpar dados entre testes.
6. **Testing Library:** Testar componentes como o usuário usa: por texto e papel, não por classe CSS.
7. **Playwright:** E2E no navegador: fluxo completo, seletores estáveis, rodar no CI.
8. **TDD na prática:** Vermelho, verde, refatorar, aplicado a um bug real.
9. **Cobertura:** Ler o relatório e entender por que 100% não é a meta.

**Recursos**

- [Guia do Vitest](https://vitest.dev/guide/) (documentação)
- [Testing Library](https://testing-library.com/docs/) (documentação)
- [Playwright](https://playwright.dev/docs/intro) (documentação)

**Mini-projeto:** E2E do fluxo principal do encurtador: login, criar link, acessar e ver a contagem.

**Pronto quando:** Você escreve o teste antes de corrigir um bug, e o CI roda os unitários e os e2e.

### 10. Docker e deploy · mês 9

**Objetivo:** Empacotar a aplicação e colocá-la no ar de forma reproduzível.

**Tópicos**

1. **Containers:** Imagem x container, e por que "funciona na minha máquina" deixa de ser problema.
2. **Dockerfile:** `FROM`, `COPY`, `RUN`, `CMD`, cache de camadas e `.dockerignore`.
3. **Imagens enxutas:** Multi-stage build, imagem `node:22-slim`, rodar sem root.
4. **Docker Compose:** App + PostgreSQL juntos, rede entre serviços, volumes para não perder dados.
5. **Configuração:** Variáveis de ambiente (12-factor) e segredos fora da imagem.
6. **Migrações no deploy:** Rodar as migrações antes de subir a nova versão.
7. **Deploy gerenciado:** Render, Fly.io ou Railway: build, variáveis, logs e domínio.
8. **Healthcheck:** Rota `/status` e o que a plataforma faz quando ela falha.

**Recursos**

- [Docker: Get started](https://docs.docker.com/get-started/) (documentação)
- [Docker Compose](https://docs.docker.com/compose/) (documentação)
- [The Twelve-Factor App: Config](https://12factor.net/pt_br/config) (artigo)

**Mini-projeto:** Encurtador + PostgreSQL no Docker Compose, publicado, com o link no README.

**Pronto quando:** Qualquer pessoa sobe o projeto com `docker compose up`, e o app está no ar.

### 11. CI/CD · mês 10

**Objetivo:** Automatizar teste e deploy a cada mudança.

**Tópicos**

1. **CI x CD:** Integração contínua (testar cada mudança) x entrega e implantação contínuas.
2. **GitHub Actions:** Workflow, evento (`on`), job, step e runner; ler o `ci.yml` deste projeto.
3. **Cache e matriz:** Cache do npm e testar em mais de uma versão do Node.
4. **Serviços no CI:** Subir PostgreSQL como serviço para os testes de integração.
5. **Segredos no CI:** GitHub Secrets e variáveis por ambiente; nunca imprimir segredo no log.
6. **Proteção de branch:** Exigir CI verde e revisão antes do merge na `main`.
7. **Deploy automático:** Deploy a cada merge na `main` e como voltar atrás quando der errado.
8. **Versões:** Tags, releases e changelog.

**Recursos**

- [Documentação do GitHub Actions](https://docs.github.com/pt/actions) (documentação)
- [Continuous Integration (Martin Fowler)](https://martinfowler.com/articles/continuousIntegration.html) (artigo)

**Mini-projeto:** Pipeline completo do encurtador: testes e e2e em cada PR, deploy a cada merge.

**Pronto quando:** Um merge na `main` chega à produção sem nenhum passo manual.

### 12. AWS Cloud Practitioner · meses 11–12

**Objetivo:** Entender os fundamentos de cloud e conquistar a primeira certificação.

**Tópicos**

1. **Conceitos de cloud:** IaaS, PaaS e SaaS; regiões e zonas; modelo de responsabilidade compartilhada.
2. **Computação:** EC2, Lambda e contêineres (ECS/Fargate): quando usar cada um.
3. **Armazenamento:** S3, EBS e classes de armazenamento.
4. **Bancos de dados:** RDS x DynamoDB: quando escolher relacional ou chave-valor.
5. **Redes:** VPC, sub-redes, security groups e CloudFront.
6. **Segurança e IAM:** Usuários, papéis, políticas, MFA e menor privilégio.
7. **Custos:** Modelos de preço, Free Tier, Budgets e Cost Explorer.
8. **Prova:** Formato da prova, simulado oficial e revisão dos pontos fracos.

**Recursos**

- [AWS Skill Builder](https://skillbuilder.aws/) (curso)
- [Certificação AWS Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/) (documentação)

**Mini-projeto:** Publicar o front do encurtador como site estático no S3 + CloudFront, dentro do Free Tier.

**Pronto quando:** Certificação AWS Cloud Practitioner aprovada.

## Depois do mês 12

System design básico, um projeto com usuários reais e entrevistas técnicas. Detalhar quando chegar lá.

## Contínuo

- **Inglês (conversação):** prática semanal de conversa; explicar em voz alta, em inglês, o mini-projeto do mês.
- **Progresso:** tópicos, horas e autoavaliação registrados na API (`PATCH /topicos/:id`, `POST /sessions`, `PATCH /skills/:id`).
