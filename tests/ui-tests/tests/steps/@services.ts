import { expect, Locator, Page } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then(
  "the service: {string} has a link with service id {string}",
  async ({ page }, serviceName: string, serviceId: string) => {
    await expect(page.getByRole("link", { name: serviceName })).toBeVisible();
    await expect(page.getByRole("link", { name: serviceName })).toHaveAttribute(
      "href",
      `/services/${serviceId}`
    );
  }
);
