# Calcule o layout: flexbox, grid e media queries

**Módulo 3 · HTML, CSS e acessibilidade · tópico: Flexbox**

O navegador não "chuta" larguras: flexbox e grid seguem algoritmos simples de distribuir espaço. Quem entende o algoritmo para de mexer em valores até "ficar certo". Aqui você **calcula** o resultado e responde em `solucao.js`, **antes** de conferir no DevTools.

Todas as respostas foram conferidas num navegador de verdade. No teste, o gabarito está guardado só como hash.

Em todos os trechos, os itens não têm padding, borda nem margem, e o conteúdo é curto (não força largura mínima).

## Flexbox (responda em px)

**`flexIguais`**: largura de **cada** item.
```html
<div style="display: flex; width: 600px; gap: 30px">
  <div style="flex: 1">A</div> <div style="flex: 1">B</div> <div style="flex: 1">C</div>
</div>
```

**`flexDoisParaUm`**: largura de A e de B, como `[A, B]`.
```html
<div style="display: flex; width: 700px; gap: 10px">
  <div style="flex: 2">A</div> <div style="flex: 1">B</div>
</div>
```

**`flexComBase`**: largura de A e de B, como `[A, B]`. Agora cada um parte de uma **base** diferente.
```html
<div style="display: flex; width: 800px">
  <div style="flex: 1 0 200px">A</div> <div style="flex: 1 0 100px">B</div>
</div>
```

**`flexEncolhe`**: largura de A e de B, como `[A, B]`. Agora **falta** espaço.
```html
<div style="display: flex; width: 300px">
  <div style="flex: 0 1 300px">A</div> <div style="flex: 0 1 100px">B</div>
</div>
```

## Grid

**`gridFr`**: largura das três colunas, como `[1ª, 2ª, 3ª]`.
```html
<div style="display: grid; width: 840px; gap: 20px; grid-template-columns: 200px 1fr 2fr">…</div>
```

**`autoFill`**: **quantas colunas** cabem?
```html
<div style="display: grid; width: 900px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))">…</div>
```

## Responsividade

**`mediaQueries`**: quantas colunas a `.grade` tem numa tela de **375, 800, 1000 e 1280 px** de largura? Responda como `[a, b, c, d]`.
```css
.grade { display: grid; grid-template-columns: 1fr; }
@media (min-width: 600px) { .grade { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1000px) { .grade { grid-template-columns: 1fr 1fr 1fr; } }
```

**`paddingEm`**: quantos px de padding o título tem (em cima)?
```css
html { font-size: 16px; }
.titulo { font-size: 2rem; padding: 0.5em; }
```

## Rodar

```bash
npm run exercicio css/02
```

## Dicas
- Flexbox: comece da **base** (`flex-basis`; em `flex: 1` ela é `0`), desconte os `gap`s e reparta o espaço que **sobra** na proporção do `flex-grow`.
- Quando **falta** espaço, quem encolhe é o `flex-shrink`, mas ponderado pelo tamanho da base: itens maiores encolhem mais.
- Grid: as colunas fixas e os `gap`s saem primeiro; o resto é dividido em frações (`fr`).
- `min-width` em media query quer dizer "a partir de". Mais de uma pode valer ao mesmo tempo: aí vence a que vem depois.
- `em` no padding é relativo à **fonte do próprio elemento**; `rem`, à fonte do `html`.

## Pronto quando
Os testes passam e você consegue refazer qualquer um dos cálculos no papel.
