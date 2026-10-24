> **Tempo estimado:** 40 min · **Fontes:** Chrome DevTools (*View and change CSS*) · Lighthouse (*Overview* e *Accessibility scoring*)

## Em poucas palavras

O **DevTools** é o laboratório que vem dentro do navegador: você inspeciona qualquer elemento, descobre de onde vem cada regra CSS, testa mudanças ao vivo, vê as requisições de rede e os erros do JavaScript. O **Lighthouse**, que fica dentro do próprio DevTools, faz uma **auditoria automática** da página: performance, acessibilidade, boas práticas e SEO, com uma nota e uma lista do que corrigir.

Abra com **F12** (ou botão direito › **Inspecionar**).

## As abas que você mais vai usar

| Aba | Para quê |
|---|---|
| **Elements** | A árvore HTML ao vivo. Em **Styles**, as regras aplicadas ao elemento (as riscadas perderam a disputa); em **Computed**, o valor final e o diagrama do box model |
| **Console** | Erros do JavaScript e um lugar para testar código na página |
| **Network** | Cada requisição: URL, status, tempo e resposta. Ótima para depurar a API |
| **Lighthouse** | A auditoria automática |

## Truques que economizam horas

- **Editar CSS ao vivo** na aba Styles, ou clicar em **`+`** para criar uma regra nova. Nada é salvo no arquivo: quando funcionar, copie para o seu CSS.
- **Forçar estados**: no botão **`:hov`**, marque `:hover` ou `:focus` para ver o estilo sem precisar manter o mouse em cima.
- **Selos `flex` e `grid`** ao lado dos elementos: abrem os editores visuais e desenham a grade sobre a página.
- **Modo de dispositivo** (Ctrl+Shift+M): simula larguras de celular e tablet.
- **Contraste**: clicando num quadradinho de cor na aba Styles, o seletor mostra a taxa de contraste e se ela passa no AA e no AAA.

## Rodando o Lighthouse

1. Abra a página que quer auditar (por exemplo, o painel em `http://localhost:3000`).
2. F12 › aba **Lighthouse** (se não aparecer, procure no `»`).
3. Deixe as categorias marcadas e clique em **Analyze page load**.
4. Em 30 a 60 segundos sai o relatório. Cada item reprovado explica o problema e leva à documentação de como corrigir.

**Sobre a nota de acessibilidade:** ela é uma média ponderada de verificações automáticas, cada uma aprovada ou reprovada. As **verificações manuais nem entram na nota**: o relatório só as lista para você conferir. Uma nota 100 significa "passou no que dá para checar automaticamente", e não "é acessível". O teste com teclado e com leitor de tela do tópico anterior continua necessário.

## Na prática

1. Rode o Lighthouse no painel de estudos e leia o relatório de **Accessibility** item por item, incluindo a seção de verificações manuais.
2. Na aba **Network**, clique em Estudar num tópico e encontre a requisição `GET /api/v1/topicos/...`: veja o status e a resposta JSON.
3. Na aba **Console**, digite `document.querySelectorAll("h2").length` e confira quantas seções a página tem.
4. Para o **mini-projeto do módulo** (a página de portfólio), use o Lighthouse até chegar a 100 em acessibilidade, e depois faça o teste manual com teclado.

## Armadilhas comuns

- **Editar no DevTools e esquecer de copiar** para o arquivo: ao recarregar, tudo some.
- **Rodar o Lighthouse com extensões do navegador ativas**: elas afetam o resultado. Use uma janela anônima.
- **Tratar a nota como meta final**: o importante são os itens do relatório, e principalmente os manuais.
- **Ignorar o Console**: um erro vermelho ali costuma explicar por que "o botão não faz nada".

## Leia na documentação oficial

1. [Chrome DevTools · View and change CSS](https://developer.chrome.com/docs/devtools/css): tutorial interativo da aba Styles (ver, adicionar declarações e classes, pseudoestados, box model).
2. [Chrome DevTools · Inspect network activity](https://developer.chrome.com/docs/devtools/network): tutorial da aba Network.
3. [Lighthouse · Overview](https://developer.chrome.com/docs/lighthouse/overview): o que o Lighthouse audita e como rodar pelo DevTools.
4. [Lighthouse · Accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring): como a nota de acessibilidade é calculada.

## Confira se entendeu

<details><summary>Uma declaração aparece riscada na aba Styles. O que isso quer dizer?</summary>

Que ela foi vencida por outra regra (mais específica ou posterior), que aparece acima no painel.
</details>

<details><summary>Como ver o estilo de <code>:hover</code> de um botão sem manter o mouse em cima?</summary>

No botão `:hov` da aba Styles, marcando o estado `:hover`.
</details>

<details><summary>Nota 100 em acessibilidade no Lighthouse quer dizer que a página é acessível?</summary>

Não. Quer dizer que passou nas verificações automáticas. As verificações manuais nem entram na nota e precisam ser feitas à parte.
</details>

<details><summary>Onde ver a resposta que a API devolveu para uma requisição do painel?</summary>

Na aba Network do DevTools: clique na requisição e abra a aba Response (ou Preview).
</details>
