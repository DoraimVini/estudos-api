# Um commit só com a correção

**Módulo 1 · Git e GitHub · tópico: Modelo do Git**

O Git não commita "o que mudou na pasta": ele commita **o que está na staging area**. É ela que deixa você separar mudanças misturadas em commits pequenos, cada um com um assunto só.

## A situação

No repositório de treino há três mudanças ainda sem commit:

- `calc.js`: a correção de um bug na função `soma`;
- `notas.txt`: uma anotação sua, ainda pela metade;
- `rascunho.txt`: um arquivo novo, que não é para o repositório.

## O que fazer

1. Faça **um** commit com **só** a correção do `calc.js`. A mensagem tem que dizer o que mudou (pelo menos 10 caracteres; "fix" e "update" não valem).
2. `notas.txt` continua **modificado no disco**, fora do commit. Não descarte a anotação.
3. `rascunho.txt` continua no disco e fora do repositório.
4. No fim, a staging area fica vazia.

## Rodar

```bash
npm run exercicio git/01
```

Na primeira vez, o comando **cria o repositório de treino** em `..\treino-git\01-staging\projeto` (ao lado da pasta `estudos-api`) e para com uma mensagem. Abra **outro** terminal lá e resolva com comandos git:

```bash
cd ..\treino-git\01-staging\projeto
```

Depois, volte ao terminal do `estudos-api` e rode `npm run exercicio git/01` de novo para conferir. Para recomeçar do zero, apague a pasta `..\treino-git\01-staging`.

## Dicas
- Antes de qualquer coisa: `git status` e `git diff`. Eles mostram em que estado cada arquivo está.
- `git diff --staged` mostra o que **vai** entrar no próximo commit. Confira antes de commitar.
- Adicionou um arquivo à staging sem querer? Leia sobre `git restore --staged` (ele tira da staging sem mexer no arquivo).
- Cuidado com `git add .` e `git commit -a`: eles pegam tudo de uma vez.

## Pronto quando
Os testes passam e você consegue explicar, com este exercício, a diferença entre working tree, staging area e repositório.
