import { AxeBuilder } from "@axe-core/playwright";
import { bdd } from "./fixtures.js";
import { expect } from "@playwright/test";
import assert from "node:assert";

const { Then, Given } = bdd;

const pageNameToPath: Record<string, string> = {
  home: "/",
  "404 error": "/random-page",
  "500 error": "/error",
  services: "/services",
  "create service": "/services/create",
  service: "/services/serviceId",
  client: "/services/serviceId/clients/clientId",
  "client - edit id token signing algorithm":
    "/services/serviceId/clients/clientId/edit-id-token-signing-algorithm",
  "client - edit is active":
    "/services/serviceId/clients/clientId/edit-is-active",
  "create client": "/services/serviceId/clients/create",
  "create client - enter client name":
    "/services/serviceId/clients/create/enter-client-name",
  "create client - edit client name":
    "/services/serviceId/clients/create/edit-client-name",
  "create client - select client authentication":
    "/services/serviceId/clients/create/select-client-authentication",
  "create client - edit client authentication":
    "/services/serviceId/clients/create/edit-client-authentication",
  "create client - enter redirect urls":
    "/services/serviceId/clients/create/enter-redirect-urls",
  "create client - select scopes":
    "/services/serviceId/clients/create/select-scopes",
  "create client - support identity verification":
    "/services/serviceId/clients/create/support-identity-verification",
  "create client - select claims":
    "/services/serviceId/clients/create/select-claims",
  "create client - enter landing page url":
    "/services/serviceId/clients/create/enter-landing-page-url",
  "create client - select levels of confidence":
    "/services/serviceId/clients/create/select-levels-of-confidence",
  "create client - summary": "/services/serviceId/clients/create/summary",
  "create client - success": "/services/serviceId/clients/create/success",
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

Then(
  "the page has the exact text: {string}",
  async ({ page }, text: string) => {
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
);

Then("the page has the heading: {string}", async ({ page }, text: string) => {
  await expect(page.getByRole("heading", { name: text })).toBeVisible();
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
  await expect(page.getByText("One Login Admin").first()).toBeVisible();
});

Then("the navigation bar shows", async ({ page }) => {
  const elements = page.locator('[aria-label="Menu"]');
  await expect(elements).toBeVisible();
});

Then("the side navigation shows", async ({ page }) => {
  const elements = page.locator('[aria-label="Service menu"]');
  await expect(elements).toBeVisible();
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

Then(
  "the error message: {string} shows",
  async ({ page }, errorMessage: string) => {
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText("There is a problem")).toBeVisible();
    const alert = page.getByRole("alert");
    await expect(alert.getByText(errorMessage)).toBeVisible();
    await expect(page.getByText(errorMessage).last()).toBeVisible();
  }
);

Then(
  "the page contains the button: {string} with the href: {string}",
  async ({ page }, text: string, href: string) => {
    await expect(page.getByRole("button", { name: text })).toBeVisible();
    await expect(page.getByRole("button", { name: text })).toHaveAttribute(
      "href",
      href
    );
  }
);

Then(
  "I enter {string} into the field {string}",
  async ({ page }, text: string, label: string) => {
    await expect(page.getByRole("textbox", { name: label })).toBeVisible();
    await page.getByRole("textbox", { name: label }).fill(text);
  }
);

Given("I click the {string} button", async ({ page }, name: string) => {
  await page.getByRole("button", { name, exact: true }).click();
});

Given("I click the {string} link", async ({ page }, name: string) => {
  await page.getByRole("link", { name, exact: true }).click();
});

Then("I am taken to the {string} page", async ({ page }, pageName: string) => {
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState("networkidle");
  assert.ok(pageNameToPath[pageName]);
  await expect(page).toHaveURL(pageNameToPath[pageName]);
});

Then(
  "the page contains the breadcrumbs: {string}",
  async ({ page }, breadcrumbsString: string) => {
    const breadcrumbsList = breadcrumbsString.split(",");
    breadcrumbsList.map(async (breadcrumb) => {
      await expect(
        page.getByRole("listitem").filter({ hasText: breadcrumb })
      ).toBeVisible();
    });
  }
);

Then(
  "the table contains the text: {string}",
  async ({ page }, text: string) => {
    await expect(
      page.getByRole("cell", { name: text, exact: true })
    ).toBeVisible();
  }
);

Then(
  "I check the radio button: {string}",
  async ({ page }, radioButtonLabel: string) => {
    await expect(
      page.getByRole("radio", { name: radioButtonLabel })
    ).toBeVisible();
    await page.getByRole("radio", { name: radioButtonLabel }).check();
    await expect(
      page.getByRole("radio", { name: radioButtonLabel })
    ).toBeChecked();
  }
);

Then(
  "I check the checkbox: {string}",
  async ({ page }, checkboxLabel: string) => {
    await expect(
      page.getByRole("checkbox", { name: checkboxLabel })
    ).toBeVisible();
    await page.getByRole("checkbox", { name: checkboxLabel }).check();
    await expect(
      page.getByRole("checkbox", { name: checkboxLabel })
    ).toBeChecked();
  }
);

Then(
  "the field: {string} has the value: {string}",
  async ({ page }, fieldName: string, value: string) => {
    await expect(page.locator(`#${fieldName}`)).toBeVisible();
    await expect(
      page.locator(`#${fieldName}`, { hasText: value })
    ).toBeVisible();
  }
);

Then(
  "I click the change button for: {string} in the {string} section on the summary page",
  async ({ page }, fieldName: string, section: string) => {
    page
      .getByRole("link", { name: `Change   ${fieldName} (${section})` })
      .click();
  }
);

Then(
  "the field input: {string} has the value: {string}",
  async ({ page }, fieldName: string, value: string) => {
    await expect(page.locator(`input#${fieldName}`)).toBeVisible();
    await expect(page.locator(`input#${fieldName}`)).toHaveValue(value);
  }
);
