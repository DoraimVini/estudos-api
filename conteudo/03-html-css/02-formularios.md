> **Tempo estimado:** 45 min · **Fontes:** MDN (*Your first form*, *Client-side form validation*)

## Em poucas palavras

Formulário é como o usuário **manda dados**: login, cadastro, registro de uma sessão de estudo. Um bom formulário tem **rótulo em todo campo**, o **tipo certo de campo** (o celular mostra o teclado certo) e **validação nativa** do navegador, mas **nunca confia só nela**: o servidor valida de novo.

## A estrutura

```html
<form action="/registrar" method="post">
  <label for="minutos">Minutos estudados</label>
  <input id="minutos" name="minutos" type="number" min="1" max="1440" required>

  <label for="notas">Notas</label>
  <textarea id="notas" name="notas" rows="3"></textarea>

  <button type="submit">Registrar</button>
</form>
```

- **`<label for="x">` + `id="x"`**: liga o rótulo ao campo. O leitor de tela lê o rótulo, e **clicar no texto foca o campo**.
- **`name`**: o nome com que o valor é enviado (`minutos=50`). Campo sem `name` não é enviado.
- **`action` e `method`**: para onde e como enviar. Sem JavaScript, o próprio navegador faz o envio, no formato `minutos=50&notas=...`, e a página recarrega com a resposta.

O painel de estudos não usa `action`: ele intercepta o envio (`submit`) com JavaScript e manda **JSON** com `fetch`, porque é isso que a API espera. O HTML do formulário, com labels, tipos e validação, é o mesmo nos dois casos.

## Tipos de `<input>`

| `type` | Para quê | Bônus |
|---|---|---|
| `text` | Texto livre (é o padrão) | |
| `email` | E-mail | Valida o formato; teclado com `@` no celular |
| `number` | Número | Setas; `min`, `max` e `step` |
| `date` | Data | Calendário nativo |
| `password` | Senha | Esconde os caracteres |
| `checkbox` / `radio` | Escolhas | `radio` com o mesmo `name` forma um grupo |

## O `type` do botão

Dentro de um `<form>`, **todo `<button>` é `submit` por padrão**. Um botão "Cancelar" sem `type="button"` **envia o formulário**. Sempre declare: `type="submit"` para enviar e `type="button"` para ações em JavaScript.

## Validação nativa

```html
<input type="text" name="titulo" required minlength="3" maxlength="100">
<input type="email" name="email" required>
<input type="text" name="cep" pattern="\d{5}-?\d{3}" title="CEP: 12345-678">
```

O navegador bloqueia o envio e mostra a mensagem. No CSS, `:invalid` marca campos inválidos, e `:user-invalid` só marca **depois que o usuário mexeu no campo**, para não mostrar erro em vermelho antes de ele digitar.

```css
input:user-invalid { border-color: crimson; }
```

**A validação no navegador é conforto, não segurança.** Qualquer pessoa pode enviar uma requisição sem passar pelo formulário (com `curl`, por exemplo). Por isso esta API valida tudo de novo em `src/validators.js`.

## Na prática

1. No painel de estudos, inspecione (F12) o formulário do Pomodoro: veja os `<label for>`, o `type="number"`, o `min` e o `required`.
2. Tente registrar uma sessão com o campo de minutos vazio: o navegador bloqueia antes de chamar a API.
3. Crie um formulário de cadastro com nome (obrigatório, de 3 a 50 caracteres), e-mail e data de nascimento, e teste cada regra.

## Armadilhas comuns

- **Placeholder no lugar de label**: some quando o usuário digita, tem contraste baixo e muitos leitores de tela não o anunciam.
- **Botão sem `type`** dentro do formulário, enviando sem querer.
- **Campo sem `name`**: o valor não vai.
- **Confiar só na validação do HTML.**

## Leia na documentação oficial

1. [MDN · Your first form](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form): leia [The label, input, and textarea elements](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form#the_label_input_and_textarea_elements) e [The button element](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form#the_button_element).
2. [MDN · Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation): leia [What is form validation?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation#what_is_form_validation) e [Using built-in form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation#using_built-in_form_validation).
3. [MDN · `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input): a referência, com a lista de todos os `type`.

## Confira se entendeu

<details><summary>O que acontece ao clicar num <code>&lt;button&gt;</code> sem <code>type</code> dentro de um <code>&lt;form&gt;</code>?</summary>

O formulário é enviado, porque o tipo padrão do botão é `submit`.
</details>

<details><summary>Por que a validação do HTML não basta?</summary>

Porque é fácil contorná-la: dá para enviar dados direto para a API sem passar pelo formulário. O servidor precisa validar de novo.
</details>

<details><summary>Para que serve ligar o <code>&lt;label&gt;</code> ao campo com <code>for</code> e <code>id</code>?</summary>

Para o leitor de tela anunciar o rótulo ao focar o campo, e para que clicar no texto do rótulo leve o foco ao campo.
</details>

<details><summary>Qual a diferença entre <code>:invalid</code> e <code>:user-invalid</code>?</summary>

`:invalid` vale desde o início, então um campo obrigatório já aparece "com erro" antes de o usuário digitar. `:user-invalid` só vale depois que o usuário interagiu com o campo.
</details>
