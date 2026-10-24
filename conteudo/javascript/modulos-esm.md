> **Tempo estimado:** 35 min · **Fontes:** MDN, guia *JavaScript modules* · Node.js, *Modules: Packages* (como o Node decide entre ESM e CommonJS)

## Em poucas palavras

Um **módulo** é um arquivo com escopo próprio: o que está dentro dele é privado, a não ser que você **exporte**. Quem precisa **importa**. Isso permite dividir o código em arquivos pequenos, cada um com uma responsabilidade, sem variáveis globais se esbarrando.

O padrão oficial da linguagem são os **ES Modules** (ESM), com `import`/`export`. O Node também tem um sistema mais antigo, o **CommonJS** (`require`/`module.exports`). Você vai encontrar os dois, mas **projetos novos usam ESM**, como este.

## export e import

```js
// datas.js
export const FUSO = "America/Sao_Paulo";       // export nomeado
export function hojeISO() { /* ... */ }        // export nomeado
export default function formatar() { /* ... */ }  // export default (no máximo um por arquivo)

// app.js
import formatar, { FUSO, hojeISO } from "./datas.js";   // default sem chaves, nomeados com chaves
import { hojeISO as hoje } from "./datas.js";           // renomeando
import * as datas from "./datas.js";                    // tudo num objeto: datas.FUSO, datas.hojeISO
```

| | Nomeado | Default |
|---|---|---|
| Quantos por arquivo | Vários | No máximo um |
| No import | `{ nome }`: precisa ser o nome exato | Qualquer nome, sem chaves |
| Vantagem | O editor acha e renomeia com segurança | Bom para "a coisa principal" do arquivo |

Este projeto usa quase só exports nomeados. As páginas do painel (`public/js/paginas/*.js`) usam `export default`, porque cada arquivo é uma página só.

## Coisas que só módulos fazem

- **Escopo próprio**: `const x` num módulo não vira global.
- **Strict mode automático**: erros silenciosos viram erros de verdade, e `this` solto é `undefined`.
- **Executam uma vez só**, mesmo se importados por vários arquivos.
- **Imports são "ao vivo" e somente leitura**: você não pode reatribuir uma variável importada.
- **`await` no nível do arquivo** (*top-level await*) é permitido.
- **`import()` dinâmico** carrega um módulo sob demanda e devolve uma Promise.

## Como o Node decide se é ESM

1. Arquivo **`.mjs`**: sempre ESM. Arquivo **`.cjs`**: sempre CommonJS.
2. Arquivo **`.js`**: depende do `"type"` no `package.json` mais próximo. `"type": "module"` faz dele ESM; sem `"type"`, ou com `"commonjs"`, é CommonJS.

O `package.json` deste projeto tem `"type": "module"`. É por isso que todos os `.js` daqui podem usar `import`. A documentação do Node recomenda **sempre declarar o `"type"`**, mesmo em projetos CommonJS.

## Na prática

Crie uma pasta com dois arquivos e rode `node app.mjs`:

```js
// matematica.mjs
export const somar = (a, b) => a + b;
const segredo = 42;            // não exportado: invisível de fora

// app.mjs
import { somar } from "./matematica.mjs";
console.log(somar(2, 3));       // 5
// tente importar { segredo }: o Node acusa erro de sintaxe ao carregar
```

Depois abra `src/app.js` deste projeto e siga os imports até os arquivos de origem.

## Armadilhas comuns

- **Esquecer a extensão** no import relativo: `"./datas"` não funciona no navegador nem no ESM do Node. Use `"./datas.js"`.
- **Chaves trocadas**: `import formatar from` (default) x `import { formatar } from` (nomeado). Se der `undefined` ou "does not provide an export named", confira qual dos dois o arquivo exporta.
- **Misturar `require` e `import`** num mesmo arquivo `.js` com `"type": "module"`: `require` não existe ali.
- **Abrir um HTML com módulos direto pelo arquivo** (`file://`): o navegador bloqueia. Módulos precisam de um servidor, e por isso o painel só funciona em `http://localhost:3000`.

## Leia na documentação oficial

1. [MDN · JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules): leia [Exporting module features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#exporting_module_features), [Importing features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_features_into_your_script), [Default exports versus named exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#default_exports_versus_named_exports) e [Other differences between modules and classic scripts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#other_differences_between_modules_and_classic_scripts).
2. [Node.js · Determining module system](https://nodejs.org/api/packages.html#determining-module-system): as regras de `.mjs`, `.cjs` e do campo [`"type"`](https://nodejs.org/api/packages.html#type).

## Confira se entendeu

<details><summary>Qual a diferença de sintaxe ao importar um export default e um nomeado?</summary>

Default: sem chaves, com qualquer nome (`import formatar from "./x.js"`). Nomeado: com chaves e o nome exato (`import { hojeISO } from "./x.js"`), ou com `as` para renomear.
</details>

<details><summary>Por que os <code>.js</code> deste projeto podem usar <code>import</code>?</summary>

Porque o `package.json` declara `"type": "module"`, o que faz o Node tratar os `.js` como ES Modules.
</details>

<details><summary>Uma variável <code>const</code> declarada num módulo, sem <code>export</code>, pode ser usada em outro arquivo?</summary>

Não. Ela existe só no escopo daquele módulo.
</details>

<details><summary>Por que o painel não funciona abrindo o <code>index.html</code> direto pelo explorador de arquivos?</summary>

Porque o navegador não carrega módulos ES a partir de `file://`. Eles precisam ser servidos por HTTP, como o Express faz em `localhost:3000`.
</details>
