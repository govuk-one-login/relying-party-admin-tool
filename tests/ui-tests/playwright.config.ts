import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { cucumberReporter, defineBddConfig } from "playwright-bdd";
import { env } from "./env";
import { getBaseUrl } from "./utils/getBaseUrl";
import { loadEnvFile } from "node:process";

const testDir = defineBddConfig({
  features: "tests/features/**/*.feature",
  steps: "tests/steps/**/*.ts",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
try {
  loadEnvFile(path.resolve(__dirname, ".env"));
} catch (err) {}

export default defineConfig({
  testDir,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  forbidOnly: !env.HUMAN_IN_THE_LOOP,
  preserveOutput: "failures-only",
  workers: "50%",
  snapshotPathTemplate: `./${env.UPDATE_SNAPSHOTS ? "snapshots-updated" : "snapshots"}/{projectName}/{testFilePath}/{arg}{ext}`,
  reporter: env.TEST_REPORT_DIR
    ? [
        // See https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/3054010402/How+to+run+tests+against+your+deployed+application+in+a+SAM+deployment+pipeline#Test-reports
        cucumberReporter("json", {
          outputFile: path.join(env.TEST_REPORT_DIR, "report.json"),
        }),
      ]
    : undefined,
  webServer:
    env.TEST_TARGET === "local"
      ? [
          {
            command: "npm run run-app",
            url: "http://localhost:6001/healthcheck",
            reuseExistingServer: true,
            timeout: 300000,
            name: "app-server",
            gracefulShutdown: { signal: "SIGTERM", timeout: 30000 },
          },
          {
            command: "npm run start-test-server",
            url: "http://localhost:8000",
            reuseExistingServer: true,
            timeout: 300000,
            name: "test-server",
            gracefulShutdown: { signal: "SIGTERM", timeout: 30000 },
          },
        ]
      : undefined,
  use: {
    baseURL: getBaseUrl(),
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chromium",
      },
    },
  ],
});
