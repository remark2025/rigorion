
// Define interface for function data
export interface FunctionData {
  id?: number;
  endpoint: string;
  timestamp: Date;
  data: any;
  encrypted?: boolean;
}

// Database constants
const DB_NAME = "AppDatabase";
const DB_VERSION = 1;
const STORE_NAME = "functionData";

// Open database connection
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(`Database error: ${(event.target as IDBRequest).error}`);
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create store with auto-incrementing id as key
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        
        // Create indexes for querying
        store.createIndex("endpoint", "endpoint", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

// Store function data in IndexedDB
export async function storeFunctionData(endpoint: string, data: any): Promise<number> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const record: FunctionData = {
        endpoint,
        timestamp: new Date(),
        data,
        encrypted: false // Add the encrypted property with a default value
      };
      
      const request = store.add(record);
      
      request.onsuccess = () => {
        const id = request.result as number;
        console.log(`Data from ${endpoint} stored with ID: ${id}`);
        resolve(id);
        db.close();
      };
      
      request.onerror = (event) => {
        console.error("Error storing function data:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
        db.close();
      };
    });
  } catch (error) {
    console.error("Error storing function data:", error);
    throw error;
  }
}

// Get latest data for a specific endpoint
export async function getLatestFunctionData(endpoint: string): Promise<FunctionData | undefined> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("endpoint");
      
      // Open a cursor on the index with endpoint value
      const request = index.openCursor(IDBKeyRange.only(endpoint), "prev");
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (cursor) {
          // Return the first record (latest due to prev direction)
          resolve(cursor.value);
        } else {
          resolve(undefined);
        }
        
        db.close();
      };
      
      request.onerror = (event) => {
        console.error(`Error retrieving data for ${endpoint}:`, (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error retrieving data for ${endpoint}:`, error);
    throw error;
  }
}

// Get all data for a specific endpoint
export async function getAllFunctionData(endpoint: string): Promise<FunctionData[]> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("endpoint");
      
      const request = index.getAll(IDBKeyRange.only(endpoint));
      
      request.onsuccess = (event) => {
        const results = (event.target as IDBRequest).result;
        // Sort by timestamp in descending order (newest first)
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(results);
        db.close();
      };
      
      request.onerror = (event) => {
        console.error(`Error retrieving all data for ${endpoint}:`, (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error retrieving all data for ${endpoint}:`, error);
    throw error;
  }
}

// Clear all stored data
export async function clearAllData(): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log("All function data cleared from IndexedDB");
        resolve();
        db.close();
      };
      
      request.onerror = (event) => {
        console.error("Error clearing data:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
        db.close();
      };
    });
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
}
