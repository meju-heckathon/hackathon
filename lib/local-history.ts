import type { AnalyzeResult } from "./analyze-schema";

const DB_NAME = "hangul-finance-lens";
const STORE = "analyses";
const VERSION = 1;

export type HistoryEntry = {
  id: string;
  createdAt: number;
  imageBlob: Blob;
  imageType: string;
  imageWidth: number;
  imageHeight: number;
  result: AnalyzeResult;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const store = transaction.objectStore(STORE);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function saveEntry(entry: HistoryEntry) {
  await tx("readwrite", (s) => s.put(entry));
}

export async function listEntries(): Promise<HistoryEntry[]> {
  const all = await tx<HistoryEntry[]>("readonly", (s) => s.getAll());
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getEntry(id: string): Promise<HistoryEntry | undefined> {
  return tx<HistoryEntry | undefined>("readonly", (s) => s.get(id));
}

export async function deleteEntry(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}

export async function clearAll() {
  await tx("readwrite", (s) => s.clear());
}

export function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
