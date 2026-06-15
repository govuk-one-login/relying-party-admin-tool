import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import playwrightEslint from "eslint-plugin-playwright";
import vitestEslint from "@vitest/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig(
  includeIgnoreFile(
    fileURLToPath(new URL(".gitignore", import.meta.url)),
    "Imported .gitignore patterns",
  ),
  eslint.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.js"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    plugins: {
      vitest: vitestEslint,
    },
    files: ["src/**/*.test.ts"],
    rules: {
      ...vitestEslint.configs.all.rules,
      "vitest/prefer-importing-vitest-globals": "off",
      "vitest/no-hooks": "off",
      "vitest/prefer-expect-assertions": "off",
      "vitest/require-mock-type-parameters": "off",
      "vitest/valid-title": "off",
    },
  },
  {
    ...playwrightEslint.configs["flat/recommended"],
    files: ["tests/ui-tests/tests/**"],
    rules: {
      ...playwrightEslint.configs["flat/recommended"].rules,
      "playwright/no-standalone-expect": "off",
    },
  },
  {
    ignores: [
      "eslint.config.ts",
      "vitest.config.ts",
      "tests/ui-tests/playwright.config.ts",
    ],
  },
);
