> **Tempo estimado:** 40 min · **Fontes:** documentação do npm (`package.json`, `package-lock.json`, `npm ci`, scripts) · semver.org

## Em poucas palavras

O **npm** instala bibliotecas (pacotes) e roda os scripts do projeto. Tudo gira em torno de dois arquivos:

- **`package.json`**: o que o projeto **declara** precisar (nomes e faixas de versão) e os scripts.
- **`package-lock.json`**: a árvore **exata** que foi instalada, com cada pacote e cada sub-dependência na versão precisa. Ele vai para o Git, para que todo mundo, e o CI, instale exatamente o mesmo.

A pasta `node_modules/` é recriada a partir deles e **não** vai para o Git.

## `dependencies` x `devDependencies`

```json
"dependencies": {
  "express": "^5.1.0",
  "marked": "18.0.14"
},
"devDependencies": {
  "supertest": "^7.1.0",
  "vitest": "^3.2.0"
}
```

- **`dependencies`**: o que o código precisa **para rodar** (o Express, por exemplo).
- **`devDependencies`**: o que só serve **para desenvolver**: testes, ferramentas de build. Quem só roda o projeto em produção pode pular essas.

```bash
npm install express          # vai para dependencies
npm install -D vitest        # -D: vai para devDependencies
npm uninstall marked
```

## Versões e o `^`

As versões seguem o **versionamento semântico**, `MAIOR.MENOR.CORREÇÃO`:

- **MAIOR** (5.x.x → 6.0.0): mudança que **quebra** compatibilidade;
- **MENOR** (5.1 → 5.2): funcionalidade nova compatível;
- **CORREÇÃO** (5.1.0 → 5.1.1): correção de bug compatível.

| No `package.json` | Aceita |
|---|---|
| `"18.0.14"` | exatamente essa |
| `"~5.1.0"` | correções: `>=5.1.0 <5.2.0` |
| `"^5.1.0"` | menores e correções: `>=5.1.0 <6.0.0` |

Atenção: abaixo de 1.0.0 o `^` é mais restrito (`^0.4.2` não aceita `0.5.0`), porque em `0.x` tudo pode mudar a qualquer momento.

O `marked` deste projeto está **fixo** (`18.0.14`, sem `^`) de propósito: escolhemos uma versão com mais de duas semanas de uso, e ela só muda quando alguém decidir.

## Scripts

```json
"scripts": {
  "dev": "node --no-warnings=ExperimentalWarning --watch src/server.js",
  "test": "vitest run"
}
```

`npm run dev` e `npm test` rodam esses comandos com `node_modules/.bin` no PATH. É por isso que `vitest` funciona aí sem estar instalado globalmente. `test` e `start` têm atalho (`npm test`, `npm start`); os outros precisam de `npm run nome`.

## `npm install` x `npm ci`

| | `npm install` | `npm ci` |
|---|---|---|
| Pode alterar o `package-lock.json` | Sim | **Nunca** |
| Se o `package.json` e o lock divergem | Ajusta o lock | **Falha** |
| `node_modules` existente | Reaproveita | **Apaga e reinstala** |
| Uso | Desenvolvimento, adicionar pacotes | **CI** e instalações reproduzíveis |

O CI deste projeto (`.github/workflows/ci.yml`) usa `npm ci`.

## Na prática

```bash
npm ls --depth=0        # o que está instalado no primeiro nível
npm outdated            # quais pacotes têm versão mais nova
npm view express version
npm run                 # lista todos os scripts do projeto
```

No PowerShell, se `npm` der erro de "execução de scripts", use `npm.cmd` (ou libere com `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`).

## Armadilhas comuns

- **Não versionar o `package-lock.json`**: cada máquina instala uma árvore diferente, e "na minha máquina funciona".
- **Versionar `node_modules/`.**
- **Ferramenta de teste em `dependencies`.**
- **Instalar pacote para algo que o Node já faz** (ler arquivo, gerar UUID com `crypto.randomUUID()`, `fetch`).
- **Atualizar uma versão MAIOR sem ler o changelog**: ela pode quebrar o projeto, por definição.

## Leia na documentação oficial

1. [npm · package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json): leia [dependencies](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#dependencies), [devDependencies](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#devdependencies) e [scripts](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#scripts).
2. [npm · package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json): para que serve e por que vai para o Git.
3. [npm · npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci): as diferenças em relação ao `npm install`.
4. [Versionamento Semântico 2.0.0](https://semver.org/lang/pt-BR/) (em português): a especificação de MAIOR.MENOR.CORREÇÃO.

## Confira se entendeu

<details><summary>Qual a diferença entre <code>package.json</code> e <code>package-lock.json</code>?</summary>

O `package.json` declara o que o projeto precisa, com faixas de versão. O lock registra a árvore exata que foi instalada, para que todos instalem o mesmo.
</details>

<details><summary>Com <code>"^5.1.0"</code>, a versão 6.0.0 seria instalada? E a 5.3.2?</summary>

A 6.0.0 não (mudança MAIOR pode quebrar). A 5.3.2 sim.
</details>

<details><summary>Por que o CI usa <code>npm ci</code> e não <code>npm install</code>?</summary>

Porque `npm ci` instala exatamente o que está no lock, falha se ele estiver inconsistente e nunca o altera. Assim o CI testa o mesmo que você tem.
</details>

<details><summary>Onde vai o Vitest: <code>dependencies</code> ou <code>devDependencies</code>?</summary>

Em `devDependencies`: ele só é usado para desenvolver, e não para rodar a API.
</details>
