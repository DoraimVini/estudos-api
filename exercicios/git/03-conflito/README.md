# Conflito: combinar, não escolher

**Módulo 1 · Git e GitHub · tópico: Conflitos**

Um conflito acontece quando duas branches mudam o mesmo trecho de formas diferentes. O atalho tentador é escolher "o meu lado" ou "o lado deles". Muitas vezes, a resposta certa é **combinar** as duas intenções, e para isso você precisa entender o que cada lado queria.

## A situação

O `config.js` tem a porta do servidor. Duas mudanças foram feitas na **mesma linha**:

- na `main`: "Muda a porta padrão para 3100";
- na `feat/porta-env`: "Lê a porta da variável de ambiente PORT" (o padrão dela ainda era 3000).

## O que fazer

1. Integre a `feat/porta-env` na `main`. Vai dar conflito.
2. Resolva de forma que o resultado faça **as duas coisas**:
   - se a variável de ambiente `PORT` existir, a porta é o valor dela (como número);
   - se não existir, a porta é **3100**, o novo padrão da `main`.
3. Não perca a linha do `HOST`.
4. Conclua o merge.

O teste roda o seu `config.js` de verdade, com e sem a variável `PORT`. Qualquer resolução que se comporte assim passa.

## Rodar

```bash
npm run exercicio git/03
```

Na primeira vez, o comando **cria o repositório de treino** em `..\treino-git\03-conflito\projeto` e para com uma mensagem. Resolva lá, em outro terminal:

```bash
cd ..\treino-git\03-conflito\projeto
```

Depois, rode `npm run exercicio git/03` de novo para conferir. Para recomeçar do zero, apague a pasta `..\treino-git\03-conflito`.

## Dicas
- Leia as duas mensagens de commit (`git log --oneline --all`) antes de mexer no arquivo: elas dizem a intenção de cada lado.
- Entre `<<<<<<<` e `=======` fica a versão da branch em que você está; entre `=======` e `>>>>>>>`, a que está chegando.
- Apague as três linhas de marcação. Arquivo com marcação não é JavaScript válido.
- Para testar antes de commitar: `node --input-type=module -e "import('./config.js').then(console.log)"`.
- O `git commit` que conclui o merge abre um editor com a mensagem pronta. Se for o vim, digite `:wq` e Enter para salvar e sair.
- Deu tudo errado no meio? Leia sobre `git merge --abort`.

## Pronto quando
Os testes passam e você consegue explicar por que escolher só um dos lados estaria errado aqui.
