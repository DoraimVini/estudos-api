> **Tempo estimado:** 45 min · **Fontes:** MDN (*Handling conflicts*, referência *Specificity*)

## Em poucas palavras

Quando duas regras CSS mandam coisas diferentes para o mesmo elemento, o navegador decide quem vence em três etapas:

1. **Importância e origem**: `!important` e estilos inline passam na frente.
2. **Especificidade**: o seletor **mais específico** vence.
3. **Ordem**: em caso de empate, **a regra que vem depois** vence.

Além disso, algumas propriedades são **herdadas** do elemento pai. Entender isso transforma o "por que meu CSS não pega?" em algo que você resolve em segundos.

## Especificidade: três colunas

Conte quantos seletores de cada tipo existem e compare **coluna por coluna, da esquerda para a direita**:

| Coluna | Conta | Exemplo |
|---|---|---|
| **ID** | `#id` | `#conteudo` → 1-0-0 |
| **Classe** | `.classe`, `[atributo]`, `:hover` e outras pseudo-classes | `.card .chip` → 0-2-0 |
| **Tipo** | `p`, `h1`, `::before` e outros pseudo-elementos | `nav a` → 0-0-2 |

```css
nav a          { color: gray; }   /* 0-0-2 */
.topo nav a    { color: blue; }   /* 0-1-2 → vence a de cima */
a[aria-current="page"] { color: white; }   /* 0-1-1 → perde para 0-1-2! */
```

Uma classe vence **qualquer número** de seletores de tipo, e um ID vence qualquer número de classes. `*` e `:where()` valem zero. `:is()` e `:not()` valem o argumento mais específico que estiver dentro.

## Herança

Propriedades **de texto** (`color`, `font-family`, `font-size`, `line-height`) passam do pai para os filhos. Propriedades **de caixa** (`margin`, `padding`, `border`, `width`, `background`) **não** passam. Imagine se toda borda de uma lista aparecesse em cada item!

```css
body { color: #222; font-family: system-ui; }   /* todo o texto da página herda */
a { color: inherit; }                           /* força o link a herdar a cor do pai */
```

Valores que controlam a herança: `inherit` (usa o valor do pai), `initial` (o valor inicial da propriedade), `unset` e `revert` (volta ao estilo padrão do navegador).

## `!important`: fuja

`!important` passa por cima de toda especificidade. Resolve na hora e cria um problema maior depois: a única forma de vencê-lo é outro `!important`. A própria MDN chama isso de má prática. Se uma regra não pega, **descubra quem está vencendo** (veja abaixo) e ajuste o seletor ou a ordem.

## Na prática

1. Abra o painel de estudos, F12, e selecione um link do menu do topo.
2. Na aba **Styles**, as regras aparecem **da mais forte para a mais fraca**. Declarações **riscadas** foram vencidas por outra regra.
3. Passe o mouse sobre um seletor: o Chrome mostra a especificidade dele.
4. Crie um HTML com `<p class="destaque" id="aviso">` e três regras (`p`, `.destaque`, `#aviso`) com cores diferentes. Preveja qual vence, depois inverta a ordem das regras e preveja de novo.

## Armadilhas comuns

- **Usar ID para estilizar**: especificidade alta demais, difícil de sobrescrever depois. Prefira classes.
- **Seletores longos** (`.pagina .conteudo .lista li a span`): frágeis e fortes demais.
- **`!important` para "fazer funcionar"**.
- **Esperar que `margin` ou `border` sejam herdados**: não são.

## Leia na documentação oficial

1. [MDN · Handling conflicts](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts): cascata, especificidade e [herança](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts#understanding_inheritance), com exemplos editáveis.
2. [MDN · Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity#how_is_specificity_calculated): o cálculo em detalhe, as exceções de `:is()`, `:not()` e `:where()`, e [dicas para lidar com problemas de especificidade](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity#tips_for_handling_specificity_headaches).
3. [Chrome DevTools · View and change CSS](https://developer.chrome.com/docs/devtools/css): como ler e editar o painel Styles.

## Pratique

Exercício com correção automática: **css/01 · Preveja a cascata e o box model**. Você prevê qual regra vence antes de testar.

```bash
npm run exercicio css/01
```

## Confira se entendeu

<details><summary>Qual vence: <code>.menu a</code> ou <code>nav ul li a</code>?</summary>

`.menu a` (0-1-1) vence `nav ul li a` (0-0-4), porque uma classe vence qualquer número de seletores de tipo.
</details>

<details><summary>Duas regras com a mesma especificidade definem cores diferentes. Qual vale?</summary>

A que aparece depois no CSS.
</details>

<details><summary>Por que <code>color</code> é herdado e <code>border</code> não?</summary>

Porque propriedades de texto fazem sentido passando para os filhos, e propriedades de caixa não: cada filho ganharia a borda do pai.
</details>

<details><summary>Como descobrir por que uma declaração CSS não está sendo aplicada?</summary>

No DevTools, aba Styles: a declaração aparece riscada, e a regra que venceu aparece acima dela.
</details>
