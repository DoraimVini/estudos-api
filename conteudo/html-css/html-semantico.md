> **Tempo estimado:** 35 min · **Fontes:** MDN (*Structuring documents*, referência dos títulos `<h1>`–`<h6>`) · web.dev (*Semantic HTML*)

## Em poucas palavras

HTML semântico é usar cada elemento **pelo que ele significa**, e não pela aparência. Um `<nav>` diz "isto é navegação", um `<button>` diz "isto é clicável". O navegador usa esses significados para montar a **árvore de acessibilidade**, que é o que leitores de tela, buscadores e o modo leitura enxergam. Para eles, uma página feita só de `<div>` é um bloco de texto sem estrutura.

A aparência vem do CSS. O HTML descreve **o que é** cada coisa.

## A estrutura de uma página

```html
<body>
  <header>                       <!-- cabeçalho: logo, título do site -->
    <nav aria-label="Principal"> <!-- navegação principal -->
      <a href="#/agora">Agora</a>
    </nav>
  </header>

  <main>                         <!-- o conteúdo único desta página: só UM por página -->
    <h1>Trilha</h1>
    <article>                    <!-- algo que faz sentido sozinho: um post, um card de módulo -->
      <h2>Git e GitHub</h2>
      <section>                  <!-- uma parte temática, que começa com um título -->
        <h3>Tópicos</h3>
      </section>
    </article>
    <aside>                      <!-- conteúdo relacionado, mas à parte: o Pomodoro do painel -->
    </aside>
  </main>

  <footer>Feito pelo Vini</footer>
</body>
```

Os elementos de topo viram **marcos** (*landmarks*): `<header>` = banner, `<nav>` = navegação, `<main>` = conteúdo principal e `<footer>` = rodapé. Um usuário de leitor de tela pula direto para eles.

`<div>` e `<span>` **não têm significado**. Use quando nenhum elemento semântico servir, por exemplo como invólucro só para o layout.

## Títulos são o índice da página

- **Um `<h1>`** por página, dizendo do que ela trata.
- **Não pule níveis**: depois de `<h2>` vem `<h3>`, e não `<h4>`. Quem navega por títulos estranha o "buraco".
- **Não escolha o título pelo tamanho da fonte.** Quer um `<h2>` menor? Mude com CSS.

## Use o elemento que já faz o trabalho

```html
<!-- Ruim: parece botão, mas não recebe foco, não responde a Enter/Espaço e é anunciado como texto -->
<div class="botao" onclick="salvar()">Salvar</div>

<!-- Bom: foco, teclado e papel de "botão" já vêm de graça -->
<button type="button" onclick="salvar()">Salvar</button>
```

Regra prática: **link (`<a href>`) leva a outro lugar; botão (`<button>`) faz uma ação** na página.

## Na prática

1. Abra o painel de estudos e pressione **F12**. Na aba Elements, encontre o `<header>`, o `<nav>`, o `<main>` e o `<aside>` do Pomodoro.
2. Ainda no DevTools, abra a aba **Accessibility** (no Chrome, dentro de Elements) e veja o papel (*role*) de cada um.
3. Crie um `pagina.html` com a estrutura acima e abra no navegador (dois cliques no arquivo bastam: HTML e CSS puros funcionam via `file://`). Na aba Accessibility do DevTools, confira que cada marco aparece com o papel certo. Depois troque tudo por `<div>` e compare.

## Armadilhas comuns

- **"Div soup"**: tudo em `<div>`, sem nenhum marco nem título.
- **Vários `<main>`** na mesma página.
- **`<section>` sem título**: se você não consegue dar um título, provavelmente é só um `<div>`.
- **`<div onclick>` no lugar de `<button>`**: inacessível pelo teclado.
- **`<br>` para dar espaço**: espaçamento é CSS (`margin`).

## Leia na documentação oficial

1. [MDN · Structuring documents](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents): leia [HTML for structuring content](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents#html_for_structuring_content) e [HTML layout elements in more detail](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents#html_layout_elements_in_more_detail).
2. [web.dev · Semantic HTML](https://web.dev/learn/html/semantic-html): a árvore de acessibilidade e os papéis implícitos de cada elemento.
3. [MDN · Elementos de título h1–h6](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements#usage_notes): como usar títulos, incluindo a seção [Accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements#accessibility).

## Pratique

Exercício com correção automática: **html/01 · Da sopa de div ao HTML semântico**.

```bash
npm run exercicio html/01
```

## Confira se entendeu

<details><summary>Quantos <code>&lt;main&gt;</code> uma página deve ter?</summary>

Um só, com o conteúdo que é único daquela página.
</details>

<details><summary>Por que não pular de <code>&lt;h2&gt;</code> para <code>&lt;h4&gt;</code>?</summary>

Porque os títulos formam o índice da página. Quem navega por títulos com leitor de tela percebe o nível pulado e fica sem saber onde está a seção que falta.
</details>

<details><summary>Quando usar <code>&lt;a&gt;</code> e quando usar <code>&lt;button&gt;</code>?</summary>

`<a href>` leva a outro lugar (outra página ou outro trecho). `<button>` executa uma ação na página atual.
</details>

<details><summary>O que se perde trocando um <code>&lt;button&gt;</code> por <code>&lt;div onclick&gt;</code>?</summary>

O foco pelo Tab, a ativação por Enter e Espaço e o anúncio como "botão" pelo leitor de tela. Tudo isso teria que ser refeito à mão.
</details>
