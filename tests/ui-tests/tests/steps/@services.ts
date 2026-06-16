import { expect, Locator, Page } from "@playwright/test";
import { bdd } from "./fixtures";

const { Then } = bdd;

Then(
  "the service: {string} has a manage link",
  async ({ page }, serviceName: string) => {
    const parent = await getServiceInfoCard(page, serviceName);
    await expect(parent.getByRole("link", { name: "Manage" })).toBeVisible();
    await expect(parent.getByRole("link", { name: "Manage" })).toHaveAttribute(
      "href",
      "#"
    );
  }
);

Then(
  "the service: {string} has the description: {string}",
  async ({ page }, serviceName: string, description: string) => {
    const parent = await getServiceInfoCard(page, serviceName);
    await expect(parent.getByText("Description")).toBeVisible();
    await expect(parent.getByText(description)).toBeVisible();
  }
);

Then(
  "the service: {string} has no description",
  async ({ page }, serviceName: string) => {
    const parent = await getServiceInfoCard(page, serviceName);
    await expect(parent).not.toContainText("Description");
  }
);

const getServiceInfoCard = async (
  page: Page,
  serviceName: string
): Promise<Locator> => {
  await expect(page.getByRole("heading", { name: serviceName })).toBeVisible();
  const heading = page.getByRole("heading", { name: serviceName });
  await expect(
    page.getByRole("listitem").filter({ has: heading })
  ).toBeVisible();
  const parent = page.getByRole("listitem").filter({ has: heading });
  return parent;
};
