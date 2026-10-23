import { Router } from "express";
import { notFound, badRequest } from "../errors.js";
import { parseId, validarStatusExercicio } from "../validators.js";
import { lerEnunciado } from "../db/exercicios.js";

export function exerciciosRouter(repos) {
  const router = Router();

  // GET /exercicios?modulo=6&status=Pendente
  router.get("/", (req, res) => {
    const { status } = req.query;
    const modulo = req.query.modulo === undefined ? undefined : Number(req.query.modulo);
    if (modulo !== undefined && (!Number.isInteger(modulo) || modulo < 1)) {
      throw badRequest("modulo deve ser um inteiro positivo.");
    }
    validarStatusExercicio(status);
    res.json(repos.exercicios.listar({ modulo, status }));
  });

  // GET /exercicios/:id  -> exercício com o enunciado e o comando para rodar os testes.
  // Não há PATCH de propósito: só os testes (npm run exercicio) marcam como resolvido.
  router.get("/:id", (req, res) => {
    const exercicio = repos.exercicios.buscar(parseId(req.params.id));
    if (!exercicio) throw notFound("Exercício");
    res.json({
      ...exercicio,
      comando: `npm run exercicio ${exercicio.slug}`,
      enunciado: lerEnunciado(exercicio.slug),
    });
  });

  return router;
}
