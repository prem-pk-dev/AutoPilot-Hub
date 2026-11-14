import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/workflows.html");
  await page.evaluate(() => indexedDB.deleteDatabase("autopilot-hub"));
  await page.reload();
});

test("creates, edits, searches, filters and deletes a workflow", async ({ page }) => {
  await page.getByRole("link", { name: /new workflow/i }).click();
  await page.getByLabel(/workflow name/i).fill("Website uptime check");
  await page.getByLabel(/description/i).fill("Check the public homepage response.");
  await page.getByLabel(/trigger type/i).selectOption("manual");
  await page.getByLabel(/definition status/i).selectOption("draft");
  await page.getByLabel(/tags/i).fill("monitoring, website");
  await page.getByRole("button", { name: /save workflow definition/i }).click();

  await expect(page).toHaveURL(/workflows\.html$/);
  await expect(page.getByText("Website uptime check")).toBeVisible();

  await page.getByRole("link", { name: "Edit" }).click();
  await expect(page.getByLabel(/workflow name/i)).toHaveValue("Website uptime check");
  await page.getByLabel(/workflow name/i).fill("Homepage monitor");
  await page.getByRole("button", { name: /save workflow definition/i }).click();
  await expect(page.getByText("Homepage monitor")).toBeVisible();

  await page.getByRole("searchbox", { name: /search workflows/i }).fill("does not exist");
  await expect(page.getByText(/no matching workflows/i)).toBeVisible();
  await page.getByRole("searchbox", { name: /search workflows/i }).fill("Homepage");
  await expect(page.getByText("Homepage monitor")).toBeVisible();

  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(/no matching workflows/i)).toBeVisible();
});

test("shows an empty state when no workflow exists", async ({ page }) => {
  await expect(page.getByText(/no matching workflows/i)).toBeVisible();
  await expect(page.locator("#workflow-total")).toHaveText("0");
});
