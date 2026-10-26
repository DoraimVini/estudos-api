> **Tempo estimado:** 35 min · **Fontes:** MDN, *The box model* (Learn web development)

## Em poucas palavras

No CSS, **todo elemento é uma caixa**, e entender como o tamanho dessa caixa é calculado acaba com metade dos "por que isso não cabe?". A caixa tem quatro camadas, de dentro para fora:

```text
┌──────────── margin (espaço FORA da borda, separa das outras caixas) ────────────┐
│  ┌──────────────── border (a borda) ─────────────────┐                          │
│  │  ┌────────── padding (espaço DENTRO da borda) ──┐  │                          │
│  │  │              content (o conteúdo)            │  │                          │
│  │  └──────────────────────────────────────────────┘  │                          │
│  └────────────────────────────────────────────────────┘                          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## O `width` mede o quê?

**Modelo padrão** (`box-sizing: content-box`): `width` é só o conteúdo. Padding e borda **somam por fora**.

```css
.card { width: 300px; padding: 20px; border: 2px solid; }
/* largura visível: 300 + 20 + 20 + 2 + 2 = 344px */
```

**Modelo alternativo** (`box-sizing: border-box`): `width` já **inclui** padding e borda. Muito mais previsível:

```css
.card { box-sizing: border-box; width: 300px; padding: 20px; border: 2px solid; }
/* largura visível: 300px (o conteúdo encolhe para 256px) */
```

Por isso quase todo projeto começa com:

```css
*, *::before, *::after { box-sizing: border-box; }
```

O `styles.css` do painel de estudos começa exatamente assim.

## Block x inline

| | `block` (`<p>`, `<div>`, `<h1>`, `<section>`) | `inline` (`<a>`, `<span>`, `<strong>`) |
|---|---|---|
| Quebra a linha? | Sim, ocupa a largura toda | Não, fica no meio do texto |
| `width` / `height` | Funcionam | **Ignorados** |
| `margin` vertical | Funciona | **Ignorada** |

`display: inline-block` é o meio-termo: fica na linha, mas respeita largura, altura e margens. É útil para links de menu com área de clique maior.

## Margens que "colapsam"

Margens **verticais** de dois blocos vizinhos não se somam: **vale a maior**.

```css
h2 { margin-bottom: 32px; }
p  { margin-top: 16px; }
/* o espaço entre eles é 32px, e não 48px */
```

Isso não acontece com padding, nem dentro de containers `flex` e `grid`.

## Na prática

1. Abra o painel de estudos, pressione **F12** e selecione um card (`.card`).
2. Na aba **Computed**, veja o **diagrama do box model** com os valores de cada camada.
3. Na aba Styles, desmarque `box-sizing: border-box` (na regra do `*`) e veja a largura mudar.
4. Crie dois `<p>` com `margin: 30px` e confira, no DevTools, que o espaço entre eles é 30px, e não 60px.

## Armadilhas comuns

- **Somar padding a uma caixa de `width: 100%`** sem `border-box`: ela estoura o container e cria rolagem horizontal.
- **Dar `width` ou margem vertical a um `<a>` ou `<span>`** e nada acontecer: elementos inline ignoram. Use `inline-block` (ou `block`).
- **Estranhar o espaço entre blocos** que deveria ser a soma das margens: é o colapso de margens.

## Leia na documentação oficial

1. [MDN · The box model](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model): leia [What is the CSS box model?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model#what_is_the_css_box_model), [Block and inline boxes](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model#block_and_inline_boxes) e [Margin](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model#margin) (com o colapso de margens).
2. [MDN · box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-sizing): a referência da propriedade.
3. [web.dev · Box model](https://web.dev/learn/css/box-model): outra explicação, com bons diagramas.

## Confira se entendeu

<details><summary>Com <code>width: 200px; padding: 10px; border: 1px solid</code>, qual a largura visível no modelo padrão? E com <code>border-box</code>?</summary>

Modelo padrão: 200 + 10 + 10 + 1 + 1 = 222px. Com `border-box`: 200px.
</details>

<details><summary>Por que <code>width</code> não funciona num <code>&lt;span&gt;</code>?</summary>

Porque `<span>` é inline, e caixas inline ignoram `width`, `height` e margens verticais. Use `display: inline-block` ou `block`.
</details>

<details><summary>Um elemento com <code>margin-bottom: 40px</code> seguido de outro com <code>margin-top: 20px</code>: qual o espaço entre eles?</summary>

40px. As margens verticais colapsam, e vale a maior.
</details>

<details><summary>Onde ver, no navegador, quanto mede cada camada de uma caixa?</summary>

No DevTools: aba Elements, painel Computed, que mostra o diagrama do box model.
</details>
