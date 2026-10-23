import { defineConfig } from "vitest/config";

// Usado por npm run exercicio: roda só os testes de exercicios/.
export default defineConfig({
  test: {
    include: ["exercicios/**/*.test.js"],
  },
});
