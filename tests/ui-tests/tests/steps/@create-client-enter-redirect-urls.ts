import { expect, Locator, Page } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then(
  "I click on the remove button for: {string}",
  async ({ page }, text: string) => {
    await expect(
      page.getByRole("row").filter({
        has: page.getByRole("cell", {
          name: text,
          exact: true,
        }),
      })
    ).toBeVisible();
    const row = page.getByRole("row").filter({
      has: page.getByRole("cell", { name: text, exact: true }),
    });
    await expect(
      row.getByRole("button", { name: `Remove Remove ${text}`, exact: true })
    ).toBeVisible();
    await row
      .getByRole("button", { name: `Remove Remove ${text}`, exact: true })
      .click();
  }
);

Then(
  "the table does not contains the text: {string}",
  async ({ page }, text: string) => {
    await expect(page.getByRole("cell", { name: text })).toBeHidden();
  }
);

Then(
  "entering {string} shows the validation {string}",
  async ({ page }, input: string, validation: string) => {
    await page.getByLabel("Add a redirect URL").fill(input);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(validation)).toBeVisible();
  }
);
