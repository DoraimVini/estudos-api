# Mesclar e recortar objetos sem mutar

**Módulo 2 · JavaScript moderno · tópico: Objetos**

Em APIs e em React, você vai atualizar objetos o tempo todo **sem alterar o original**: cria-se um novo objeto com as mudanças. Isso evita bugs em que uma parte do código muda dados que outra parte ainda está usando.

## O que fazer

Complete as funções em `solucao.js`. Os testes congelam as entradas, então nada pode ser mutado.

1. **`mesclarProfundo(base, extra)`**: devolve um **novo** objeto com tudo de `base`, sobrescrito pelo que vier em `extra`:
   - se a chave existe nos dois e **os dois valores são objetos simples**, mescla recursivamente;
   - em qualquer outro caso (número, texto, `null`, array), o valor de `extra` substitui o de `base`;
   - objetos aninhados do resultado também devem ser novos, e não os mesmos de `base`.

   ```js
   mesclarProfundo(
     { tema: "escuro", pomodoro: { foco: 25, pausa: 5 } },
     { pomodoro: { foco: 50 } },
   ); // { tema: "escuro", pomodoro: { foco: 50, pausa: 5 } }
   ```

2. **`selecionar(obj, chaves)`**: novo objeto só com as chaves pedidas que existem em `obj`.
3. **`semCampos(obj, chaves)`**: novo objeto sem as chaves pedidas.

## Dicas
- "Objeto simples": `typeof v === "object" && v !== null && !Array.isArray(v)`.
- Spread (`{ ...a, ...b }`) faz uma cópia **rasa**: os objetos de dentro continuam sendo os mesmos.
- `Object.entries` + `Object.fromEntries` resolvem 2 e 3 em uma linha cada.

## Rodar

```bash
npm run exercicio js/03
```

## Pronto quando
Os testes passam e você sabe explicar a diferença entre cópia rasa e profunda.
