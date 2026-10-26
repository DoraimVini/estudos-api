> **Tempo estimado:** 50 min · **Fontes:** MDN (*Flexbox*, Learn web development; *Relationship of grid layout to other layout methods*)

## Em poucas palavras

Flexbox organiza itens **numa direção**: em linha ou em coluna. Ele resolve o que antes era sofrimento, como centralizar algo na vertical, distribuir botões com espaço igual ou fazer um item ocupar "o que sobrar". Você aplica `display: flex` no **pai** (o *container*), e os **filhos diretos** viram *itens flex*.

## Os dois eixos

- **Eixo principal**: a direção em que os itens se enfileiram. É a linha (`flex-direction: row`, o padrão) ou a coluna (`column`).
- **Eixo transversal**: o perpendicular a ele.

Quase toda propriedade do flexbox fala de um desses eixos, e é por isso que `justify-content` alinha na horizontal numa linha, mas na vertical numa coluna.

## No container (o pai)

```css
.barra {
  display: flex;
  flex-direction: row;          /* row (padrão) | column */
  flex-wrap: wrap;              /* deixa os itens descerem para a linha de baixo se não couberem */
  justify-content: space-between;   /* eixo principal: start | center | end | space-between | space-around */
  align-items: center;          /* eixo transversal: stretch (padrão) | start | center | end | baseline */
  gap: 1rem;                    /* espaço entre os itens (sem margem nos itens) */
}
```

Centralizar nas duas direções, o clássico:

```css
.centro { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
```

## Nos itens (os filhos)

```css
.busca   { flex: 1; }        /* cresce para ocupar o espaço que sobrar */
.lateral { flex: 0 0 300px; }/* não cresce, não encolhe, base de 300px */
.item    { align-self: end; }/* alinhamento próprio, só deste item */
```

`flex: 1` em todos os itens dá a cada um uma fatia igual. `flex: 2` num deles dá a ele o dobro da fatia dos outros.

## `order` e acessibilidade

`order` muda a **posição visual** de um item, mas **não** a ordem de leitura nem a do Tab, que continuam seguindo o HTML. Se a ordem visual e a do HTML ficarem diferentes, quem navega pelo teclado pula de um lado para o outro da tela. Prefira mudar a ordem no próprio HTML.

## Flexbox ou Grid?

Flexbox é **uma dimensão** (linha **ou** coluna) e é guiado pelo conteúdo: o tamanho de cada item influencia o espaço dele. Use em barras de navegação, grupos de botões e alinhamento dentro de um card. Para linhas **e** colunas ao mesmo tempo, use Grid (próximo tópico).

## Na prática

1. Jogue o [Flexbox Froggy](https://flexboxfroggy.com/#pt-br) até o fim (24 níveis).
2. No painel de estudos, F12 e selecione o `<header class="topo">`. Ao lado de `display: flex` aparece um ícone que abre o **editor de flexbox** do Chrome: troque `justify-content` e veja o resultado.
3. Faça uma barra com logo à esquerda e três links à direita, usando só flexbox e sem `margin` nos itens.

## Armadilhas comuns

- **Pôr `display: flex` no item, e não no pai.**
- **Esperar que `justify-content` alinhe na vertical** numa linha. Ele trabalha no eixo principal, e o vertical é `align-items`.
- **Itens que não quebram de linha** e estouram a tela: falta `flex-wrap: wrap`.
- **Usar `order` para "consertar" a ordem** em vez de mudar o HTML.

## Leia na documentação oficial

1. [MDN · Flexbox](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox): leia [The flex model](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox#the_flex_model), [Flexible sizing of flex items](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox#flexible_sizing_of_flex_items), [Horizontal and vertical alignment](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox#horizontal_and_vertical_alignment) e [Ordering flex items](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox#ordering_flex_items).
2. [MDN · Grid x Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Relationship_with_other_layout_methods#grid_and_flexbox): quando usar cada um.
3. [MDN · gap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap): o espaçamento entre itens, que funciona em flex e em grid.

## Confira se entendeu

<details><summary>Em <code>flex-direction: column</code>, qual propriedade centraliza os itens na horizontal?</summary>

`align-items: center`. Numa coluna, o eixo principal é vertical, e o horizontal é o transversal.
</details>

<details><summary>Três itens com <code>flex: 1</code>, e um deles passa a ter <code>flex: 2</code>. O que acontece?</summary>

Ele fica com o dobro do espaço livre de cada um dos outros.
</details>

<details><summary>Por que evitar <code>order</code> para reordenar itens?</summary>

Porque ele muda só a ordem visual. O Tab e o leitor de tela continuam seguindo o HTML, e quem usa teclado perde a lógica da página.
</details>

<details><summary>Flexbox ou Grid para uma barra com logo e links?</summary>

Flexbox: é um arranjo em uma dimensão, uma linha.
</details>
