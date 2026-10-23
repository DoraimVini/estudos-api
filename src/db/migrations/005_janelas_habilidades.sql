-- A janela de cada habilidade passa a cobrir os meses dos módulos ligados a ela.
-- SQL vem antes de TypeScript na trilha (SQL no mês 3, TS no mês 4), e CI/CD (mês 10)
-- usa a habilidade de deploy. O seed.json recebeu os mesmos valores para bancos novos.

UPDATE skills SET mes_fim = 4
WHERE nome = 'JavaScript moderno + TypeScript';

UPDATE skills SET mes_inicio = 3, mes_fim = 3
WHERE nome = 'SQL / PostgreSQL (SELECT, JOIN, modelagem simples, migrations)';

UPDATE skills SET mes_fim = 10
WHERE nome = 'Deploy, variáveis de ambiente, Docker básico';
