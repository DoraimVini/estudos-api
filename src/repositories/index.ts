import type { DatabaseSync } from "node:sqlite";
import { skillsRepository } from "./skills.ts";
import { coursesRepository } from "./courses.ts";
import { sessionsRepository } from "./sessions.ts";
import { configRepository } from "./config.ts";
import { trilhaRepository } from "./trilha.ts";
import { exerciciosRepository } from "./exercicios.ts";

/** Cria todos os repositórios sobre o mesmo banco. As rotas recebem este objeto, nunca o db. */
export function criarRepositorios(db: DatabaseSync) {
  return {
    skills: skillsRepository(db),
    courses: coursesRepository(db),
    sessions: sessionsRepository(db),
    config: configRepository(db),
    trilha: trilhaRepository(db),
    exercicios: exerciciosRepository(db),
  };
}

/** Tipo do objeto que as rotas recebem (deduzido da função acima). */
export type Repositorios = ReturnType<typeof criarRepositorios>;
