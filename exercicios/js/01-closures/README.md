# Contador e gerador de ids com closures

**Módulo 2 · JavaScript moderno · tópico: Escopo e closures**

Uma closure é uma função que "lembra" as variáveis do lugar onde foi criada, mesmo depois que esse lugar terminou de executar. É assim que se cria estado privado em JavaScript sem classes.

## O que fazer

Complete as funções em `solucao.js`:

1. **`criarContador(inicial = 0)`** devolve um objeto com três funções:
   - `incrementar(passo = 1)`: soma `passo` e devolve o novo valor;
   - `decrementar(passo = 1)`: subtrai `passo` e devolve o novo valor;
   - `valor()`: devolve o valor atual.

   O número **não** pode ficar acessível como propriedade do objeto (nada de `contador.atual = 3`). Dois contadores não podem interferir um no outro.

2. **`criarGeradorDeId(prefixo)`** devolve uma função que, a cada chamada, gera o próximo id: `"tarefa-1"`, `"tarefa-2"`, … Cada gerador conta sozinho.

3. **`umaVez(fn)`** devolve uma função que chama `fn` só na primeira vez (repassando os argumentos) e, nas próximas, devolve o mesmo resultado da primeira chamada sem chamar `fn` de novo.

## Dicas
- A variável que guarda o estado fica **dentro** da função externa, fora do objeto devolvido.
- Para `umaVez`, você precisa lembrar de duas coisas: se já chamou e qual foi o resultado.

## Rodar

```bash
npm run exercicio js/01
```

## Pronto quando
Os testes passam e você consegue explicar por que `contador.valor()` enxerga uma variável que não está no objeto.
