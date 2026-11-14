import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function createWorkflow(page, name, description = "Automated test workflow") {
  await page.goto("/workflow-builder.html");
  await page.getByLabel("Workflow name").fill(name);
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "Save workflow definition" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/workflows.html");
  await expect(page.locator(".workflow-card").filter({ hasText: name })).toBeVisible();
}
test("create, search, filter, edit and delete a workflow", async ({ page }) => {
  await createWorkflow(page, "QA website audit");
  await page.getByLabel("Search workflows").fill("website audit");
  await expect(page.locator(".workflow-card")).toHaveCount(1);
  await page.getByLabel("Search workflows").fill("does not exist");
  await expect(page.locator("#workflow-empty")).toBeVisible();
  await page.getByLabel("Search workflows").fill("");
  await page.getByLabel("Filter workflows").selectOption("draft");
  await expect(page.locator(".workflow-card")).toHaveCount(1);
  await page.locator(".workflow-card").getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Workflow name").fill("QA website audit updated");
  await page.getByRole("button", { name: "Save workflow definition" }).click();
  await expect(page.locator(".workflow-card").filter({ hasText: "QA website audit updated" })).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await page.locator(".workflow-card").getByRole("button", { name: "Delete" }).click();
  await expect(page.locator(".workflow-card")).toHaveCount(0);
});
test("workflow JSON import validates the entire file before saving and exports definitions", async ({ page }, testInfo) => {
  await page.goto("/workflows.html");
  await page.locator("#workflow-import").setInputFiles({ name:"invalid-workflows.json", mimeType:"application/json", buffer:Buffer.from(JSON.stringify([{name:"Valid workflow"},{name:"x"}])) });
  await expect(page.locator("#toast-region")).toContainText("Nothing was imported");
  await expect(page.locator(".workflow-card")).toHaveCount(0);
  await page.locator("#workflow-import").setInputFiles({ name:"workflows.json", mimeType:"application/json", buffer:Buffer.from(JSON.stringify([{name:"Imported monitor",description:"Imported safely",status:"draft"}])) });
  await expect(page.locator(".workflow-card").filter({hasText:"Imported monitor"})).toBeVisible();
  const exportPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Export workflows"}).click();
  const exported=await exportPromise, exportPath=testInfo.outputPath("workflows-export.json");
  await exported.saveAs(exportPath);
  const exportedData=JSON.parse(await readFile(exportPath,"utf8"));
  expect(exportedData.workflows.some(item=>item.name==="Imported monitor")).toBeTruthy();
});
test("workspace backup restores workflows and theme preference", async ({ page }, testInfo) => {
  await createWorkflow(page, "Backup source workflow");
  await page.goto("/settings.html");
  await page.locator("#theme-toggle-settings").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Download backup"}).click();
  const download=await downloadPromise, backupPath=testInfo.outputPath("workspace-backup.json");
  await download.saveAs(backupPath);
  const backup=JSON.parse(await readFile(backupPath,"utf8"));
  expect(backup.application).toBe("AutoPilot Hub");
  expect(backup.preferences.theme).toBe("light");
  expect(backup.data.workflows.some(item=>item.name==="Backup source workflow")).toBeTruthy();
  await createWorkflow(page,"Temporary workflow");
  await page.goto("/settings.html");
  page.once("dialog",dialog=>dialog.accept());
  await page.locator("#settings-import").setInputFiles(backupPath);
  await expect(page.locator("#toast-region")).toContainText("Backup restored");
  await page.waitForTimeout(900);
  await page.goto("/workflows.html");
  await expect(page.locator(".workflow-card").filter({hasText:"Backup source workflow"})).toBeVisible();
  await expect(page.locator(".workflow-card").filter({hasText:"Temporary workflow"})).toHaveCount(0);
  await page.goto("/settings.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
});
test("clear local workspace requires two confirmations", async ({ page }) => {
  await createWorkflow(page,"Data to clear");
  await page.goto("/settings.html");
  let confirmations=0;
  page.on("dialog",dialog=>{confirmations+=1;dialog.accept();});
  await page.getByRole("button",{name:"Clear all local data"}).click();
  await expect.poll(()=>confirmations).toBe(2);
  await page.goto("/workflows.html");
  await expect(page.locator(".workflow-card")).toHaveCount(0);
});
test("mobile navigation opens and layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/workflows.html");
  await page.getByRole("button",{name:"Toggle navigation"}).click();
  await expect(page.locator("#sidebar")).toHaveClass(/open/);
  const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport+1);
});
test("dashboard reflects real workflow count from IndexedDB", async ({ page }) => {
  await createWorkflow(page,"Dashboard count record");
  await page.goto("/dashboard.html");
  await expect(page.locator("#workflow-count")).toHaveText("1");
});

test("invalid workspace backup is rejected without replacing existing data", async ({ page }) => {
  await createWorkflow(page, "Keep this workflow");
  await page.goto("/settings.html");
  const invalidBackup = {
    application: "AutoPilot Hub",
    schemaVersion: 1,
    preferences: { theme: "dark" },
    data: { workflows: [], executions: [], settings: [{ value: "missing key" }] }
  };
  page.once("dialog", dialog => dialog.accept());
  await page.locator("#settings-import").setInputFiles({
    name: "invalid-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(invalidBackup))
  });
  await expect(page.locator("#toast-region")).toContainText("invalid settings record");
  await page.goto("/workflows.html");
  await expect(page.locator(".workflow-card").filter({ hasText: "Keep this workflow" })).toBeVisible();
});
