import { expect } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then(
  "the field: {string} has the value: {string}",
  async ({ page }, fieldName: string, value: string) => {
    await expect(page.locator(`#${fieldName}`)).toBeVisible();
    await expect(
      page.locator(`#${fieldName}`, { hasText: value })
    ).toBeVisible();
  }
);
