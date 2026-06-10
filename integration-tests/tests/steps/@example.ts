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

Then("the navigation bar shows with correct urls", async ({ page }) => {
  await expect(page.getByRole("navigation")).toBeVisible();
  const locator = page.getByRole("navigation");
  await expect(
    locator.getByRole("link", { name: "About", exact: true }),
  ).toBeVisible();
  await expect(
    locator.getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/about");
  await expect(
    locator.getByRole("link", { name: "Documentation", exact: true }),
  ).toBeVisible();
  await expect(
    locator.getByRole("link", { name: "Documentation", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/documentation");
  await expect(
    locator.getByRole("link", { name: "Support", exact: true }),
  ).toBeVisible();
  await expect(
    locator.getByRole("link", { name: "Support", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/support");
  await expect(
    locator.getByRole("link", { name: "Get started", exact: true }),
  ).toBeVisible();
  await expect(
    locator.getByRole("link", { name: "Get started", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/get-started");
  await expect(
    locator.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    locator.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveAttribute("href", "/sign-in");
});

Then("the footer shows with correct urls", async ({ page }) => {
  await expect(
    page.getByRole("list").filter({
      has: page.getByRole("link", {
        name: "About GOV.UK One Login",
        exact: true,
      }),
    }),
  ).toBeVisible();
  const aboutList = page.getByRole("list").filter({
    has: page.getByRole("link", {
      name: "About GOV.UK One Login",
      exact: true,
    }),
  });

  await expect(
    aboutList.getByRole("link", {
      name: "About GOV.UK One Login",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    aboutList.getByRole("link", {
      name: "About GOV.UK One Login",
      exact: true,
    }),
  ).toHaveAttribute("href", "http://localhost:3000/about");
  await expect(
    aboutList.getByRole("link", { name: "Documentation", exact: true }),
  ).toBeVisible();
  await expect(
    aboutList.getByRole("link", { name: "Documentation", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/documentation");
  await expect(
    aboutList.getByRole("link", { name: "Blog", exact: true }),
  ).toBeVisible();
  await expect(
    aboutList.getByRole("link", { name: "Blog", exact: true }),
  ).toHaveAttribute("href", "https://gds.blog.gov.uk/category/govuk-onelogin/");

  await expect(
    page.getByRole("list").filter({
      has: page.getByRole("link", {
        name: "Chat to us on Slack",
        exact: true,
      }),
    }),
  ).toBeVisible();
  const supportList = page.getByRole("list").filter({
    has: page.getByRole("link", { name: "Chat to us on Slack", exact: true }),
  });

  await expect(
    supportList.getByRole("link", { name: "Contact us", exact: true }),
  ).toBeVisible();
  await expect(
    supportList.getByRole("link", { name: "Contact us", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/support");
  await expect(
    supportList.getByRole("link", { name: "Chat to us on Slack", exact: true }),
  ).toBeVisible();
  await expect(
    supportList.getByRole("link", { name: "Chat to us on Slack", exact: true }),
  ).toHaveAttribute(
    "href",
    "https://ukgovernmentdigital.slack.com/archives/C02AQUJ6WTC",
  );
  await expect(
    supportList.getByRole("link", { name: "Status page", exact: true }),
  ).toBeVisible();
  await expect(
    supportList.getByRole("link", { name: "Status page", exact: true }),
  ).toHaveAttribute("href", "https://status.account.gov.uk");

  await expect(
    page.getByRole("list").filter({
      has: page.getByRole("link", { name: "Accessibility", exact: true }),
    }),
  ).toBeVisible();
  const inlineList = page.getByRole("list").filter({
    has: page.getByRole("link", { name: "Accessibility", exact: true }),
  });

  await expect(
    inlineList.getByRole("link", { name: "Accessibility", exact: true }),
  ).toBeVisible();
  await expect(
    inlineList.getByRole("link", { name: "Accessibility", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/accessibility");
  await expect(
    inlineList.getByRole("link", { name: "Privacy", exact: true }),
  ).toBeVisible();
  await expect(
    inlineList.getByRole("link", { name: "Privacy", exact: true }),
  ).toHaveAttribute(
    "href",
    "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice",
  );
  await expect(
    inlineList.getByRole("link", { name: "Cookies", exact: true }),
  ).toBeVisible();
  await expect(
    inlineList.getByRole("link", { name: "Cookies", exact: true }),
  ).toHaveAttribute("href", "http://localhost:3000/cookies");

  await expect(
    page.getByRole("link", { name: "Government Digital Service", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Government Digital Service", exact: true }),
  ).toHaveAttribute(
    "href",
    "https://www.gov.uk/government/organisations/government-digital-service",
  );
});
