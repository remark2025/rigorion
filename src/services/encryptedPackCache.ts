import { openDB } from "idb";

const DB_NAME = "encrypted-question-vault";
const STORE_PACKS = "pack-buffers";
const DB_VERSION = 1;

interface PackBufferRecord {
  packId: string;
  hash: string;
  buffer: ArrayBuffer;
  storedAt: number;
}

const isIndexedDbAvailable = typeof indexedDB !== "undefined";

const dbPromise = isIndexedDbAvailable
  ? openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PACKS)) {
          db.createObjectStore(STORE_PACKS, { keyPath: "packId" });
        }
      },
    })
  : Promise.resolve(null);

export async function getCachedPackBuffer(packId: string, hash: string): Promise<ArrayBuffer | null> {
  if (!isIndexedDbAvailable) return null;
  const db = await dbPromise;
  if (!db) return null;
  const record = await db.get(STORE_PACKS, packId) as PackBufferRecord | undefined;
  if (!record) return null;
  if (record.hash !== hash) {
    await db.delete(STORE_PACKS, packId);
    return null;
  }
  return record.buffer;
}

export async function storePackBuffer(packId: string, hash: string, buffer: ArrayBuffer): Promise<void> {
  if (!isIndexedDbAvailable) return;
  const db = await dbPromise;
  if (!db) return;
  const record: PackBufferRecord = {
    packId,
    hash,
    buffer,
    storedAt: Date.now(),
  };
  await db.put(STORE_PACKS, record);
}

export async function clearPackCache(): Promise<void> {
  if (!isIndexedDbAvailable) return;
  const db = await dbPromise;
  if (!db) return;
  await db.clear(STORE_PACKS);
}

export function isPackCacheSupported(): boolean {
  return isIndexedDbAvailable;
}
