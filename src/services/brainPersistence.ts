import { BrainMemorySchema, BrainSignal } from "../types";

const DB_NAME = "ViewTubeBrainDB";
const DB_VERSION = 1;
const STORE_SCHEMA = "brain_schema";
const STORE_SIGNALS = "brain_signals";

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SCHEMA)) {
        db.createObjectStore(STORE_SCHEMA);
      }
      if (!db.objectStoreNames.contains(STORE_SIGNALS)) {
        db.createObjectStore(STORE_SIGNALS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getBrainSchemaDB = async (): Promise<BrainMemorySchema | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SCHEMA, "readonly");
    const store = transaction.objectStore(STORE_SCHEMA);
    const request = store.get("current");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const saveBrainSchemaDB = async (schema: BrainMemorySchema): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SCHEMA, "readwrite");
    const store = transaction.objectStore(STORE_SCHEMA);
    const request = store.put(schema, "current");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getBrainSignalsDB = async (): Promise<BrainSignal[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SIGNALS, "readonly");
    const store = transaction.objectStore(STORE_SIGNALS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const addBrainSignalDB = async (signal: BrainSignal): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SIGNALS, "readwrite");
    const store = transaction.objectStore(STORE_SIGNALS);
    const request = store.add(signal);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearBrainSignalsDB = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SIGNALS, "readwrite");
    const store = transaction.objectStore(STORE_SIGNALS);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
