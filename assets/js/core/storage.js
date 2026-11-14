const DB_NAME = "autopilot-hub";
const DB_VERSION = 1;
const STORES = ["workflows", "executions", "settings"];

export function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("workflows")) db.createObjectStore("workflows", { keyPath: "id" });
      if (!db.objectStoreNames.contains("executions")) db.createObjectStore("executions", { keyPath: "id" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local database."));
  });
}

export async function getAll(storeName) {
  if (!STORES.includes(storeName)) throw new Error("Unknown local data store.");
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
    request.onsuccess = () => { resolve(request.result || []); db.close(); };
    request.onerror = () => { reject(request.error); db.close(); };
  });
}

export async function exportWorkspace() {
  const [workflows, executions, settings] = await Promise.all(STORES.map(getAll));
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    application: "AutoPilot Hub",
    data: { workflows, executions, settings }
  };
}
