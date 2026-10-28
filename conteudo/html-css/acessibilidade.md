> **Tempo estimado:** 60 min · **Fontes:** MDN (*HTML: A good basis for accessibility*) · W3C (*WCAG 2.2 Quick Reference*) · web.dev (*Keyboard focus*)

## Em poucas palavras

Acessibilidade é garantir que **todo mundo consiga usar** o que você faz: quem não enxerga e usa leitor de tela, quem só usa o teclado, quem tem baixa visão ou daltonismo, quem está com o braço quebrado ou com o celular no sol. A referência mundial são as **WCAG** (Diretrizes de Acessibilidade para Conteúdo Web) do W3C, e a base de quase tudo é **HTML semântico bem usado**.

## Os pontos que mais aparecem

**1. Texto alternativo em imagens** (WCAG 1.1.1)

```html
<img src="grafico-horas.png" alt="Horas estudadas por semana: subiu de 3 para 9 em outubro">
<img src="enfeite.svg" alt="">     <!-- decorativa: alt vazio, o leitor de tela ignora -->
```

O `alt` diz o que a imagem **comunica** naquele contexto, e não "imagem de...". Sem `alt` nenhum, o leitor de tela lê o nome do arquivo.

**2. Contraste** (WCAG 1.4.3, nível AA): pelo menos **4,5:1** para texto normal e **3:1** para texto grande. O DevTools mostra o contraste ao inspecionar uma cor.

**3. Tudo funciona pelo teclado** (WCAG 2.1.1): Tab avança, Shift+Tab volta, Enter e Espaço ativam. Usando `<button>`, `<a href>` e `<input>`, isso vem de graça.

**4. Foco visível** (WCAG 2.4.7): quem navega pelo teclado precisa ver onde está.

```css
:focus-visible { outline: 3px solid var(--destaque); outline-offset: 2px; }
/* NUNCA: *:focus { outline: none; } sem pôr outro indicador no lugar */
```

`:focus-visible` mostra o contorno quando o foco veio do teclado, e não a cada clique do mouse.

**5. Rótulos em campos** (WCAG 3.3.2): todo `<input>` com `<label>` (veja o tópico de Formulários).

**6. Links que fazem sentido sozinhos**: leitores de tela listam os links da página, e uma lista de "clique aqui" não diz nada. Escreva "Ler o guia de Flexbox".

## ARIA: só quando o HTML não basta

Atributos `aria-*` acrescentam informação para tecnologias assistivas, mas **não acrescentam comportamento**. A primeira regra do ARIA é: se existe um elemento HTML que faz o que você quer, use-o. Exemplos legítimos no painel de estudos:

- `aria-current="page"` no link da página atual do menu;
- `aria-pressed` nos botões de status (que funcionam como liga/desliga);
- `role="status"` no aviso que aparece no rodapé, para o leitor de tela anunciar a mensagem sem tirar o foco do usuário.

## Ordem do foco e `tabindex`

O foco segue a **ordem do HTML**. `tabindex="0"` põe um elemento que não é focável na sequência, e `tabindex="-1"` permite focá-lo só via JavaScript. **Evite `tabindex` positivo** (1, 2, 3...): ele bagunça a ordem natural. Um **link "pular para o conteúdo"** no começo da página (o painel tem um) poupa quem usa teclado de passar por todo o menu.

## Na prática

1. Abra o painel e **guarde o mouse**. Usando só Tab, Shift+Tab, Enter e Espaço: escolha um tópico, cronometre, registre uma sessão.
2. Pressione Tab logo depois de carregar a página: o primeiro foco é o link "Pular para o conteúdo".
3. No DevTools, inspecione um texto cinza (`.sub`) e veja a taxa de contraste no seletor de cor.
4. Ative o leitor de tela do Windows (**Ctrl+Win+Enter** abre o Narrador) e navegue pelos títulos da página Trilha. Desative com o mesmo atalho.

## Armadilhas comuns

- **`outline: none`** sem substituto.
- **`<div onclick>`** em vez de `<button>`.
- **Informação só por cor** ("os campos em vermelho estão errados"): quem é daltônico não vê. Acrescente texto ou ícone.
- **ARIA em excesso**: `role="button"` num `<div>` muda o anúncio, mas não faz o teclado funcionar.
- **Achar que a nota 100 do Lighthouse resolve.** Ferramentas automáticas pegam só parte dos problemas (veja o próximo tópico). O teste com teclado e leitor de tela continua necessário.

## Leia na documentação oficial

1. [MDN · HTML: A good basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML): leia [Good semantics](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#good_semantics), [Text alternatives](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#text_alternatives) e [More on links](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#more_on_links).
2. [W3C · WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/): os critérios oficiais. Comece por [1.1.1](https://www.w3.org/WAI/WCAG22/quickref/#non-text-content), [1.4.3](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum), [2.1.1](https://www.w3.org/WAI/WCAG22/quickref/#keyboard) e [2.4.7](https://www.w3.org/WAI/WCAG22/quickref/#focus-visible).
3. [web.dev · Keyboard focus](https://web.dev/learn/accessibility/focus): ordem do foco, `tabindex`, links para pular conteúdo e estilos de foco.
4. [W3C · An alt Decision Tree](https://www.w3.org/WAI/tutorials/images/decision-tree/): um fluxograma para decidir o `alt` de cada imagem.

## Pratique

Exercício com correção automática: **html/03 · Conserte os 7 problemas de acessibilidade**.

```bash
npm run exercicio html/03
```

## Confira se entendeu

<details><summary>Qual o <code>alt</code> certo para uma imagem só decorativa?</summary>

`alt=""` (vazio). Assim o leitor de tela ignora a imagem. Sem o atributo, ele leria o nome do arquivo.
</details>

<details><summary>Qual o contraste mínimo, no nível AA, para texto normal?</summary>

4,5:1. Para texto grande, 3:1.
</details>

<details><summary>Por que <code>:focus-visible</code> é melhor que remover o <code>outline</code>?</summary>

Porque mantém o indicador para quem navega pelo teclado e evita o contorno em cliques de mouse. Remover o `outline` deixa quem usa teclado sem saber onde está.
</details>

<details><summary>O que <code>role="button"</code> num <code>&lt;div&gt;</code> resolve, e o que não resolve?</summary>

Resolve o anúncio ("botão") no leitor de tela. Não resolve o foco pelo Tab nem a ativação por Enter e Espaço: isso precisaria ser programado. Por isso, use `<button>`.
</details>
