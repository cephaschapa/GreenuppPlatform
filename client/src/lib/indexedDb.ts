import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GreenuppDB extends DBSchema {
  weatherData: {
    key: string;
    value: {
      location: string;
      data: any;
      timestamp: number;
    };
  };
  weatherPreferences: {
    key: number;
    value: {
      userId: number;
      locations: string[];
      alertsEnabled: boolean;
      temperatureUnit: string;
      updatedAt: number;
    };
  };
  crops: {
    key: number;
    value: any;
  };
  formData: {
    key: number;
    value: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body: string;
      timestamp: number;
    };
  };
}

// Database version - increment when schema changes
const DB_VERSION = 1;

// Database name
const DB_NAME = 'greenupp-db';

// Open database connection
export async function openDatabase(): Promise<IDBPDatabase<GreenuppDB>> {
  return openDB<GreenuppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('weatherData')) {
        db.createObjectStore('weatherData', { keyPath: 'location' });
      }
      
      if (!db.objectStoreNames.contains('weatherPreferences')) {
        db.createObjectStore('weatherPreferences', { keyPath: 'userId' });
      }
      
      if (!db.objectStoreNames.contains('crops')) {
        db.createObjectStore('crops', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('formData')) {
        db.createObjectStore('formData', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// Weather data functions
export async function saveWeatherData(location: string, data: any): Promise<void> {
  const db = await openDatabase();
  await db.put('weatherData', {
    location,
    data,
    timestamp: Date.now(),
  });
}

export async function getWeatherData(location: string): Promise<any | null> {
  const db = await openDatabase();
  try {
    const data = await db.get('weatherData', location);
    
    // Check if data is expired (older than 30 minutes)
    if (data && (Date.now() - data.timestamp) < 30 * 60 * 1000) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving weather data from IndexedDB:', error);
    return null;
  }
}

// Weather preferences functions
export async function saveWeatherPreferences(userId: number, preferences: any): Promise<void> {
  const db = await openDatabase();
  await db.put('weatherPreferences', {
    userId,
    ...preferences,
    updatedAt: Date.now(),
  });
}

export async function getWeatherPreferences(userId: number): Promise<any | null> {
  const db = await openDatabase();
  try {
    return await db.get('weatherPreferences', userId);
  } catch (error) {
    console.error('Error retrieving weather preferences from IndexedDB:', error);
    return null;
  }
}

// Crop functions
export async function saveCrops(crops: any[]): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('crops', 'readwrite');
  
  // Clear existing crops
  await tx.objectStore('crops').clear();
  
  // Add new crops
  for (const crop of crops) {
    await tx.objectStore('crops').add(crop);
  }
  
  await tx.done;
}

export async function getCrops(): Promise<any[]> {
  const db = await openDatabase();
  try {
    return await db.getAll('crops');
  } catch (error) {
    console.error('Error retrieving crops from IndexedDB:', error);
    return [];
  }
}

// Form data for offline submission
export async function saveFormData(url: string, method: string, headers: Record<string, string>, body: string): Promise<number> {
  const db = await openDatabase();
  return db.add('formData', {
    url,
    method,
    headers,
    body,
    timestamp: Date.now(),
  });
}

export async function getFormDataToSync(): Promise<any[]> {
  const db = await openDatabase();
  try {
    return await db.getAll('formData');
  } catch (error) {
    console.error('Error retrieving form data from IndexedDB:', error);
    return [];
  }
}

export async function deleteFormData(id: number): Promise<void> {
  const db = await openDatabase();
  await db.delete('formData', id);
}

// Clear all data from the database
export async function clearDatabase(): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(['weatherData', 'weatherPreferences', 'crops', 'formData'], 'readwrite');
  
  await Promise.all([
    tx.objectStore('weatherData').clear(),
    tx.objectStore('weatherPreferences').clear(),
    tx.objectStore('crops').clear(),
    tx.objectStore('formData').clear(),
  ]);
  
  await tx.done;
}