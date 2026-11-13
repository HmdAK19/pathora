import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const publicApiPatterns = [
  {
    group: ["@/entities/*/*", "@/features/*/*", "@/widgets/*/*"],
    message:
      "Import a slice through its public index instead of reaching into its internals.",
  },
];

const restrictedImports = (groups = []) => [
  "error",
  {
    patterns: [
      ...publicApiPatterns,
      ...(groups.length > 0
        ? [
            {
              group: groups,
              message:
                "This import violates the architecture's one-way dependency flow.",
            },
          ]
        : []),
    ],
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports(),
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports([
        "@/entities/**",
        "@/features/**",
        "@/widgets/**",
        "@/app/**",
      ]),
    },
  },
  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports([
        "@/features/**",
        "@/widgets/**",
        "@/app/**",
      ]),
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports(["@/widgets/**", "@/app/**"]),
    },
  },
  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports(["@/app/**"]),
    },
  },
  globalIgnores([
    ".next/**",
    "coverage/**",
    "out/**",
    "build/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
