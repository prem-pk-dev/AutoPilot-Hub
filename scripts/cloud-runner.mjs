import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const CONFIG_PATH = resolve(ROOT, "automation/cloud-workflows.json");
const REPORT_PATH = resolve(process.env.AUTOPILOT_REPORT_PATH || resolve(ROOT, "artifacts/cloud-run-report.json"));
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{2,63}$/;
const REPO_PATTERN = /^[A-Za-z0-9_.-]{1,100}$/;

export async function loadCloudWorkflow(id, configPath = CONFIG_PATH) {
  if (typeof id !== "string" || !ID_PATTERN.test(id)) throw new Error("A valid workflow_id is required.");
  const payload = JSON.parse(await readFile(configPath, "utf8"));
  if (payload?.schemaVersion !== 1 || !Array.isArray(payload.workflows)) throw new Error("Cloud workflow configuration schema is invalid.");
  const workflow = payload.workflows.find(item => item?.id === id);
  if (!workflow) throw new Error("Unknown cloud workflow_id: " + id);
  if (workflow.enabled !== true) throw new Error("This cloud workflow is disabled.");
  if (!Array.isArray(workflow.steps) || workflow.steps.length < 1 || workflow.steps.length > 5) {
    throw new Error("A cloud workflow must contain 1 to 5 supported steps.");
  }
  for (const [index, step] of workflow.steps.entries()) {
    if (step?.type !== "github_repo_health") throw new Error("Step " + (index + 1) + " uses an unsupported cloud action.");
    if (typeof step.owner !== "string" || !REPO_PATTERN.test(step.owner) || typeof step.repository !== "string" || !REPO_PATTERN.test(step.repository)) {
      throw new Error("Step " + (index + 1) + " has an invalid GitHub repository target.");
    }
  }
  return workflow;
}

async function runStep(step, fetchImpl = globalThis.fetch) {
  const endpoint = new URL("/repos/" + encodeURIComponent(step.owner) + "/" + encodeURIComponent(step.repository), "https://api.github.com");
  const response = await fetchImpl(endpoint, {
    method: "GET",
    headers: { "Accept": "application/vnd.github+json", "User-Agent": "AutoPilot-Hub-Cloud-Runner" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error("GitHub API returned HTTP " + response.status + ".");
  const data = await response.json();
  if (!data || typeof data.full_name !== "string" || typeof data.default_branch !== "string") {
    throw new Error("GitHub returned an unexpected repository response.");
  }
  return {
    fullName: data.full_name,
    description: typeof data.description === "string" ? data.description : "",
    visibility: data.visibility || (data.private === true ? "private" : "public"),
    defaultBranch: data.default_branch,
    stars: Number.isInteger(data.stargazers_count) ? data.stargazers_count : 0,
    openIssues: Number.isInteger(data.open_issues_count) ? data.open_issues_count : 0,
    forks: Number.isInteger(data.forks_count) ? data.forks_count : 0,
    pushedAt: data.pushed_at || null,
    fetchedAt: new Date().toISOString()
  };
}

export async function runCloudWorkflow(id, options = {}) {
  const workflow = await loadCloudWorkflow(id, options.configPath || CONFIG_PATH);
  const report = {
    application: "AutoPilot Hub",
    schemaVersion: 1,
    workflowId: workflow.id,
    workflowName: workflow.name,
    runtime: "github-actions",
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
    steps: []
  };
  try {
    for (const [index, step] of workflow.steps.entries()) {
      const startedAt = new Date().toISOString();
      try {
        const output = await runStep(step, options.fetchImpl || globalThis.fetch);
        report.steps.push({ index: index + 1, type: step.type, status: "succeeded", startedAt, completedAt: new Date().toISOString(), output });
      } catch (error) {
        report.steps.push({ index: index + 1, type: step.type, status: "failed", startedAt, completedAt: new Date().toISOString(), error: error.message || "Cloud step failed." });
        throw error;
      }
    }
    report.status = "succeeded";
  } catch (error) {
    report.status = "failed";
    report.error = error.message || "Cloud workflow failed.";
  }
  report.completedAt = new Date().toISOString();
  const reportPath = options.reportPath || REPORT_PATH;
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", { mode: 0o600 });
  return { report, reportPath };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const id = process.env.INPUT_WORKFLOW_ID || process.argv[2] || "";
  try {
    const { report, reportPath } = await runCloudWorkflow(id);
    console.log("Cloud workflow: " + report.workflowName);
    console.log("Status: " + report.status);
    console.log("Report: " + reportPath);
    if (report.status !== "succeeded") process.exitCode = 1;
  } catch (error) {
    console.error(error.message || "Cloud runner failed.");
    process.exitCode = 1;
  }
}
