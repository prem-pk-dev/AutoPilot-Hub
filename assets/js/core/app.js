import { getAll, exportWorkspace, openDatabase } from "./storage.js";

const byId = (id) => document.getElementById(id);
const safeText = (value) => String(value ?? "");

function toast(message) {
  const region = byId("toast-region");
  if (!region) return;
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  region.append(item);
  window.setTimeout(() => item.remove(), 3200);
}

async function refreshDashboard() {
  try {
    const db = await openDatabase();
    db.close();
    byId("db-health").textContent = "Available";
    byId("db-health").className = "healthy";
    const healthBadge = document.querySelector(".health-badge");
    if (healthBadge) healthBadge.innerHTML = "<i></i> Healthy";

    const [workflows, executions] = await Promise.all([getAll("workflows"), getAll("executions")]);
    byId("workflow-count").textContent = safeText(workflows.length);
    byId("execution-count").textContent = safeText(executions.length);
    byId("failed-count").textContent = safeText(executions.filter((run) => run.status === "failed").length);

    const sorted = [...executions].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6);
    if (sorted.length) {
      byId("activity-empty").hidden = true;
      const list = byId("activity-list");
      list.hidden = false;
      list.replaceChildren();
      for (const run of sorted) {
        const row = document.createElement("div");
        row.className = "health-row";
        const label = document.createElement("span");
        label.textContent = safeText(run.name || "Automation execution");
        const status = document.createElement("b");
        status.textContent = safeText(run.status || "unknown");
        row.append(label, status);
        list.append(row);
      }
    }
  } catch (error) {
    byId("db-health").textContent = "Unavailable";
    byId("db-health").className = "pending";
    const healthBadge = document.querySelector(".health-badge");
    if (healthBadge) healthBadge.textContent = "Storage unavailable";
    byId("workflow-count").textContent = "—";
    byId("execution-count").textContent = "—";
    byId("failed-count").textContent = "—";
    toast(error.message || "Local storage is unavailable.");
  }
}

async function exportData() {
  try {
    const data = await exportWorkspace();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `autopilot-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Workspace backup exported.");
  } catch (error) {
    toast(error.message || "Could not export workspace data.");
  }
}

function initTheme() {
  let saved = null;\n  try { saved = localStorage.getItem("autopilot-theme"); } catch {}
  if (saved === "light") document.documentElement.dataset.theme = "light";
  byId("theme-toggle")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    if (next === "dark") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try { localStorage.setItem("autopilot-theme", next); } catch { toast("Theme changed for this session, but browser storage is unavailable."); }
  });
}

function initNavigation() {
  const sidebar = byId("sidebar");
  byId("menu-toggle")?.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) && !event.target.closest("#menu-toggle")) {
      sidebar.classList.remove("open");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  byId("export-data")?.addEventListener("click", exportData);
  refreshDashboard();
});
