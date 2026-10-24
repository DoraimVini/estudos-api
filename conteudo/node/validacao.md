> **Tempo estimado:** 40 min · **Fontes:** OWASP (*Input Validation Cheat Sheet*) · MDN (*Client-side form validation*, status `400`)

## Em poucas palavras

**Nunca confie no que vem de fora**: corpo, query string, parâmetros de rota, headers. A validação no navegador é conforto para o usuário, e não segurança, porque qualquer um pode chamar a API direto com `curl`. O servidor valida **tudo**, de novo, antes de usar.

Validar bem tem duas partes:

- **Sintática**: o formato está certo? É número, é uma data `AAAA-MM-DD`, o texto tem de 3 a 100 caracteres?
- **Semântica**: faz sentido? A data de fim vem depois da de início? O tópico existe?

## Lista de permitidos, e não de proibidos

A OWASP é clara: **defina o que é aceito e rejeite o resto** (*allowlist*). Tentar listar o que é perigoso (*denylist*) sempre esquece algum caso.

```js
// allowlist: só esses valores passam
const STATUS = ["Não iniciado", "Em andamento", "Concluído"];
if (!STATUS.includes(body.status)) { /* 400 */ }

// campos extras também são rejeitados: evita erro de digitação silencioso e campos que o cliente não deveria mandar
const permitidos = ["hoje", "meta", "status"];
const extras = Object.keys(body).filter((k) => !permitidos.includes(k));
```

Este projeto faz isso em `src/validators.js`: `validarStatus`, `parseId` e `somenteCampos` (que recusa campos desconhecidos, como um `{"nota": 3}` mandado no lugar de `{"hoje": 3}`).

## O que validar, na prática

| Entrada | Verifique |
|---|---|
| Ids na URL (`/skills/:id`) | É inteiro positivo? (`"abc"`, `"-1"`, `"1.5"` → `400`) |
| Textos | Tipo `string`, tamanho mínimo e máximo, depois de `.trim()` |
| Números | `Number.isInteger`, faixa (`1 a 1440` minutos) |
| Datas | Formato **e** data real (`2026-02-30` não existe) |
| Valores fixos | Pertence à lista (allowlist) |
| O corpo inteiro | É um objeto? Tem campos extras? |

## Respondendo ao erro

- Status **`400 Bad Request`** (alguns projetos usam `422` para dado bem formado, mas inválido; escolha um e seja consistente).
- Mensagem que **ajude a corrigir**: "minutos deve ser um inteiro entre 1 e 1440", e não "dados inválidos".
- Se possível, **todos os erros de uma vez**, para o cliente não corrigir um, reenviar, e descobrir o próximo.

## Validação não substitui outras defesas

Validar a entrada **reduz** riscos, mas não dispensa as defesas específicas. Contra SQL injection, use **consultas parametrizadas** (os `?` dos repositórios deste projeto). Contra XSS, **escape a saída** (o `esc()` do painel). Quem pode fazer o quê é **autorização**, outro assunto.

## Na prática

Com a API rodando, tente quebrá-la com `curl.exe` e confira que cada caso devolve `400` com uma mensagem útil:

```powershell
curl.exe -i -X PATCH http://localhost:3000/api/v1/skills/abc -H "Content-Type: application/json" -d '{}'
curl.exe -i -X PATCH http://localhost:3000/api/v1/skills/1 -H "Content-Type: application/json" -d '{\"hoje\": 9}'
curl.exe -i -X PATCH http://localhost:3000/api/v1/skills/1 -H "Content-Type: application/json" -d '{\"nota\": 3}'
```

**JSON no PowerShell 5.1**: use **aspas simples por fora e `\"` por dentro**, exatamente como acima. Com `'{"hoje": 9}'` (sem as barras), o PowerShell remove as aspas internas ao passar o texto para o `curl.exe`, e a API responde "JSON inválido". No Git Bash, basta `'{"hoje": 9}'`.

Depois leia o `src/validators.js` e encontre a linha responsável por cada resposta.

**Cuidado**: o `{"hoje": 9}` foi recusado, mas um valor **válido** seria gravado no seu `estudos.db` de verdade. Para experimentar à vontade, suba uma cópia da API com outro banco: `$env:DB_PATH = "teste.db"; $env:PORT = "3001"; npm.cmd run dev`.

## Armadilhas comuns

- **Validar só no front-end.**
- **Aceitar campos extras sem avisar**: `{"titlo": "x"}`, com erro de digitação, é ignorado em silêncio, e o título fica vazio.
- **`Number("")` dá `0`** e `Number("  ")` também: valide a string antes de converter.
- **Regex sem âncoras** (`/\d{4}-\d{2}-\d{2}/` aceita `"lixo2026-01-01lixo"`). Use `^...$`.
- **Mensagens que vazam detalhes internos** (stack trace, SQL) em vez de explicar o campo.

## Leia na documentação oficial

1. [OWASP · Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html): leia [Input validation strategies](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#input-validation-strategies), [Allowlist vs Denylist](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#allowlist-vs-denylist) e [Common pitfalls](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#common-pitfalls).
2. [MDN · Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation#what_is_form_validation): por que a validação do navegador nunca substitui a do servidor.
3. [MDN · 400 Bad Request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/400) e [422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422).

## Pratique

Exercício com correção automática: **node/04 · Validar o corpo de uma requisição** (todos os erros de uma vez, campos extras recusados e datas que existem de verdade).

```bash
npm run exercicio node/04
```

## Confira se entendeu

<details><summary>Por que validar no servidor se o formulário já valida?</summary>

Porque qualquer um pode chamar a API direto, sem passar pelo formulário. A validação do navegador é só conforto para o usuário.
</details>

<details><summary>O que é allowlist, e por que a OWASP prefere?</summary>

É definir o que é aceito e recusar todo o resto. É mais segura que listar o que é proibido, porque essa lista sempre esquece algum caso.
</details>

<details><summary>Por que recusar campos que a API não conhece?</summary>

Para pegar erros de digitação (que seriam ignorados em silêncio) e impedir que o cliente mande campos que não deveria controlar.
</details>

<details><summary>Validar a entrada protege contra SQL injection?</summary>

Ajuda, mas não basta. A defesa certa contra SQL injection são as consultas parametrizadas.
</details>
