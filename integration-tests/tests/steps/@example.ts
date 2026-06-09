import { expect } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then("the header links to the home page", async ({ page }) => {
  await expect(
    page.getByText("One Login Admin", { exact: true }),
  ).toBeVisible();
  await page.getByText("One Login Admin", { exact: true }).click();
  await expect(page).toHaveURL("/");
});
