> **Tempo estimado:** 35 min · **Fontes:** Node.js Learn (*Introduction to Node.js*, *Differences between Node.js and the browser*, *How to read environment variables*) · documentação da CLI do Node

## Em poucas palavras

O **Node.js** roda JavaScript **fora do navegador**, usando o mesmo motor do Chrome (o V8). Em vez de mexer na página (DOM), ele acessa arquivos, rede e processos, e é por isso que serve para servidores, scripts e ferramentas de linha de comando.

O ponto central do modelo: uma aplicação Node roda **num único processo, com uma linha de execução para o seu código**, e quase todo I/O (rede, disco, banco) é **assíncrono**. Enquanto espera o banco responder, o Node atende outras requisições. Isso permite milhares de conexões simultâneas sem criar uma thread para cada uma, desde que você **não bloqueie** o event loop (veja o tópico *Event loop* do módulo 2).

## Node x navegador

| | Navegador | Node |
|---|---|---|
| `window`, `document`, DOM | Sim | **Não existem** |
| Arquivos, processos, sockets | Não | Sim (`node:fs`, `node:child_process`...) |
| Quem escolhe a versão do JavaScript | O usuário (o navegador dele) | **Você** (a versão do Node instalada) |
| Variável global | `window` / `globalThis` | `globalThis` (e `process`) |

## O objeto `process`

`process` é global e descreve o processo atual:

```js
process.argv;         // argumentos da linha de comando: ["node", "script.js", "js/01"]
process.env.PORT;     // variáveis de ambiente (sempre string ou undefined)
process.exitCode = 1; // código de saída: 0 = sucesso; outro valor = erro
```

O `src/scripts/exercicio.js` deste projeto lê o exercício pedido em `process.argv[2]` e define `process.exitCode` conforme os testes passam ou não.

## Variáveis de ambiente

Configuração que muda entre ambientes (porta, caminho do banco, chaves) vai em **variáveis de ambiente**, e não no código. Este projeto lê `PORT` e `DB_PATH`:

```js
const port = Number(process.env.PORT ?? 3000);   // src/server.js
```

Como definir:

```bash
# Linux/macOS e Git Bash:
PORT=4000 node src/server.js
```

```powershell
# PowerShell: define para a sessão do terminal
$env:PORT = "4000"; node src/server.js
```

Ou num arquivo `.env` (fora do Git!) carregado pelo próprio Node: `node --env-file=.env src/server.js`. Se a mesma variável existir no ambiente e no arquivo, vale a do ambiente.

## `node --watch`

`node --watch arquivo.js` reinicia o processo sempre que o arquivo, ou qualquer módulo que ele importa, muda. É estável desde o Node 22 e é o que o `npm run dev` deste projeto usa.

## Na prática

```bash
node --version                 # a versão que você instalou (22.x)
node                           # abre o REPL: digite 1 + 1, process.platform, .exit para sair
node -e "console.log(process.argv)" a b c
```

Crie `ola.mjs` com o conteúdo abaixo e rode com e sem a variável `NOME` definida (no PowerShell: `$env:NOME = "Vini"; node ola.mjs`):

```js
console.log(`Olá, ${process.env.NOME ?? "mundo"}!`);
```

## Armadilhas comuns

- **Usar `document` ou `window` no Node**: `ReferenceError`.
- **Esquecer que `process.env` só tem strings**: `process.env.PORT + 1` dá `"30001"`. Converta com `Number(...)`.
- **Sintaxe Unix (`PORT=4000 node ...`) no PowerShell**: não funciona. Use `$env:PORT = "4000"`.
- **Código síncrono pesado numa rota**: bloqueia o servidor para todo mundo.

## Leia na documentação oficial

1. [Node.js · Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs): o modelo de execução e um primeiro servidor HTTP.
2. [Node.js · Differences between Node.js and the Browser](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser).
3. [Node.js · How to read environment variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs): `process.env` e `--env-file`.
4. [Node.js CLI · --watch](https://nodejs.org/api/cli.html#--watch) e [--env-file](https://nodejs.org/api/cli.html#--env-filefile): a referência das duas opções.

## Confira se entendeu

<details><summary>Por que o Node aguenta muitas conexões com uma única linha de execução?</summary>

Porque o I/O é assíncrono: enquanto espera rede ou disco, o Node continua atendendo outras requisições, e o callback roda quando o resultado chega.
</details>

<details><summary>Qual o tipo de <code>process.env.PORT</code>?</summary>

String (ou `undefined`, se não estiver definida). Converta com `Number(...)` antes de fazer contas.
</details>

<details><summary>Como definir <code>PORT=4000</code> no PowerShell antes de rodar o servidor?</summary>

`$env:PORT = "4000"` e, em seguida, `node src/server.js`.
</details>

<details><summary>O que o <code>--watch</code> do <code>npm run dev</code> faz?</summary>

Reinicia o processo sempre que o arquivo principal, ou algum módulo importado por ele, é alterado.
</details>
