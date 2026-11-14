import { test, expect } from "@playwright/test";

test("dashboard links to workflow tools and settings", async ({ page }) => {
  await page.goto("/dashboard.html");
  await page.getByRole("link", { name: /workflows/i }).first().click();
  await expect(page).toHaveURL(/workflows\.html$/);
  await page.getByRole("link", { name: /settings/i }).click();
  await expect(page).toHaveURL(/settings\.html$/);
});

test("mobile navigation opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard.html");
  const sidebar = page.locator("#sidebar");
  await page.getByRole("button", { name: /toggle navigation/i }).click();
  await expect(sidebar).toHaveClass(/open/);
  await page.getByRole("button", { name: /toggle navigation/i }).click();
  await expect(sidebar).not.toHaveClass(/open/);
});
