> **Tempo estimado:** 45 min · **Fontes:** documentação da API do Node (`fs`, `path`, `import.meta`)

## Em poucas palavras

O Node já vem com dezenas de **módulos nativos**: arquivos (`node:fs`), caminhos (`node:path`), URLs (`node:url`), criptografia (`node:crypto`), HTTP (`node:http`)... Antes de instalar um pacote, vale conferir se o Node já faz aquilo. O prefixo `node:` no import deixa claro que o módulo é nativo.

## Arquivos com `node:fs/promises`

O `fs` tem três estilos: **com Promise** (`node:fs/promises`), com callback e **síncrono** (`readFileSync`...). Num servidor, prefira **Promises**: as versões `Sync` **bloqueiam o event loop** até o disco responder.

```js
import { readFile, writeFile, mkdir } from "node:fs/promises";

const texto = await readFile("anotacoes.txt", "utf8");    // sem "utf8", vem um Buffer (bytes)
await mkdir("saida", { recursive: true });                // cria a pasta (e as de cima), sem erro se já existir
await writeFile("saida/copia.txt", texto.toUpperCase());  // cria ou sobrescreve
```

Se o arquivo não existir, a Promise é rejeitada com um erro de `code === "ENOENT"`. É assim que se diferencia "não existe" de outros problemas, como falta de permissão.

Os `Sync` têm lugar em scripts curtos que rodam uma vez e saem, ou na inicialização. Este projeto usa `readFileSync` para ler o `seed.json` e o `trilha.json` ao abrir o banco. Dentro de rotas, há duas exceções conscientes: o enunciado dos exercícios (`GET /exercicios/:id`) e o conteúdo dos tópicos (`GET /topicos/:id`). São arquivos pequenos e locais, numa API de um usuário só. Num servidor com muito tráfego, o certo seria trocar pela versão com Promise, e isso é um bom exercício.

## Caminhos com `node:path`

Nunca monte caminho concatenando strings com `/`: no Windows o separador é `\`.

```js
import path from "node:path";

path.join("dados", "2026", "notas.txt");   // "dados\2026\notas.txt" no Windows, "dados/2026/notas.txt" no Linux
path.resolve("dados");                     // caminho ABSOLUTO a partir da pasta atual
path.basename("C:\\docs\\relatorio.pdf");  // "relatorio.pdf"
path.extname("relatorio.pdf");             // ".pdf"
path.dirname("/a/b/c.txt");                // "/a/b"
```

## "A pasta deste arquivo" em ESM

Caminhos relativos em `readFile("x.txt")` partem de **onde o terminal está** (`process.cwd()`), e não de onde o arquivo `.js` está. Para ler um arquivo **ao lado do módulo**:

```js
// Node 22.16+: estável
const caminho = path.join(import.meta.dirname, "dados", "config.json");

// Forma clássica, que funciona em qualquer versão com ESM (é a usada neste projeto)
const url = new URL("./dados/config.json", import.meta.url);
const config = JSON.parse(await readFile(url, "utf8"));
```

Em ESM **não existem** `__dirname` e `__filename` (são do CommonJS). Os substitutos são `import.meta.dirname` e `import.meta.filename`.

## Na prática

1. Crie `listar.mjs` que lê o próprio código-fonte (`import.meta.filename`) e imprime quantos caracteres ele tem.
2. Rode a partir de outra pasta (`node ..\pasta\listar.mjs`) e confirme que ainda funciona. Depois troque por `readFile("listar.mjs")` e veja quebrar.
3. Leia `src/db/exercicios.js` deste projeto: ele usa `new URL(..., import.meta.url)` para achar a pasta `exercicios/`.

## Armadilhas comuns

- **`readFileSync` dentro de rota**: trava o servidor durante a leitura.
- **Esquecer o `"utf8"`**: você recebe um `Buffer`, e não texto.
- **Caminhos relativos ao terminal** em vez de relativos ao arquivo.
- **Concatenar caminhos com `/` ou `\`** em vez de usar `path.join`.
- **Usar `__dirname` em ESM**: `ReferenceError`.

## Leia na documentação oficial

1. [Node.js · File system: Promises API](https://nodejs.org/api/fs.html#promises-api): veja [readFile](https://nodejs.org/api/fs.html#fspromisesreadfilepath-options), [writeFile](https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options) e [readdir](https://nodejs.org/api/fs.html#fspromisesreaddirpath-options).
2. [Node.js · Path](https://nodejs.org/api/path.html): `join`, `resolve`, `basename`, `extname` e as diferenças entre Windows e POSIX.
3. [Node.js · import.meta.dirname](https://nodejs.org/api/esm.html#importmetadirname) e [Sem __filename e __dirname em ESM](https://nodejs.org/api/esm.html#no-__filename-or-__dirname).

## Pratique

Exercício com correção automática: **node/01 · Ler arquivos com fs/promises**.

```bash
npm run exercicio node/01
```

## Confira se entendeu

<details><summary>Por que preferir <code>fs/promises</code> a <code>readFileSync</code> num servidor?</summary>

Porque a versão síncrona bloqueia o event loop até a leitura terminar, e nenhuma outra requisição é atendida nesse tempo.
</details>

<details><summary>Como saber se uma leitura falhou porque o arquivo não existe?</summary>

O erro tem `code === "ENOENT"`.
</details>

<details><summary>Por que usar <code>path.join</code> em vez de <code>"pasta/" + nome</code>?</summary>

Porque `path.join` usa o separador do sistema (`\` no Windows, `/` no Linux) e normaliza o resultado (remove barras duplicadas, resolve `..`).
</details>

<details><summary>Um caminho relativo em <code>readFile("dados.json")</code> parte de onde?</summary>

Da pasta atual do terminal (`process.cwd()`), e não da pasta do arquivo `.js`. Para partir do arquivo, use `import.meta.dirname` ou `new URL(..., import.meta.url)`.
</details>
