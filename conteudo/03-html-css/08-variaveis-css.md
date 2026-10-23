> **Tempo estimado:** 35 min · **Fontes:** MDN (*Using CSS custom properties*, `prefers-color-scheme`)

## Em poucas palavras

**Variáveis CSS** (o nome oficial é *custom properties*) guardam um valor com nome, como uma cor ou um espaçamento, para você reaproveitar no CSS inteiro. Mudou a cor da marca? Muda num lugar só. E, ao contrário das variáveis do Sass, elas existem **no navegador, em tempo real**: dá para trocá-las com uma media query ou com JavaScript, e é assim que se faz tema claro e escuro.

## Declarar e usar

```css
:root {                          /* :root = o <html>; variável global */
  --cor-destaque: #3b5bdb;
  --raio: 10px;
  --espaco: 1rem;
}

.botao {
  background: var(--cor-destaque);
  border-radius: var(--raio);
  padding: var(--espaco) calc(var(--espaco) * 2);
  color: var(--cor-texto-botao, white);   /* segundo valor: usado se a variável não existir */
}
```

- O nome **começa com dois hífens** e diferencia maiúsculas de minúsculas (`--Cor` e `--cor` são variáveis diferentes).
- Variáveis **são herdadas**: definidas num elemento, valem para todos os descendentes. Por isso as globais ficam em `:root`.
- Dá para redefinir num trecho só: `.alerta { --cor-destaque: crimson; }` muda a cor apenas dentro de `.alerta`.

## Tema escuro automático

```css
:root {
  --fundo: #f6f7f9;
  --texto: #1d2129;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {    /* o sistema do usuário está no modo escuro */
  :root {
    --fundo: #111418;
    --texto: #e6e9ee;
    color-scheme: dark;                  /* barras de rolagem e campos nativos também ficam escuros */
  }
}

body { background: var(--fundo); color: var(--texto); }
```

O resto do CSS **só usa as variáveis**, sem saber qual tema está ativo. É exatamente como o `public/styles.css` do painel de estudos funciona: troque o tema do Windows e o painel acompanha.

Atenção: você pode **redefinir** variáveis dentro de um bloco `@media`, como acima, mas **não pode usar** `var()` **na condição** da media query. `@media (width >= var(--quebra))` não funciona.

## Nomes que duram

Prefira nomes pelo **papel**, e não pela aparência: `--cor-destaque` e `--cor-alerta`, em vez de `--azul` e `--vermelho`. No tema escuro, o "destaque" pode deixar de ser azul, e `--azul: #7c94ff` vira mentira.

## Na prática

1. Abra `public/styles.css` deste projeto e encontre o bloco `:root` e o `@media (prefers-color-scheme: dark)`.
2. No painel, F12, selecione o `<html>` e mude `--destaque` na aba Styles: o painel inteiro troca de cor ao vivo.
3. No DevTools, abra o menu (⋮) › **More tools** › **Rendering** e mude **Emulate CSS media feature prefers-color-scheme** para alternar entre os temas sem mexer no Windows.

## Armadilhas comuns

- **Esquecer o `var()`**: `color: --texto` não funciona.
- **Erro de digitação no nome**: o navegador não avisa, e a propriedade cai no valor herdado ou no inicial. Um valor de reserva (`var(--x, preto)`) ajuda a perceber.
- **Usar `var()` na condição de uma media query.**
- **Nomear pela cor**, em vez de pela função.

## Leia na documentação oficial

1. [MDN · Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties): leia [Using the :root pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties#using_the_root_pseudo-class), [Inheritance of custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties#inheritance_of_custom_properties) e [Custom property fallback values](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties#custom_property_fallback_values).
2. [MDN · prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme): a media query do tema claro e escuro.
3. [MDN · color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme): a propriedade que faz os elementos nativos acompanharem o tema.

## Confira se entendeu

<details><summary>Por que as variáveis globais ficam em <code>:root</code>?</summary>

Porque variáveis CSS são herdadas, e `:root` é o elemento raiz (`<html>`). Definidas ali, valem para a página inteira.
</details>

<details><summary>Para que serve o segundo valor em <code>var(--x, red)</code>?</summary>

É o valor de reserva, usado quando `--x` não está definida.
</details>

<details><summary>Como o tema escuro do painel funciona sem JavaScript?</summary>

As cores ficam em variáveis em `:root`, e um bloco `@media (prefers-color-scheme: dark)` redefine essas variáveis. O resto do CSS só usa `var(...)`.
</details>

<details><summary>Por que <code>--cor-destaque</code> é um nome melhor que <code>--azul</code>?</summary>

Porque descreve o papel da cor, e não a cor. Se o destaque mudar (por exemplo, no tema escuro), o nome continua verdadeiro.
</details>
