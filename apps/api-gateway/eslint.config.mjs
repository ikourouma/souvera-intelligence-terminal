import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Phase 0E.3 — SDC anti-hardcode guard
 *
 * Files under src/data/ must not contain numeric literals that represent
 * economic facts (GDP, trade values, FDI, percentages, population).
 * All such values belong in souvera_country_observations or
 * souvera_country_trade_snapshots (DB-backed).
 *
 * Exceptions:
 *   - caribbean-eccu-macro.ts: curated fill seed (ingestion only, not render)
 *   - source-registry.ts: source IDs and routing constants only
 *   - knowledge-base.ts: RAG lookup store, not rendered directly
 */
const sdcNoHardcodedFacts = {
  files: ["src/data/**/*.ts"],
  ignores: [
    "src/data/caribbean-eccu-macro.ts",
    "src/data/source-registry.ts",
    "src/data/knowledge-base.ts",
  ],
  rules: {
    // Warn (not error) until migration is complete — upgrade to 'error' in Phase 1
    "no-magic-numbers": [
      "warn",
      {
        ignore: [0, 1, -1, 100],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
        enforceConst: false,
        detectObjects: true,
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  sdcNoHardcodedFacts,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

export default eslintConfig;
