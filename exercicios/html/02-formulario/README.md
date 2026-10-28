# Formulário acessível com validação nativa

**Módulo 3 · HTML, CSS e acessibilidade · tópico: Formulários**

O HTML já sabe muita coisa sobre formulários: ligar cada campo ao seu nome, abrir o teclado certo no celular, recusar um e-mail inválido e enviar com Enter. Tudo isso sem uma linha de JavaScript, **se** você usar as tags e os atributos certos. O formulário desta pasta não usa nenhum.

## O que fazer

Corrija o `solucao.html` desta pasta:

1. **Todo campo tem um `<label>` ligado a ele.** Texto solto do lado não conta, e `placeholder` também não (ele some quando você digita).
2. **Nome**: obrigatório.
3. **E-mail**: com o tipo de campo de e-mail, e obrigatório.
4. **Telefone**: com o tipo de campo de telefone.
5. **CEP**: obrigatório, com um `pattern` que aceite `20000-000` e `20000000` (5 dígitos, hífen opcional, 3 dígitos) e mais nada.
6. **Nível**: os três radios dentro de um `<fieldset>` com uma `<legend>` que diga "Nível". Escolher um nível é obrigatório.
7. **Termos**: aceitar é obrigatório.
8. **Enviar**: um `<button>` de envio de verdade, sem `onclick`.

Abra o arquivo no navegador e tente enviar com campos vazios ou um CEP errado: o próprio navegador vai reclamar. O envio em si vai dar erro de página não encontrada, porque não existe servidor aqui, e tudo bem.

## Rodar

```bash
npm run exercicio html/02
```

## Dicas
- Duas formas de ligar um `<label>`: `for` apontando para o `id` do campo, ou o `<label>` envolvendo o campo.
- Clique no texto do rótulo no navegador: se o campo ganhar foco, a ligação está certa.
- No `pattern`, `\d` é um dígito e `{5}` repete 5 vezes. O navegador já exige o valor inteiro, do começo ao fim.
- Em um grupo de radios, basta `required` em um deles para o grupo inteiro ser obrigatório.
- O `type` padrão de um `<button>` dentro de um formulário já é `submit`, mas escreva assim mesmo: deixa a intenção clara.

## Pronto quando
Os testes passam, você navega pelo formulário inteiro só com o Tab, e o navegador barra o envio com o CEP `2000-000`.
