// IndexedDB utility for offline data storage
const DB_NAME = 'greenupp-offline-db';
const DB_VERSION = 1;
const OFFLINE_STORE = 'offline-requests';
const CACHE_STORE = 'data-cache';

interface OfflineRequest {
  id?: number;
  url: string;
  method: string;
  data: any;
  timestamp: number;
}

interface CacheItem {
  id?: string;
  key: string;
  data: any;
  timestamp: number;
  expiry?: number; // Optional expiry time in milliseconds
}

// Initialize the database
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject(new Error('Could not open IndexedDB'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for offline requests
      if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
        const offlineStore = db.createObjectStore(OFFLINE_STORE, { keyPath: 'id', autoIncrement: true });
        offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create object store for cached data
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'id' });
        cacheStore.createIndex('key', 'key', { unique: true });
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Queue a request to be processed when online
export async function queueOfflineRequest(url: string, method: string, data: any): Promise<number> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OFFLINE_STORE], 'readwrite');
      const store = transaction.objectStore(OFFLINE_STORE);
      
      const request = store.add({
        url,
        method,
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => {
        resolve(request.result as number);
        
        // Register for sync if available - currently disabled due to browser compatibility issues
        /*
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready
            .then(registration => {
              if (registration.sync) {
                return registration.sync.register('sync-offline-data');
              }
              throw new Error('Sync not supported');
            })
            .catch(err => console.error('Failed to register background sync:', err));
        }
        */
      };
      
      request.onerror = () => {
        reject(new Error('Failed to queue offline request'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error queuing offline request:', error);
    throw error;
  }
}

// Get all pending offline requests
export async function getOfflineRequests(): Promise<OfflineRequest[]> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OFFLINE_STORE], 'readonly');
      const store = transaction.objectStore(OFFLINE_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get offline requests'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting offline requests:', error);
    return [];
  }
}

// Remove a processed offline request
export async function removeOfflineRequest(id: number): Promise<void> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([OFFLINE_STORE], 'readwrite');
      const store = transaction.objectStore(OFFLINE_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to remove offline request'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error removing offline request:', error);
    throw error;
  }
}

// Cache data for offline use
export async function cacheData(key: string, data: any, expiryTime?: number): Promise<void> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const index = store.index('key');
      const keyRequest = index.getKey(key);
      
      keyRequest.onsuccess = () => {
        const timestamp = Date.now();
        let expiry = undefined;
        
        if (expiryTime) {
          expiry = timestamp + expiryTime;
        }
        
        const cacheItem: CacheItem = {
          key,
          data,
          timestamp,
          expiry
        };
        
        let request;
        if (keyRequest.result) {
          // Update existing entry
          cacheItem.id = keyRequest.result as string;
          request = store.put(cacheItem);
        } else {
          // Create new entry
          cacheItem.id = `${key}-${timestamp}`;
          request = store.add(cacheItem);
        }
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(new Error('Failed to cache data'));
        };
      };
      
      keyRequest.onerror = () => {
        reject(new Error('Failed to check for existing cache entry'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error caching data:', error);
    throw error;
  }
}

// Retrieve cached data
export async function getCachedData(key: string): Promise<any | null> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE], 'readonly');
      const store = transaction.objectStore(CACHE_STORE);
      const index = store.index('key');
      const request = index.get(key);
      
      request.onsuccess = () => {
        const cacheItem = request.result as CacheItem;
        
        if (!cacheItem) {
          resolve(null);
          return;
        }
        
        // Check if cache has expired
        if (cacheItem.expiry && cacheItem.expiry < Date.now()) {
          // Cache expired, remove it
          const deleteTransaction = db.transaction([CACHE_STORE], 'readwrite');
          const deleteStore = deleteTransaction.objectStore(CACHE_STORE);
          deleteStore.delete(cacheItem.id!);
          
          resolve(null);
        } else {
          resolve(cacheItem.data);
        }
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get cached data'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

// Clear all cached data
export async function clearCache(): Promise<void> {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to clear cache'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
}