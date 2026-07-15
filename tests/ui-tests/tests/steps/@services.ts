import { expect, Locator, Page } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then(
  "the service: {string} has a link",
  async ({ page }, serviceName: string) => {
    await expect(page.getByRole("link", { name: serviceName })).toBeVisible();
    await expect(page.getByRole("link", { name: serviceName })).toHaveAttribute(
      "href",
      "#"
    );
  }
);
