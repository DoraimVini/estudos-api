// Roda os testes de um exercício e registra o resultado no banco.
//   npm run exercicio            -> lista os exercícios e o status de cada um
//   npm run exercicio sql/03     -> roda os testes de exercicios/sql/03-join
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { openDatabase } from "../db/database.js";
import { CATALOGO } from "../db/exercicios.js";
import { criarRepositorios } from "../repositories/index.js";
import { hojeISO } from "../datas.js";

const RAIZ = fileURLToPath(new URL("../../", import.meta.url));
const VITEST = fileURLToPath(new URL("../../node_modules/vitest/vitest.mjs", import.meta.url));

const repos = criarRepositorios(openDatabase());
const pedido = process.argv[2]?.replace(/\\/g, "/").replace(/\/$/, "");

if (!pedido) {
  listar();
} else {
  const candidatos = CATALOGO.filter((e) => e.slug === pedido || e.slug.startsWith(pedido));
  if (candidatos.length !== 1) {
    console.error(candidatos.length
      ? `"${pedido}" é ambíguo: ${candidatos.map((e) => e.slug).join(", ")}`
      : `Exercício "${pedido}" não encontrado. Rode "npm run exercicio" para ver a lista.`);
    process.exitCode = 1;
  } else {
    rodar(candidatos[0].slug);
  }
}

function rodar(slug) {
  const { status } = spawnSync(
    process.execPath,
    [VITEST, "run", "--config", "vitest.exercicios.config.js", `exercicios/${slug}/`],
    { cwd: RAIZ, stdio: "inherit" },
  );
  const passou = status === 0;
  const exercicio = repos.exercicios.registrarTentativa(slug, passou, hojeISO());

  if (passou) {
    console.log(`\n✅ ${slug} resolvido (tentativa ${exercicio.tentativas}).`);
    const proximo = repos.exercicios.listar({ modulo: exercicio.modulo_id, status: "Pendente" })[0];
    console.log(proximo
      ? `Próximo do módulo: npm run exercicio ${proximo.slug}`
      : "Você resolveu todos os exercícios deste módulo!");
  } else {
    console.log(`\n❌ Ainda não (tentativa ${exercicio.tentativas}). Releia o README.md de exercicios/${slug}/.`);
  }
  process.exitCode = status ?? 1;
}

function listar() {
  for (const e of repos.exercicios.listar()) {
    const marca = e.status === "Resolvido" ? "✅" : "⬜";
    console.log(`${marca} ${e.slug.padEnd(22)} ${e.titulo}`);
  }
  console.log('\nRode um exercício com: npm run exercicio js/01');
}
