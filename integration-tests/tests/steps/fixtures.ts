import { test as base, createBdd } from "playwright-bdd";
import { env } from "../../env.js";
import type { UUID } from "node:crypto";
import { randomUUID } from "node:crypto";

export const test = base.extend<
  {
    skips: undefined;
    fails: undefined;
    scenarioData: Record<string, unknown>;
  },
  {
    featureData: {
      id: UUID;
      [key: string]: unknown;
    };
  }
>({
  skips: [
    async ({ $test, $tags }, use) => {
      $test.skip(
        $tags.includes("@skipDesktop") ||
          $tags.includes(`@skipTarget-${env.TEST_TARGET}`),
      );

      await use(undefined);
    },
    { auto: true },
  ],

  fails: [
    async ({ $test, $tags }, use) => {
      $test.fail(
        $tags.includes("@failDesktop") ||
          $tags.includes(`@failTarget-${env.TEST_TARGET}`),
      );

      await use(undefined);
    },
    { auto: true },
  ],

  javaScriptEnabled: async ({ $tags }, use) => {
    await use(!$tags.includes("@noJs"));
  },

  scenarioData: async ({}, use) => {
    await use({});
  },

  featureData: [
    async ({}, use) => {
      await use({
        id: randomUUID(),
      });
    },
    { scope: "worker" },
  ],
});

export const bdd = createBdd(test);
