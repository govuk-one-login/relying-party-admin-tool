import { expect } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then(
  "entering {string} shows the validation {string}",
  async ({ page }, input: string, validation: string) => {
    await page.getByLabel("Add a post logout redirect URL").fill(input);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(validation)).toBeVisible();
  }
);
