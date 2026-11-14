import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadCloudWorkflow, runCloudWorkflow } from "../../scripts/cloud-runner.mjs";

const fixture = (steps = [{ type: "github_repo_health", owner: "sample-owner", repository: "sample-repo" }], enabled = true) => ({
  schemaVersion: 1,
  workflows: [{ id: "sample-repo-health", name: "Sample repo health", enabled, steps }]
});

test("loads only a valid enabled allow-listed workflow", async () => {
  const dir = await mkdtemp(join(tmpdir(), "autopilot-cloud-"));
  const path = join(dir, "workflows.json");
  await writeFile(path, JSON.stringify(fixture()));
  const workflow = await loadCloudWorkflow("sample-repo-health", path);
  assert.equal(workflow.steps[0].type, "github_repo_health");
  await rm(dir, { recursive: true, force: true });
});

test("rejects disabled, unknown and unsupported workflows", async () => {
  const dir = await mkdtemp(join(tmpdir(), "autopilot-cloud-"));
  const path = join(dir, "workflows.json");
  await writeFile(path, JSON.stringify(fixture([], false)));
  await assert.rejects(loadCloudWorkflow("sample-repo-health", path), /disabled/);
  await writeFile(path, JSON.stringify(fixture([{ type: "run_shell", command: "echo unsafe" }])));
  await assert.rejects(loadCloudWorkflow("sample-repo-health", path), /unsupported cloud action/);
  await assert.rejects(loadCloudWorkflow("unknown-workflow", path), /Unknown cloud workflow_id/);
  await rm(dir, { recursive: true, force: true });
});

test("writes a successful repository health report without credentials", async () => {
  const dir = await mkdtemp(join(tmpdir(), "autopilot-cloud-"));
  const configPath = join(dir, "workflows.json"), reportPath = join(dir, "report.json");
  await writeFile(configPath, JSON.stringify(fixture()));
  const fetchImpl = async (url, options) => {
    assert.equal(url.href, "https://api.github.com/repos/sample-owner/sample-repo");
    assert.equal(options.method, "GET");
    assert.equal(options.headers.Authorization, undefined);
    return { ok: true, json: async () => ({ full_name: "sample-owner/sample-repo", default_branch: "main", stargazers_count: 12, open_issues_count: 3, forks_count: 4, pushed_at: "2026-01-01T00:00:00Z" }) };
  };
  const { report } = await runCloudWorkflow("sample-repo-health", { configPath, reportPath, fetchImpl });
  assert.equal(report.status, "succeeded");
  assert.equal(report.steps[0].output.stars, 12);
  const saved = JSON.parse(await readFile(reportPath, "utf8"));
  assert.equal(saved.workflowId, "sample-repo-health");
  await rm(dir, { recursive: true, force: true });
});

test("records API failures in the report and returns failed status", async () => {
  const dir = await mkdtemp(join(tmpdir(), "autopilot-cloud-"));
  const configPath = join(dir, "workflows.json"), reportPath = join(dir, "report.json");
  await writeFile(configPath, JSON.stringify(fixture()));
  const { report } = await runCloudWorkflow("sample-repo-health", {
    configPath, reportPath,
    fetchImpl: async () => ({ ok: false, status: 503 })
  });
  assert.equal(report.status, "failed");
  assert.match(report.steps[0].error, /HTTP 503/);
  await rm(dir, { recursive: true, force: true });
});

test("rejects arbitrary URLs and malformed repository identifiers", async () => {
  const dir = await mkdtemp(join(tmpdir(), "autopilot-cloud-"));
  const path = join(dir, "workflows.json");
  await writeFile(path, JSON.stringify(fixture([{ type: "github_repo_health", owner: "https://evil.example", repository: "repo" }])));
  await assert.rejects(loadCloudWorkflow("sample-repo-health", path), /invalid GitHub repository target/);
  await rm(dir, { recursive: true, force: true });
});
