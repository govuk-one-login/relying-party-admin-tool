import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import playwrightEslint from "eslint-plugin-playwright";
import vitestEslint from "@vitest/eslint-plugin";

export default defineConfig(
  includeIgnoreFile(
    fileURLToPath(new URL(".gitignore", import.meta.url)),
    "Imported .gitignore patterns",
  ),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    plugins: {
      vitest: vitestEslint,
    },
    files: ["**/*.test.ts"],
    rules: {
      ...vitestEslint.configs.all.rules,
      "vitest/prefer-importing-vitest-globals": "off",
    },
  },
  {
    ...playwrightEslint.configs["flat/recommended"],
    files: ["integration-tests/tests/**"],
    rules: {
      ...playwrightEslint.configs["flat/recommended"].rules,
      "playwright/no-standalone-expect": "off",
    },
  },
  {
    ignores: [
      "eslint.config.ts",
      "vitest.config.ts",
      "integration-tests/playwright.config.ts",
    ],
  },
);
