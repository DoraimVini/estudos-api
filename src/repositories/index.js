import { skillsRepository } from "./skills.js";
import { coursesRepository } from "./courses.js";
import { sessionsRepository } from "./sessions.js";
import { configRepository } from "./config.js";

/** Cria todos os repositórios sobre o mesmo banco. As rotas recebem este objeto, nunca o db. */
export function criarRepositorios(db) {
  return {
    skills: skillsRepository(db),
    courses: coursesRepository(db),
    sessions: sessionsRepository(db),
    config: configRepository(db),
  };
}
