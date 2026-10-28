# Da sopa de `div` ao HTML semântico

**Módulo 3 · HTML, CSS e acessibilidade · tópico: HTML semântico**

Uma página feita só de `div` pode até ficar bonita, mas para o navegador, o leitor de tela e o Google ela é uma caixa de caixas sem significado. As tags semânticas dizem **o que** cada parte é: cabeçalho, navegação, conteúdo principal, seção, rodapé. Com isso vem, de graça, navegação por regiões no leitor de tela e títulos que fazem sentido.

## O que fazer

Reescreva o `solucao.html` desta pasta, **sem perder nenhum texto**:

1. O `<html>` diz o idioma da página (português do Brasil).
2. O topo vira um `<header>` com o nome "Vini" e um `<nav>` com os três links.
3. O conteúdo principal fica num **único** `<main>`, e "Dev full stack em formação" vira o **único** `<h1>` da página.
4. "Projetos" e "Sobre" viram `<section>`, cada uma com o seu título em `<h2>`. Mantenha os ids `projetos` e `sobre` (os links do menu dependem deles).
5. Cada projeto vira um `<article>` com o nome em `<h3>`.
6. O contato vai para um `<footer>`, e o id `contato` continua lá.
7. Os títulos não pulam nível: depois de um `<h1>` vem `<h2>`, nunca direto `<h3>`.

Abra o arquivo no navegador (dois cliques) para ver como fica. Ele vai parecer **igual ou mais simples**, e tudo bem: aqui a mudança é de significado, não de visual.

## Rodar

```bash
npm run exercicio html/01
```

## Dicas
- `<section>` agrupa um assunto com título; `<article>` é algo que faria sentido sozinho (um post, um card de projeto).
- A ordem dos títulos é como o sumário de um livro. No DevTools do Chrome, a aba **Accessibility** mostra a árvore que o leitor de tela enxerga.
- `div` não é proibida: ela continua certa quando o único motivo é estilo. Aqui, nenhuma das que existem tem esse motivo.

## Pronto quando
Os testes passam e você consegue dizer, para cada tag que usou, por que ela é melhor que uma `div` ali.
