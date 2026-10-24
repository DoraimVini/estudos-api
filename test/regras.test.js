import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

// Os rulesets do GitHub ficam versionados em .github/rulesets/ (aplicados com gh api, ver README).
// Estes testes não falam com o GitHub: conferem que os arquivos dizem o que combinamos e que
// os checks exigidos existem no CI. Um check exigido que nenhum job produz trava todo PR.
const PASTA = new URL("../.github/rulesets/", import.meta.url);
const RULESETS = readdirSync(PASTA).map((f) => JSON.parse(readFileSync(new URL(f, PASTA), "utf8")));
const CI = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const GITHUB_ACTIONS = 15368; // id do app GitHub Actions: só um check vindo dele conta

const jobsDoCi = [...CI.split(/^jobs:\s*$/m)[1].matchAll(/^ {2}([a-z][\w-]*):\s*$/gm)].map((m) => m[1]);

/** Regras que valem para uma branch, juntando todos os rulesets que a incluem. */
const regrasDa = (branch) => RULESETS
  .filter((r) => r.conditions.ref_name.include.includes(`refs/heads/${branch}`))
  .flatMap((r) => r.rules);
const checksDa = (branch) => regrasDa(branch)
  .filter((r) => r.type === "required_status_checks")
  .flatMap((r) => r.parameters.required_status_checks);

describe("rulesets do GitHub (.github/rulesets/)", () => {
  it("todo check exigido é um job do CI e vem do GitHub Actions", () => {
    expect(jobsDoCi).toEqual(["testes", "origem"]);
    for (const check of [...checksDa("main"), ...checksDa("develop")]) {
      expect(jobsDoCi, `check "${check.context}"`).toContain(check.context);
      expect(check.integration_id, `check "${check.context}"`).toBe(GITHUB_ACTIONS);
    }
  });

  it("main e develop: só por PR com CI verde, sem apagar, sem force push e sem exceção", () => {
    for (const branch of ["main", "develop"]) {
      const tipos = regrasDa(branch).map((r) => r.type);
      expect(tipos, branch).toEqual(expect.arrayContaining(["deletion", "non_fast_forward", "pull_request"]));
      expect(checksDa(branch).map((c) => c.context), branch).toContain("testes");

      const pr = regrasDa(branch).find((r) => r.type === "pull_request").parameters;
      // 0 aprovações: o GitHub não deixa o autor aprovar o próprio PR, e o repo tem uma pessoa só.
      expect(pr).toMatchObject({ required_approving_review_count: 0, allowed_merge_methods: ["merge"], required_review_thread_resolution: true });
    }
    for (const r of RULESETS) expect(r).toMatchObject({ enforcement: "active", bypass_actors: [] });
  });

  it("main exige o check de origem, que só aceita a develop", () => {
    expect(checksDa("main").map((c) => c.context)).toContain("origem");
    expect(checksDa("develop").map((c) => c.context)).not.toContain("origem");
  });

  it("o nome da branch do PR só entra no CI por variável de ambiente", () => {
    // ${{ github.head_ref }} dentro de um run: seria colado no shell (injeção de comandos).
    const usos = CI.split("\n").filter((linha) => linha.includes("github.head_ref"));
    expect(usos.map((l) => l.trim())).toEqual(["ORIGEM: ${{ github.head_ref }}"]);
  });
});
