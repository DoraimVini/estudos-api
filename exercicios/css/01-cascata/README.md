# Preveja a cascata e o box model

**Módulo 3 · HTML, CSS e acessibilidade · tópico: Seletores e cascata**

Aqui você não escreve CSS: você **prevê** o que o navegador faz. Quando duas regras disputam a mesma propriedade, quem vence? Qual a largura final de uma caixa? Responda em `solucao.js` **antes** de testar no navegador: o objetivo é entender a regra, não descobrir por tentativa.

Todas as respostas foram conferidas num navegador de verdade. No teste, o gabarito está guardado só como hash, para você não ver a resposta por acidente.

## Quem vence? (responda com o nome da cor: `"red"`, `"blue"` ou `"green"`)

**`cor1`**: qual a cor do parágrafo?
```html
<style>
  p { color: red; }
  .destaque { color: blue; }
  #intro { color: green; }
</style>
<p id="intro" class="destaque">Olá</p>
```

**`cor2`**: qual a cor do parágrafo?
```html
<style>
  .card p { color: red; }
  p.texto { color: blue; }
</style>
<div class="card"><p class="texto">Olá</p></div>
```

**`cor3`**: qual a cor do link? (repare na ordem das regras)
```html
<style>
  .menu a { color: blue; }
  ul li a { color: red; }
</style>
<ul class="menu"><li><a href="#">Início</a></li></ul>
```

**`cor4`**: qual a cor do parágrafo?
```html
<style>
  p { color: red !important; }
  #intro { color: green; }
</style>
<p id="intro">Olá</p>
```

**`cor5`**: qual a cor do parágrafo? (ele não tem regra própria... ou tem?)
```html
<style>
  div { color: red; }
  * { color: blue; }
</style>
<div><p>Olá</p></div>
```

**`especificidade`**: qual a especificidade deste seletor, no formato `"a,b,c"` (ids, classes/pseudo-classes, tipos/pseudo-elementos)?
```css
#menu .item:hover > a::before
```

## Box model (responda com números, em px)

**`larguraContentBox`**: qual a largura **total ocupada pela caixa**, da borda esquerda à direita (sem contar a margem)?
```css
.caixa { width: 200px; padding: 20px; border: 5px solid; margin: 10px; }
```

**`conteudoBorderBox`**: com a mesma regra **mais** `box-sizing: border-box`, qual a largura da **área de conteúdo** (por dentro do padding)?

**`espacoEntreBlocos`**: dois blocos um embaixo do outro. Quantos px de espaço ficam entre eles?
```css
.a { margin-bottom: 30px; }
.b { margin-top: 20px; }
```
```html
<div class="a">A</div>
<div class="b">B</div>
```

## Rodar

```bash
npm run exercicio css/01
```

## Dicas
- Especificidade se compara como um placar **(ids, classes, tipos)**, da esquerda para a direita. A ordem no arquivo só desempata.
- `!important` passa por cima da especificidade (e por isso é um último recurso).
- Herança não tem especificidade nenhuma: qualquer regra que pegue o elemento diretamente vence o valor herdado.
- No `content-box` (o padrão), `width` é só o conteúdo; padding e borda somam por fora.
- Margens verticais de blocos vizinhos **colapsam**. Leia sobre isso no tópico "Box model".

## Pronto quando
Os testes passam e você consegue justificar cada resposta com a regra, sem "testei e deu isso".
