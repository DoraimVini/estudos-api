# Ler arquivos com fs/promises

**Módulo 4 · Node e APIs REST · tópico: Módulos nativos**

O Node já vem com módulos para arquivos, caminhos e URLs, sem instalar nada. Aqui você usa `node:fs/promises` e `node:path` com `async`/`await`. A pasta `dados/` tem arquivos de exemplo para os testes.

## O que fazer

Complete as funções em `solucao.js` (todas são `async`):

1. **`contarLinhas(caminho)`**: quantidade de linhas **com conteúdo** do arquivo. Linhas vazias ou só com espaços não contam.
2. **`lerJson(caminho)`**: lê e devolve o objeto do arquivo JSON. Erros precisam ser claros:
   - arquivo inexistente: `Error` com a mensagem `Arquivo não encontrado: <nome do arquivo>`;
   - JSON quebrado: `Error` com a mensagem `JSON inválido em <nome do arquivo>`.

   `<nome do arquivo>` é só o nome (`config.json`), não o caminho inteiro.
3. **`listarArquivos(pasta, extensao)`**: nomes dos arquivos da pasta que terminam com `extensao` (ex.: `".json"`), em ordem alfabética.

## Dicas
- `readFile(caminho, "utf8")`, `readdir(pasta)` e `path.basename(caminho)`.
- O erro de arquivo inexistente tem `err.code === "ENOENT"`. Erros que não forem esses dois casos devem ser relançados como estão.
- `JSON.parse` lança `SyntaxError` quando o texto é inválido.

## Rodar

```bash
npm run exercicio node/01
```

## Pronto quando
Os testes passam e você sabe por que a versão `async` (`fs/promises`) é preferível a `readFileSync` dentro de um servidor.
