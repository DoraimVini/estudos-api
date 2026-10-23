import { defineConfig } from "vitest/config";

// npm test (e o CI): só os testes da API. Os testes de exercicios/ falham de propósito
// até você resolver, então rodam à parte com vitest.exercicios.config.js.
export default defineConfig({
  test: {
    include: ["test/**/*.test.js"],
  },
});
