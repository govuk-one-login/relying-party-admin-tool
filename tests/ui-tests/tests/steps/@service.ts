import { expect } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then("the side navigation shows with correct urls", async ({ page }) => {
  await expect(page.locator('[aria-label="Service menu"]')).toBeVisible();
  const locator = page.locator('[aria-label="Service menu"]');
  await expect(
    locator.getByRole("link", { name: "Clients", exact: true })
  ).toBeVisible();
  await expect(
    locator.getByRole("link", { name: "Clients", exact: true })
  ).toHaveAttribute("href", "/services/serviceId");
  await expect(
    locator.getByRole("link", { name: "Clients", exact: true })
  ).toHaveAttribute("aria-current", "true");
  await expect(
    locator.getByRole("link", { name: "Team members", exact: true })
  ).toBeVisible();
  await expect(
    locator.getByRole("link", { name: "Team members", exact: true })
  ).toHaveAttribute("href", "/services/serviceId/team-members");
  await expect(page.locator('[aria-current="true"]')).toBeVisible();
});
