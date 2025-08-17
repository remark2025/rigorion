import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema definition
interface SATDatabase extends DBSchema {
  packs: {
    key: string; // pack id
    value: {
      id: string;
      hash: string;
      size: number;
      downloadedAt: string;
      data: any; // Pack content
    };
    indexes: {
      'by-hash': string;
      'by-downloaded': string;
    };
  };

  questions: {
    key: string; // question id
    value: {
      id: string;
      packId: string;
      subject: string;
      chapter: string;
      difficulty: 'easy' | 'medium' | 'hard';
      stem: string;
      choices: string[];
      answer: string;
      solution: string;
      media: string[];
    };
    indexes: {
      'by-pack': string;
      'by-difficulty': string;
      'by-chapter': string;
    };
  };

  attempts_queue: {
    key: string; // idempotency_key
    value: {
      idempotency_key: string;
      user_id: string;
      question_id: string;
      attempt_number: number;
      attempted_at: string;
      duration_seconds: number;
      is_correct: boolean;
      confidence_level: number | null;
      hint_checked: boolean;
      solution_checked: boolean;
      objective_progress: number | null;
      bookmarked: boolean;
      synced: boolean;
      created_at: string;
    };
    indexes: {
      'by-user': string;
      'by-synced': boolean;
      'by-created': string;
      'by-question': string;
    };
  };

  bookmarks: {
    key: string; // user_id + question_id
    value: {
      user_id: string;
      question_id: string;
      created_at: string;
      synced: boolean;
    };
    indexes: {
      'by-user': string;
      'by-synced': boolean;
      'by-created': string;
    };
  };

  sync_state: {
    key: string; // state key
    value: {
      key: string;
      last_manifest_hash: string | null;
      last_sync_at: string | null;
      user_id: string | null;
      queue_count: number;
      last_error: string | null;
    };
  };
}

const DB_NAME = 'sat-practice';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SATDatabase> | null = null;

// Initialize database
export async function initDB(): Promise<IDBPDatabase<SATDatabase>> {
  if (dbInstance) return dbInstance;

  console.log('Initializing IndexedDB...');
  
  dbInstance = await openDB<SATDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);

      // Packs store
      if (!db.objectStoreNames.contains('packs')) {
        const packsStore = db.createObjectStore('packs', { keyPath: 'id' });
        packsStore.createIndex('by-hash', 'hash');
        packsStore.createIndex('by-downloaded', 'downloadedAt');
      }

      // Questions store
      if (!db.objectStoreNames.contains('questions')) {
        const questionsStore = db.createObjectStore('questions', { keyPath: 'id' });
        questionsStore.createIndex('by-pack', 'packId');
        questionsStore.createIndex('by-difficulty', 'difficulty');
        questionsStore.createIndex('by-chapter', 'chapter');
      }

      // Attempts queue store
      if (!db.objectStoreNames.contains('attempts_queue')) {
        const attemptsStore = db.createObjectStore('attempts_queue', { keyPath: 'idempotency_key' });
        attemptsStore.createIndex('by-user', 'user_id');
        attemptsStore.createIndex('by-synced', 'synced');
        attemptsStore.createIndex('by-created', 'created_at');
        attemptsStore.createIndex('by-question', 'question_id');
      }

      // Bookmarks store
      if (!db.objectStoreNames.contains('bookmarks')) {
        const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: ['user_id', 'question_id'] });
        bookmarksStore.createIndex('by-user', 'user_id');
        bookmarksStore.createIndex('by-synced', 'synced');
        bookmarksStore.createIndex('by-created', 'created_at');
      }

      // Sync state store
      if (!db.objectStoreNames.contains('sync_state')) {
        db.createObjectStore('sync_state', { keyPath: 'key' });
      }
    },
  });

  console.log('IndexedDB initialized successfully');
  return dbInstance;
}

// Get database instance
export async function getDB(): Promise<IDBPDatabase<SATDatabase>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// Pack operations
export async function storePack(pack: any) {
  const db = await getDB();
  const packData = {
    id: pack.id,
    hash: pack.version || pack.hash,
    size: JSON.stringify(pack).length,
    downloadedAt: new Date().toISOString(),
    data: pack,
  };
  
  await db.put('packs', packData);
  console.log(`Pack stored: ${pack.id}`);
  
  // Store individual questions
  if (pack.questions) {
    const tx = db.transaction('questions', 'readwrite');
    for (const question of pack.questions) {
      await tx.store.put({
        ...question,
        packId: pack.id,
      });
    }
    await tx.done;
    console.log(`${pack.questions.length} questions stored for pack ${pack.id}`);
  }
}

export async function getPack(packId: string) {
  const db = await getDB();
  return await db.get('packs', packId);
}

export async function getPackByHash(hash: string) {
  const db = await getDB();
  return await db.getFromIndex('packs', 'by-hash', hash);
}

export async function getAllPacks() {
  const db = await getDB();
  return await db.getAll('packs');
}

