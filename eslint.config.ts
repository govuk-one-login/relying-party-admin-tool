import eslint from "@eslint/js";
import { RulesConfig } from "@eslint/core";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import playwrightEslint from "eslint-plugin-playwright";
import vitestEslint from "@vitest/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const defaultVitestRules: Partial<RulesConfig> = {
  "vitest/prefer-importing-vitest-globals": "off",
  "vitest/no-hooks": "off",
  "vitest/prefer-expect-assertions": "off",
  "vitest/require-mock-type-parameters": "off",
  "vitest/valid-title": "off",
  "vitest/prefer-describe-function-title": "off",
  "vitest/prefer-lowercase-title": "off",
  "no-undef": "off",
};
export default defineConfig(
  includeIgnoreFile(
    fileURLToPath(new URL(".gitignore", import.meta.url)),
    "Imported .gitignore patterns"
  ),
  {
    languageOptions: {
      ecmaVersion: "latest",
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
  },
  eslint.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.js"],
    ignores: ["src/**/*.test.ts"],
    extends: [...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
    },
  },
  {
    plugins: {
      vitest: vitestEslint,
    },
    files: ["src/**/*.test.ts"],
    rules: {
      ...vitestEslint.configs.all.rules,
      ...defaultVitestRules,
    },
  },
  {
    plugins: {
      vitest: vitestEslint,
    },
    files: ["integration-tests/*.ts"],
    rules: {
      ...vitestEslint.configs.all.rules,
      ...defaultVitestRules,
      // These are required because we are extending `it` in base.ts
      // and the plugin gets a bit confused when we do that
      "vitest/require-hook": "off",
      "vitest/no-standalone-expect": "off",
    },
  },
  {
    ...playwrightEslint.configs["flat/recommended"],
    files: ["tests/ui-tests/tests/**"],
    rules: {
      ...playwrightEslint.configs["flat/recommended"].rules,
      "playwright/no-standalone-expect": "off",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" },
      ],
    },
  },
  {
    ignores: [
      "eslint.config.ts",
      "vitest.config.ts",
      "tests/ui-tests/playwright.config.ts",
    ],
  }
);
