import { AxeBuilder } from "@axe-core/playwright";
import { bdd } from "./fixtures.js";
import { expect } from "@playwright/test";
import assert from "node:assert";

const { Then, Given } = bdd;

const pageNameToPath: Record<string, string> = {
  home: "/",
  services: "/services",
};

Then("the page meets our accessibility standards", async ({ page }) => {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag22aa"])
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

Given("I go to the {string} page", async ({ page }, pageName: string) => {
  assert.ok(pageNameToPath[pageName]);
  await page.goto(pageNameToPath[pageName]);
});

Then("the page title is {string}", async ({ page }, pageTitle: string) => {
  expect(await page.title()).toBe(pageTitle);
});

Given("the page has finished loading", async ({ page }) => {
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState("networkidle");
});

Then("the page contains the text: {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

Then("the page looks as expected", async ({ page }) => {
  expect(
    await page.screenshot({
      fullPage: true,
      quality: 50,
      type: "jpeg",
      mask: [page.locator("[data-test-mask]")],
    })
  ).toMatchSnapshot();
});

Then("I click the browser's back button", async ({ page }) => {
  await page.goBack();
});

Then("the header shows", async ({ page }) => {
  await expect(
    page.getByText("One Login Admin", { exact: true })
  ).toBeVisible();
});

Then("the navigation bar shows", async ({ page }) => {
  await expect(page.getByRole("navigation")).toBeVisible();
});

Then("the footer shows", async ({ page }) => {
  await expect(
    page.getByRole("list").filter({
      has: page.getByRole("link", {
        name: "About GOV.UK One Login",
        exact: true,
      }),
    })
  ).toBeVisible();
});
