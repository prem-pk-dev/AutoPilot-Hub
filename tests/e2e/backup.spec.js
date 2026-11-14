import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("exports and restores a workspace backup", async ({ page }) => {
  await page.goto("/workflow-builder.html");
  await page.getByLabel(/workflow name/i).fill("Backup validation workflow");
  await page.getByRole("button", { name: /save workflow definition/i }).click();
  await page.waitForURL(/workflows\.html$/);

  await page.goto("/settings.html");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /download backup/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/autopilot-hub-backup-.*\.json/);
  const backupPath = await download.path();
  const backupBuffer = await readFile(backupPath);

  let clearDialogs = 0;
  const handleClearDialog = dialog => { clearDialogs += 1; dialog.accept(); };
  page.on("dialog", handleClearDialog);
  await page.getByRole("button", { name: /clear all local data/i }).click();
  await expect.poll(() => clearDialogs).toBe(2);
  page.off("dialog", handleClearDialog);

  page.once("dialog", dialog => dialog.accept());
  const reloadPromise = page.waitForEvent("load");
  await page.locator("#settings-import").setInputFiles({
    name: "autopilot-hub-backup.json",
    mimeType: "application/json",
    buffer: backupBuffer
  });
  await expect(page.getByText(/backup restored/i)).toBeVisible();
  await reloadPromise;
  await page.goto("/workflows.html");
  await expect(page.getByText("Backup validation workflow")).toBeVisible();
});

test("clear workspace requires two confirmations", async ({ page }) => {
  await page.goto("/settings.html");
  let dialogs = 0;
  page.on("dialog", dialog => { dialogs += 1; dialog.accept(); });
  await page.getByRole("button", { name: /clear all local data/i }).click();
  await expect.poll(() => dialogs).toBe(2);
});
