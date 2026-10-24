-- Identificadores fixos (slugs) para módulos e tópicos, vindos do trilha.json.
-- Antes, o tópico era identificado pela posição (módulo, ordem): reordenar a trilha trocava o progresso de lugar.
-- Agora a posição é só ordem de exibição. Os bancos que já existem recebem os slugs na próxima
-- sincronização, casando pela posição atual uma única vez (ver sincronizarTrilha).

ALTER TABLE modulos ADD COLUMN slug TEXT;   -- nome da pasta do conteúdo, ex.: 'javascript'
ALTER TABLE topicos ADD COLUMN slug TEXT;   -- identidade do tópico, ex.: 'escopo-e-closures'

CREATE UNIQUE INDEX idx_topicos_slug ON topicos (slug);
