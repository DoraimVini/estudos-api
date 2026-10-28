# Conserte os 7 problemas de acessibilidade

**Módulo 3 · HTML, CSS e acessibilidade · tópico: Acessibilidade**

A página desta pasta parece normal para quem enxerga e usa mouse. Para quem usa leitor de tela ou navega só com o teclado, ela tem **7 problemas**, todos muito comuns em sites de verdade. Cada um tem uma correção pequena, quase sempre em HTML puro.

## Os problemas

1. **O gráfico** não tem texto alternativo. Quem não vê a imagem perde a informação dela.
2. **O divisor** é só enfeite, mas também está sem `alt`: o leitor de tela vai ler o nome do arquivo.
3. **O link da engrenagem** não tem nome: o leitor de tela diz só "link".
4. **"Clique aqui"** não diz para onde o link leva (quem navega pela lista de links ouve "clique aqui" fora de contexto).
5. **O botão Buscar** é uma `div` com `onclick`: não recebe foco com Tab e não funciona com Enter.
6. **O campo de busca** só tem `placeholder`, que some ao digitar e não é um rótulo.
7. **O CSS esconde o foco** (`outline: none`): quem navega com Tab não sabe onde está.

## O que fazer

Corrija os 7 no `solucao.html` desta pasta. Para conferir de verdade, abra o arquivo no navegador e:
- navegue **só com o Tab** (e Enter no botão): dá para chegar em tudo e ver onde o foco está?
- no Chrome, rode o **Lighthouse** (DevTools → Lighthouse → Accessibility). As imagens não existem no disco, então vão aparecer quebradas; o que importa aqui é o HTML delas.

## Rodar

```bash
npm run exercicio html/03
```

## Dicas
- `alt` informativo diz **o que a imagem comunica**, não o que ela é. "Gráfico" sozinho não ajuda; o que o gráfico mostra, sim.
- Imagem decorativa leva `alt=""` (vazio, mas presente). Sem o atributo, o leitor de tela improvisa.
- Num link que só tem imagem, o `alt` da imagem vira o nome do link.
- O texto de um link deve fazer sentido sozinho, fora da frase.
- Para o foco: apagar a regra resolve; se o contorno padrão te incomoda, troque por um estilo seu em `:focus-visible`.
- `aria-label` também daria nome a algumas coisas, mas a regra é: ARIA só quando o HTML não basta. Aqui ele basta.

## Pronto quando
Os testes passam e você consegue usar a página inteira sem mouse. Bônus: rode o Lighthouse e veja se ele ainda aponta alguma coisa (os testes não cobrem tudo o que ele mede, como contraste).
