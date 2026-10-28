# Desfazer sem reescrever, e recuperar o que parecia perdido

**Módulo 1 · Git e GitHub · tópico: Desfazer coisas**

Há dois jeitos de desfazer um commit: **reescrever** o histórico (como se ele nunca tivesse existido) ou **acrescentar** um commit novo que faz o contrário. Quando o commit já foi enviado e outras pessoas podem tê-lo baixado, só o segundo jeito é seguro. E quase nada se perde de verdade no Git: ele anota por onde o `HEAD` passou.

## A situação

No repositório de treino, tudo já foi enviado para o `origin`:

1. "Cria a lista de tarefas e a configuração"
2. "Adiciona tarefa de JavaScript"
3. **"Limpa arquivos antigos"**: esse commit apagou o `config.json` **sem querer**
4. "Adiciona tarefa de inglês": trabalho bom, que tem que ficar

Além disso, você tinha uma branch `experimento` com um commit que não estava em nenhum outro lugar, e a apagou sem querer.

## O que fazer

1. Desfaça **só** o commit "Limpa arquivos antigos", **sem reescrever o histórico** que já está no remoto. O `config.json` tem que voltar com o conteúdo original, e a tarefa de inglês tem que continuar.
2. Envie a correção para o `origin`.
3. Recupere o commit da branch apagada numa branch nova chamada **`resgate`**.

## Rodar

```bash
npm run exercicio git/05
```

Na primeira vez, o comando **cria o treino** em `..\treino-git\05-desfazer\` e para com uma mensagem. Resolva dentro de `projeto`, em outro terminal:

```bash
cd ..\treino-git\05-desfazer\projeto
```

Depois, rode `npm run exercicio git/05` de novo para conferir. Para recomeçar do zero, apague a pasta `..\treino-git\05-desfazer`.

## Dicas
- `git log --oneline` mostra os hashes; `git show <hash>` mostra o que um commit fez.
- Compare `git revert` e `git reset` no tópico "Desfazer coisas": qual deles acrescenta e qual reescreve?
- O `git revert` abre um editor com a mensagem pronta ("Revert ..."). Se for o vim, digite `:wq` e Enter; ou leia sobre `--no-edit`.
- Se o `push` for recusado, **não** use `--force`: isso é sinal de que o histórico foi reescrito. Volte e pense de novo.
- `git reflog` lista por onde o `HEAD` passou, inclusive commits que nenhuma branch aponta mais.
- Leia sobre `git branch <nome> <hash>`: criar uma branch é só pendurar um nome num commit.

## Pronto quando
Os testes passam e você consegue explicar por que `git reset` seria o comando errado para o passo 1.
