const byId = (id) => document.getElementById(id);
function initTheme() {
  try { if (localStorage.getItem("autopilot-theme") === "light") document.documentElement.dataset.theme = "light"; } catch {}
  byId("theme-toggle")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    if (next === "dark") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try { localStorage.setItem("autopilot-theme", next); } catch {}
  });
}
function initNavigation() {
  const sidebar = byId("sidebar");
  byId("menu-toggle")?.addEventListener("click", () => sidebar?.classList.toggle("open"));
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 760 && sidebar?.classList.contains("open") &&
        !sidebar.contains(event.target) && !event.target.closest("#menu-toggle")) sidebar.classList.remove("open");
  });
}
document.addEventListener("DOMContentLoaded", () => { initTheme(); initNavigation(); });
