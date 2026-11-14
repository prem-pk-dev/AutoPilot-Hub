const DB_NAME = "autopilot-hub";
const DB_VERSION = 1;
const STORES = ["workflows", "executions", "settings"];

export function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB is not supported in this browser."));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, { keyPath: name === "settings" ? "key" : "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local database."));
  });
}

export async function getAll(storeName) {
  if (!STORES.includes(storeName)) throw new Error("Unknown local data store.");
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("Could not read local data."));
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

export async function putRecord(storeName, record) {
  if (!STORES.includes(storeName)) throw new Error("Unknown local data store.");
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => { db.close(); resolve(record); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("Could not save local data.")); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Save was cancelled.")); };
  });
}

export async function deleteRecord(storeName, id) {
  if (!STORES.includes(storeName)) throw new Error("Unknown local data store.");
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("Could not delete local data.")); };
  });
}

export async function clearWorkspace() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, "readwrite");
    for (const name of STORES) tx.objectStore(name).clear();
    tx.oncomplete = () => { db.close(); try { localStorage.removeItem("autopilot-theme"); } catch {} resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("Could not clear workspace data.")); };
  });
}

export async function exportWorkspace() {
  const [workflows, executions, settings] = await Promise.all(STORES.map(getAll));
  let theme = "dark"; try { theme = localStorage.getItem("autopilot-theme") === "light" ? "light" : "dark"; } catch {}
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), application: "AutoPilot Hub", preferences: { theme },
    data: { workflows, executions, settings } };
}

export async function importWorkspace(payload) {
  if (!payload || payload.application !== "AutoPilot Hub" || payload.schemaVersion !== 1 || !payload.data) {
    throw new Error("This file is not a supported AutoPilot Hub backup (schema version 1).");
  }
  const data = payload.data;
  for (const name of STORES) {
    if (!Array.isArray(data[name])) throw new Error("Backup is missing a valid " + name + " collection.");
  }
  for (const item of data.workflows) {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string") throw new Error("Backup contains an invalid workflow record.");
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, "readwrite");
    for (const name of STORES) {
      const store = tx.objectStore(name);
      store.clear();
      for (const item of data[name]) store.put(item);
    }
    tx.oncomplete = () => { db.close(); try { if (payload.preferences?.theme === "light") localStorage.setItem("autopilot-theme", "light"); else localStorage.removeItem("autopilot-theme"); } catch {} resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("Could not restore workspace backup.")); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Restore was cancelled.")); };
  });
}
