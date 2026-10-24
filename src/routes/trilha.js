import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarStatusTopico, somenteCampos } from "../validators.js";
import { resumirModulo } from "../services/trilha.js";
import { hojeISO } from "../datas.js";
import { lerMes } from "./plano.js";
import { lerConteudo, slugsComConteudo } from "../db/conteudo.js";

export function trilhaRouter(repos, { agora = () => new Date() } = {}) {
  const router = Router();

  // GET /modulos?fase=1  -> módulos com status e progresso calculados
  router.get("/modulos", (req, res) => {
    const fase = req.query.fase === undefined ? undefined : Number(req.query.fase);
    if (fase !== undefined && ![1, 2].includes(fase)) throw badRequest("fase deve ser 1 ou 2.");
    const mes = lerMes(repos, req.query, agora);
    res.json(repos.trilha.listarModulos({ fase }).map((m) => resumirModulo(m, mes)));
  });

  // GET /modulos/:id  -> módulo completo: tópicos, recursos e habilidade ligada
  router.get("/modulos/:id", (req, res) => {
    const id = parseId(req.params.id);
    const modulo = repos.trilha.buscarModulo(id);
    if (!modulo) throw notFound("Módulo");
    const comConteudo = slugsComConteudo(modulo.slug);
    res.json({
      ...resumirModulo(modulo, lerMes(repos, req.query, agora)),
      topicos: repos.trilha.topicosDoModulo(id).map((t) => ({ ...t, tem_conteudo: comConteudo.has(t.slug) })),
      recursos: repos.trilha.recursosDoModulo(id),
      exercicios: repos.exercicios.listar({ modulo: id }),
    });
  });

  // GET /topicos/:id  -> tópico com o conteúdo de estudo (Markdown) e os vizinhos no módulo
  router.get("/topicos/:id", (req, res) => {
    const topico = repos.trilha.buscarTopico(parseId(req.params.id));
    if (!topico) throw notFound("Tópico");
    const irmaos = repos.trilha.topicosDoModulo(topico.modulo_id);
    const vizinho = (ordem) => {
      const t = irmaos.find((x) => x.ordem === ordem);
      return t ? { id: t.id, nome: t.nome } : null;
    };
    res.json({
      ...topico,
      conteudo: lerConteudo(topico.modulo_slug, topico.slug),
      anterior: vizinho(topico.ordem - 1),
      proximo: vizinho(topico.ordem + 1),
    });
  });

  // PATCH /topicos/:id  { "status": "Concluído" }  -> concluido_em é preenchido com a data de hoje
  router.patch("/topicos/:id", (req, res) => {
    const id = parseId(req.params.id);
    const body = req.body ?? {};
    somenteCampos(body, ["status"]);
    if (body.status === undefined) throw badRequest("Envie o campo status.");
    validarStatusTopico(body.status);
    if (!repos.trilha.buscarTopico(id)) throw notFound("Tópico");

    const concluido_em = body.status === "Concluído" ? hojeISO(agora()) : null;
    res.json(repos.trilha.atualizarTopico(id, { status: body.status, concluido_em }));
  });

  return router;
}
