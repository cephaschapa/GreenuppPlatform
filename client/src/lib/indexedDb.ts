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
  // AI assistant message store
  aiAssistantMessages: {
    key: string;
    value: {
      id: string;
      userId: number;
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: number;
      sessionId: string;
    };
    indexes: {
      'sessionId': string; // used as 'by-session' index
      'timestamp': number; // used as 'by-timestamp' index
    };
  };
  // AI assistant session store
  aiAssistantSessions: {
    key: string;
    value: {
      id: string;
      userId: number;
      title: string;
      lastMessageDate: number;
      contextData?: Record<string, any>;
    };
    indexes: {
      'userId': number; // used as 'by-user' index
      'lastMessageDate': number; // used as 'by-last-message' index
    };
  };
}

// Database version - increment when schema changes
const DB_VERSION = 2;

// Database name
const DB_NAME = 'greenupp-db';

// Open database connection
export async function openDatabase(): Promise<IDBPDatabase<GreenuppDB>> {
  return openDB<GreenuppDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
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
      
      // Version 2 adds AI Assistant message stores
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('aiAssistantMessages')) {
          const messagesStore = db.createObjectStore('aiAssistantMessages', { keyPath: 'id' });
          messagesStore.createIndex('sessionId', 'sessionId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('aiAssistantSessions')) {
          const sessionsStore = db.createObjectStore('aiAssistantSessions', { keyPath: 'id' });
          sessionsStore.createIndex('userId', 'userId', { unique: false });
          sessionsStore.createIndex('lastMessageDate', 'lastMessageDate', { unique: false });
        }
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

// AI Assistant message functions
export interface AIAssistantMessage {
  id: string;
  userId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  sessionId: string;
}

export interface AIAssistantSession {
  id: string;
  userId: number;
  title: string;
  lastMessageDate: number;
  contextData?: Record<string, any>;
}

// Save a message to the database
export async function saveAIAssistantMessage(message: AIAssistantMessage): Promise<void> {
  const db = await openDatabase();
  await db.put('aiAssistantMessages', message);
  
  // Update session's last message date
  const session = await db.get('aiAssistantSessions', message.sessionId);
  if (session) {
    await db.put('aiAssistantSessions', {
      ...session,
      lastMessageDate: message.timestamp,
    });
  }
}

// Get all messages for a specific session
export async function getAIAssistantMessagesBySession(sessionId: string): Promise<AIAssistantMessage[]> {
  const db = await openDatabase();
  try {
    const index = db.transaction('aiAssistantMessages').store.index('sessionId');
    const messages = await index.getAll(sessionId);
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error retrieving AI Assistant messages from IndexedDB:', error);
    return [];
  }
}

// Save or update a session
export async function saveAIAssistantSession(session: AIAssistantSession): Promise<void> {
  const db = await openDatabase();
  await db.put('aiAssistantSessions', session);
}

// Get all sessions for a user
export async function getAIAssistantSessionsByUser(userId: number): Promise<AIAssistantSession[]> {
  const db = await openDatabase();
  try {
    const index = db.transaction('aiAssistantSessions').store.index('userId');
    const sessions = await index.getAll(userId);
    return sessions.sort((a, b) => b.lastMessageDate - a.lastMessageDate); // Most recent first
  } catch (error) {
    console.error('Error retrieving AI Assistant sessions from IndexedDB:', error);
    return [];
  }
}

// Delete a specific session and all its messages
export async function deleteAIAssistantSession(sessionId: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(['aiAssistantSessions', 'aiAssistantMessages'], 'readwrite');
  
  // Delete session
  await tx.objectStore('aiAssistantSessions').delete(sessionId);
  
  // Delete all messages with this sessionId
  const messagesIndex = tx.objectStore('aiAssistantMessages').index('sessionId');
  let cursor = await messagesIndex.openCursor(sessionId);
  
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  
  await tx.done;
}

// Clear all data from the database
export async function clearDatabase(): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(
    ['weatherData', 'weatherPreferences', 'crops', 'formData', 'aiAssistantMessages', 'aiAssistantSessions'], 
    'readwrite'
  );
  
  await Promise.all([
    tx.objectStore('weatherData').clear(),
    tx.objectStore('weatherPreferences').clear(),
    tx.objectStore('crops').clear(),
    tx.objectStore('formData').clear(),
    tx.objectStore('aiAssistantMessages').clear(),
    tx.objectStore('aiAssistantSessions').clear(),
  ]);
  
  await tx.done;
}