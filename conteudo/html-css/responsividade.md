> **Tempo estimado:** 45 min · **Fontes:** MDN (*Responsive web design*, *Using media queries*, *CSS values and units*)

## Em poucas palavras

Uma página responsiva **se adapta a qualquer largura de tela**, sem rolagem horizontal e sem texto minúsculo. Ela não é feita "uma versão para cada aparelho": é feita de **layouts flexíveis** (`fr`, `%`, flexbox, grid) mais alguns **pontos de quebra** (*media queries*) onde o layout muda de forma.

## O ponto de partida: a meta viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Sem essa linha, o celular finge ter uma tela de uns 980px e encolhe a página inteira, e as suas media queries nunca são ativadas. O `index.html` do painel de estudos tem essa linha.

## Mobile first

Escreva o CSS **para o celular primeiro** (geralmente uma coluna) e acrescente regras para telas maiores:

```css
.layout { display: grid; gap: 1rem; }                 /* celular: uma coluna */

@media (width >= 48rem) {                             /* a partir de ~768px */
  .layout { grid-template-columns: 1fr 300px; }       /* conteúdo + lateral */
}
```

`(width >= 48rem)` é a sintaxe nova de intervalo, que equivale a `(min-width: 48rem)` (as duas funcionam nos navegadores atuais). Coloque os pontos de quebra **onde o seu layout quebra**, e não nas larguras de aparelhos específicos.

## Unidades relativas

| Unidade | Relativa a | Use para |
|---|---|---|
| `rem` | tamanho de fonte da raiz (normalmente 16px) | fontes, espaçamentos, pontos de quebra |
| `em` | tamanho de fonte do próprio elemento | espaçamentos que acompanham a fonte |
| `%` | o container | larguras |
| `vw` / `vh` | 1% da largura ou altura da janela | tamanhos ligados à tela |
| `ch` | largura do caractere "0" | limitar linhas de texto: `max-width: 70ch` |

Fontes em `rem` respeitam o tamanho de letra que o usuário configurou no navegador, e fontes em `px` atrapalham quem precisa de letra maior. A MDN alerta: **nunca use só `vw` para fontes**, porque o zoom do navegador deixa de funcionar. Se quiser fonte fluida, combine: `font-size: calc(1.25rem + 1vw)`.

## Imagens que não estouram

```css
img, video { max-width: 100%; height: auto; }
```

A imagem encolhe com o container, mas nunca cresce além do tamanho original. Para servir arquivos menores no celular, existem `srcset` e `<picture>` (veja a última leitura).

## Na prática

1. No painel de estudos, F12 e clique no ícone de **celular/tablet** (*Device Toolbar*, ou Ctrl+Shift+M). Escolha uma largura de 375px e veja o Pomodoro ir para cima do conteúdo.
2. Encontre no `public/styles.css` a `@media (max-width: 860px)` que faz isso. Repare que o painel foi escrito **desktop first** (o padrão são duas colunas, e a media query desfaz isso no celular). Como exercício, reescreva esse trecho *mobile first*.
3. Pegue a página que você fez no tópico de Grid e torne-a *mobile first*: uma coluna por padrão e o layout de áreas a partir de `48rem`.

## Armadilhas comuns

- **Esquecer a meta viewport.**
- **Larguras fixas em px** (`width: 1200px`) em containers: rolagem horizontal no celular. Prefira `max-width`.
- **Pontos de quebra por aparelho** ("iPhone 14") em vez de onde o conteúdo pede.
- **Esconder conteúdo importante no celular** com `display: none`.
- **Testar só redimensionando a janela**: use o modo de dispositivo do DevTools, que simula toque e densidade de tela.

## Leia na documentação oficial

1. [MDN · Responsive web design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design): leia [Media Queries](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design#media_queries), [Responsive typography](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design#responsive_typography) e [The viewport meta tag](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design#the_viewport_meta_tag).
2. [MDN · Using media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using): a sintaxe completa, incluindo a de intervalo (`width >= ...`).
3. [MDN · CSS values and units](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units): `rem`, `em`, `%`, `vw` e as outras unidades.
4. Para ir além: [MDN · Responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images), sobre `srcset` e `<picture>`.

## Pratique

Exercício com correção automática: **css/02 · Calcule o layout: flexbox, grid e media queries**. Tem perguntas de media query e de `em` x `rem`.

```bash
npm run exercicio css/02
```

## Confira se entendeu

<details><summary>O que acontece no celular se faltar a meta viewport?</summary>

O navegador renderiza a página como se a tela tivesse uns 980px e encolhe tudo. O texto fica minúsculo, e as media queries de largura não disparam.
</details>

<details><summary>O que significa "mobile first"?</summary>

Escrever o CSS base para telas pequenas e usar media queries de largura mínima (`width >= ...`) para acrescentar o layout das telas maiores.
</details>

<details><summary>Por que preferir <code>rem</code> a <code>px</code> para tamanho de fonte?</summary>

Porque `rem` acompanha o tamanho de fonte que o usuário configurou no navegador, e `px` ignora essa preferência.
</details>

<details><summary>Como impedir que uma imagem estoure a largura da tela?</summary>

Com `max-width: 100%; height: auto;`.
</details>
