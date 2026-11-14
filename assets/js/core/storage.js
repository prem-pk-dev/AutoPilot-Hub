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
    request.onblocked = () => reject(new Error("Database upgrade is blocked by another open AutoPilot Hub tab. Close other tabs and retry."));
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
    tx.onerror = () => { db.close(); reject(tx.error || new Error("Could not read local data.")); };
  });
}

export async function putRecord(storeName, record) {
  return putManyRecords(storeName, [record]).then(() => record);
}

export async function putManyRecords(storeName, records) {
  if (!STORES.includes(storeName)) throw new Error("Unknown local data store.");
  if (!Array.isArray(records)) throw new Error("Records must be supplied as an array.");
  const key = storeName === "settings" ? "key" : "id";
  for (const record of records) {
    if (!record || typeof record[key] !== "string" || !record[key].trim()) {
      throw new Error("Every " + storeName + " record must have a valid " + key + ".");
    }
  }
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    for (const record of records) store.put(record);
    tx.oncomplete = () => { db.close(); resolve(records); };
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
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Delete was cancelled.")); };
  });
}

export async function clearWorkspace() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, "readwrite");
    for (const name of STORES) tx.objectStore(name).clear();
    tx.oncomplete = () => {
      db.close();
      try { localStorage.removeItem("autopilot-theme"); } catch {}
      resolve(true);
    };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("Could not clear workspace data.")); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Clear was cancelled.")); };
  });
}

export async function exportWorkspace() {
  const [workflows, executions, settings] = await Promise.all(STORES.map(getAll));
  let theme = "dark";
  try { theme = localStorage.getItem("autopilot-theme") === "light" ? "light" : "dark"; } catch {}
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), application: "AutoPilot Hub",
    preferences: { theme }, data: { workflows, executions, settings } };
}

function validateBackup(payload) {
  if (!payload || payload.application !== "AutoPilot Hub" || payload.schemaVersion !== 1 || !payload.data) {
    throw new Error("This file is not a supported AutoPilot Hub backup (schema version 1).");
  }
  const data = payload.data;
  for (const name of STORES) if (!Array.isArray(data[name])) {
    throw new Error("Backup is missing a valid " + name + " collection.");
  }
  for (const name of ["workflows", "executions"]) {
    for (const item of data[name]) {
      if (!item || typeof item.id !== "string" || !item.id.trim()) throw new Error("Backup contains an invalid " + name + " record.");
      if (name === "workflows" && (typeof item.name !== "string" || !item.name.trim())) {
        throw new Error("Backup contains a workflow without a valid name.");
      }
    }
  }
  for (const item of data.settings) {
    if (!item || typeof item.key !== "string" || !item.key.trim()) throw new Error("Backup contains an invalid settings record.");
  }
  if (payload.preferences?.theme !== undefined && !["dark", "light"].includes(payload.preferences.theme)) {
    throw new Error("Backup contains an unsupported theme preference.");
  }
  return data;
}

export async function importWorkspace(payload) {
  const data = validateBackup(payload);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, "readwrite");
    for (const name of STORES) {
      const store = tx.objectStore(name);
      store.clear();
      for (const item of data[name]) store.put(item);
    }
    tx.oncomplete = () => {
      db.close();
      try {
        if (payload.preferences?.theme === "light") localStorage.setItem("autopilot-theme", "light");
        else localStorage.removeItem("autopilot-theme");
      } catch {}
      resolve(true);
    };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("Could not restore workspace backup.")); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("Restore was cancelled.")); };
  });
}
