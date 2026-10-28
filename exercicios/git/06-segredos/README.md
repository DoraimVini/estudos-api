# Tirar o .env e o node_modules do repositório

**Módulo 1 · Git e GitHub · tópico: .gitignore e segredos**

Três coisas nunca vão para o repositório: **segredos** (`.env`, chaves, senhas), **dependências** (`node_modules`, que o `npm install` recria) e **arquivos gerados** (bancos locais, builds). Esquecer o `.gitignore` no primeiro commit é um erro muito comum, e consertar depois tem um detalhe que pega muita gente.

## A situação

O primeiro commit do repositório de treino levou junto o `.env` (com uma chave de mentira) e a pasta `node_modules`. Ainda não existe `.gitignore`.

## O que fazer

1. Faça o Git **parar de rastrear** o `.env` e o `node_modules`, **sem apagá-los do seu disco** (o seu app ainda precisa deles).
2. Crie um `.gitignore` para que eles não voltem a aparecer no `git status`.
3. Crie um `.env.example` com o **nome** da variável e **sem o valor**, para quem clonar saber o que preencher.
4. Commite tudo. No fim, o `git status` fica limpo.

## Rodar

```bash
npm run exercicio git/06
```

Na primeira vez, o comando **cria o repositório de treino** em `..\treino-git\06-segredos\projeto` e para com uma mensagem. Resolva lá, em outro terminal:

```bash
cd ..\treino-git\06-segredos\projeto
```

Depois, rode `npm run exercicio git/06` de novo para conferir. Para recomeçar do zero, apague a pasta `..\treino-git\06-segredos`.

## Dicas
- Criar o `.gitignore` **não basta**: ele só vale para arquivos que o Git ainda não rastreia. Teste e veja.
- Leia sobre a opção `--cached` do `git rm`: ela tira o arquivo do índice e deixa o arquivo no disco. Para uma pasta, ela precisa de `-r`.
- `git check-ignore -v .env` diz se um arquivo está ignorado e por qual regra.
- No PowerShell, `Set-Content arquivo.txt "linha 1","linha 2"` cria um arquivo de texto com uma linha por item. Abrir no editor (`code .gitignore`) e salvar também serve.

## E o segredo que já foi commitado?
Ele **continua no histórico**: qualquer um com o repositório consegue ver o primeiro commit. Num projeto real, considere a chave **vazada** e troque-a no serviço de onde ela veio. Reescrever o histórico (com ferramentas como o `git filter-repo`) não adianta se alguém já clonou. Por isso o `.gitignore` vem **antes** do primeiro commit.

## Pronto quando
Os testes passam e você consegue explicar por que o `.gitignore` sozinho não tirou o `.env` do repositório.
