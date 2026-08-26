import { bdd } from "./fixtures.js";
import { expect } from "@playwright/test";
import assert from "node:assert";

const { Then } = bdd;

Then("I am taken to a service page", async ({ page }) => {
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState("networkidle");
  assert.ok("/services/*");
});
