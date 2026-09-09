import { bdd } from "./fixtures.js";
import assert from "node:assert";

const { Then } = bdd;

Then("I am taken to the new service page", async ({ page }) => {
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState("networkidle");
  assert.ok("/services/12345");
});
