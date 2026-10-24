> **Tempo estimado:** 50 min · **Fontes:** MDN (*CSS grid layout*, Learn web development; *Relationship of grid layout to other layout methods*)

## Em poucas palavras

Grid organiza a página em **linhas e colunas ao mesmo tempo**. Você **desenha a grade primeiro** e depois encaixa os itens nela. É a ferramenta certa para o layout geral de uma página (cabeçalho, conteúdo, lateral, rodapé) e para galerias de cards que se alinham nas duas direções.

## Montando a grade

```css
.layout {
  display: grid;
  grid-template-columns: 1fr 300px;   /* duas colunas: a primeira ocupa o resto, a segunda tem 300px */
  gap: 1.5rem;                        /* espaço entre linhas e colunas */
}
```

- **`fr`** é uma **fração do espaço que sobra**: `1fr 2fr` divide o espaço livre em 3 partes, uma para a primeira coluna e duas para a segunda. Os tamanhos fixos são atendidos antes.
- **`repeat(3, 1fr)`** é o mesmo que `1fr 1fr 1fr`.
- **`minmax(200px, 1fr)`**: no mínimo 200px e, no máximo, uma fração.

O layout do painel de estudos (`.layout` em `public/styles.css`) é quase o exemplo acima: `minmax(0, 1fr) 300px`. O `minmax(0, ...)` deixa a coluna do conteúdo encolher abaixo da largura do seu maior item (um bloco de código comprido, por exemplo), em vez de empurrar o Pomodoro para fora da tela.

## Grade responsiva sem media query

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
```

"Cabem quantas colunas de pelo menos 260px? Crie essas, e divida a sobra igualmente." Numa tela larga ficam quatro colunas; no celular, uma. É assim que a página Trilha do painel organiza os cards dos módulos.

## Posicionando itens

**Pelas linhas da grade**, numeradas a partir de 1:

```css
.destaque { grid-column: 1 / 3; }      /* da linha 1 até a 3: ocupa duas colunas */
.rodape   { grid-column: 1 / -1; }     /* -1 é a última linha: ocupa a largura toda */
```

**Por áreas com nome**, a forma mais legível para layouts de página:

```css
.pagina {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-areas:
    "topo    topo"
    "lateral conteudo"
    "rodape  rodape";
}
header { grid-area: topo; }
nav    { grid-area: lateral; }
main   { grid-area: conteudo; }
footer { grid-area: rodape; }
```

As áreas precisam ser **retangulares**, e um `.` deixa uma célula vazia.

## Grid ou Flexbox?

A MDN resume assim: **controla linhas *ou* colunas → flexbox; linhas *e* colunas → grid**. Outro sinal: se você está fixando larguras em itens flex só para eles se alinharem com os da linha de cima, você queria um grid. Os dois combinam: grid para a página, flexbox dentro de cada card.

## Na prática

1. Jogue o [Grid Garden](https://cssgridgarden.com/#pt-br) até o fim (28 níveis).
2. No painel de estudos, F12 e clique no selo `grid` ao lado do elemento `.layout`: o Chrome desenha as linhas da grade sobre a página.
3. Monte o layout de página com `grid-template-areas` acima e, depois, com uma media query, empilhe tudo numa coluna só no celular.

## Armadilhas comuns

- **Usar `fr` achando que é porcentagem.** É fração do espaço **livre**, depois de descontar os tamanhos fixos e o `gap`.
- **Numerar as linhas a partir de 0.** Elas começam em 1.
- **Área não retangular** em `grid-template-areas` (em forma de L): o navegador ignora a regra inteira.
- **Reordenar visualmente com grid** sem mudar o HTML: o mesmo problema de acessibilidade do `order` no flexbox.

## Leia na documentação oficial

1. [MDN · CSS grid layout](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids): leia [Flexible grids with the fr unit](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids#flexible_grids_with_the_fr_unit), [As many columns as will fit](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids#as_many_columns_as_will_fit), [Line-based placement](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids#line-based_placement) e [Positioning with grid-template-areas](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids#positioning_with_grid-template-areas).
2. [MDN · Grid x Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Relationship_with_other_layout_methods#grid_and_flexbox): unidimensional x bidimensional, com exemplos.
3. [web.dev · Grid](https://web.dev/learn/css/grid): outra explicação, com bons diagramas.

## Confira se entendeu

<details><summary>Em <code>grid-template-columns: 200px 1fr 1fr</code> num container de 800px sem gap, quanto mede cada coluna?</summary>

200px, 300px e 300px. O tamanho fixo é atendido primeiro, e os 600px que sobram são divididos em duas frações iguais.
</details>

<details><summary>O que <code>grid-column: 1 / -1</code> faz?</summary>

Faz o item ocupar da primeira à última linha da grade, ou seja, a largura toda.
</details>

<details><summary>Como ter "quantas colunas couberem" sem media query?</summary>

`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` (ou `auto-fit`).
</details>

<details><summary>Grid ou Flexbox para o layout com cabeçalho, lateral, conteúdo e rodapé?</summary>

Grid, porque é um arranjo em duas dimensões (linhas e colunas).
</details>