// Question operations
export async function getQuestion(questionId: string) {
  const db = await getDB();
  return await db.get('questions', questionId);
}

export async function getQuestionsByPack(packId: string) {
  const db = await getDB();
  return await db.getAllFromIndex('questions', 'by-pack', packId);
}

export async function getQuestionsByChapter(chapter: string) {
  const db = await getDB();
  return await db.getAllFromIndex('questions', 'by-chapter', chapter);
}

// Attempts queue operations
export async function queueAttempt(attempt: any) {
  const db = await getDB();
  const attemptData = {
    ...attempt,
    synced: false,
    created_at: new Date().toISOString(),
  };
  
  await db.put('attempts_queue', attemptData);
  console.log(`Attempt queued: ${attempt.idempotency_key}`);
  
  // Update sync state
  await updateSyncState({ queue_count: await getQueuedAttemptsCount() });
}

export async function getQueuedAttempts(limit?: number) {
  const db = await getDB();
  const unsyncedAttempts = await db.getAllFromIndex('attempts_queue', 'by-synced', false);
  
  return limit ? unsyncedAttempts.slice(0, limit) : unsyncedAttempts;
}

export async function markAttemptsSynced(idempotencyKeys: string[]) {
  const db = await getDB();
  const tx = db.transaction('attempts_queue', 'readwrite');
  
  for (const key of idempotencyKeys) {
    const attempt = await tx.store.get(key);
    if (attempt) {
      attempt.synced = true;
      await tx.store.put(attempt);
    }
  }
  
  await tx.done;
  console.log(`Marked ${idempotencyKeys.length} attempts as synced`);
  
  // Update sync state
  await updateSyncState({ queue_count: await getQueuedAttemptsCount() });
}

export async function getQueuedAttemptsCount() {
  const db = await getDB();
  return await db.countFromIndex('attempts_queue', 'by-synced', false);
}

export async function clearSyncedAttempts() {
  const db = await getDB();
  const syncedAttempts = await db.getAllFromIndex('attempts_queue', 'by-synced', true);
  
  const tx = db.transaction('attempts_queue', 'readwrite');
  for (const attempt of syncedAttempts) {
    await tx.store.delete(attempt.idempotency_key);
  }
  await tx.done;
  
  console.log(`Cleared ${syncedAttempts.length} synced attempts`);
}

// Bookmark operations
export async function addBookmark(userId: string, questionId: string) {
  const db = await getDB();
  const bookmark = {
    user_id: userId,
    question_id: questionId,
    created_at: new Date().toISOString(),
    synced: false,
  };
  
  await db.put('bookmarks', bookmark);
  console.log(`Bookmark added: ${questionId}`);
}

export async function removeBookmark(userId: string, questionId: string) {
  const db = await getDB();
  await db.delete('bookmarks', [userId, questionId]);
  console.log(`Bookmark removed: ${questionId}`);
}

export async function isBookmarked(userId: string, questionId: string): Promise<boolean> {
  const db = await getDB();
  const bookmark = await db.get('bookmarks', [userId, questionId]);
  return !!bookmark;
}

export async function getUserBookmarks(userId: string) {
  const db = await getDB();
  return await db.getAllFromIndex('bookmarks', 'by-user', userId);
}

// Sync state operations
export async function getSyncState() {
  const db = await getDB();
  return await db.get('sync_state', 'main') || {
    key: 'main',
    last_manifest_hash: null,
    last_sync_at: null,
    user_id: null,
    queue_count: 0,
    last_error: null,
  };
}

export async function updateSyncState(updates: Partial<SATDatabase['sync_state']['value']>) {
  const db = await getDB();
  const currentState = await getSyncState();
  const newState = { ...currentState, ...updates };
  
  await db.put('sync_state', newState);
}

// Utility functions
export async function clearUserData(userId: string) {
  const db = await getDB();
  
  // Clear user attempts
  const userAttempts = await db.getAllFromIndex('attempts_queue', 'by-user', userId);
  const tx1 = db.transaction('attempts_queue', 'readwrite');
  for (const attempt of userAttempts) {
    await tx1.store.delete(attempt.idempotency_key);
  }
  await tx1.done;
  
  // Clear user bookmarks
  const userBookmarks = await db.getAllFromIndex('bookmarks', 'by-user', userId);
  const tx2 = db.transaction('bookmarks', 'readwrite');
  for (const bookmark of userBookmarks) {
    await tx2.store.delete([bookmark.user_id, bookmark.question_id]);
  }
  await tx2.done;
  
  console.log(`Cleared data for user: ${userId}`);
}

export async function getDatabaseStats() {
  const db = await getDB();
  
  const stats = {
    packs: await db.count('packs'),
    questions: await db.count('questions'),
    queuedAttempts: await getQueuedAttemptsCount(),
    totalAttempts: await db.count('attempts_queue'),
    bookmarks: await db.count('bookmarks'),
    syncState: await getSyncState(),
  };
  
  console.log('Database stats:', stats);
  return stats;
}