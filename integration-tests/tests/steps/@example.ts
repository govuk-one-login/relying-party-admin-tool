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

Then("the navigation bar shows", async ({ page }) => {
  await expect(
    page.getByRole("link", { name: "One Login Admin Tool", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "About", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/about");
  await expect(
    page.getByRole("link", { name: "Documentation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Documentation", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/documentation");
  await expect(
    page.getByRole("link", { name: "Support", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Support", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/support");
  await expect(
    page.getByRole("link", { name: "Get started", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Get started", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/get-started");
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveAttribute("href", "/sign-in");
});
