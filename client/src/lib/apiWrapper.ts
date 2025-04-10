import { getWeatherData, saveWeatherData, saveFormData } from './indexedDb';
import { apiRequest } from './queryClient';

/**
 * Wrapper for weather API requests that falls back to IndexedDB when offline
 */
export async function getWeatherWithOfflineSupport(location: string): Promise<any> {
  try {
    // Try to fetch from API first
    if (navigator.onLine) {
      const response = await apiRequest('GET', `/api/weather?location=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      // Save successful response to IndexedDB for offline use
      await saveWeatherData(location, data);
      
      return data;
    }
    
    // If offline, try to get from IndexedDB
    const cachedData = await getWeatherData(location);
    if (cachedData) {
      // Add offline indicator to the data
      return {
        ...cachedData,
        offline: true
      };
    }
    
    // No cached data available
    throw new Error('No cached weather data available for this location');
  } catch (error) {
    // If the API request fails, try IndexedDB as fallback
    const cachedData = await getWeatherData(location);
    if (cachedData) {
      return {
        ...cachedData,
        offline: true
      };
    }
    
    // Re-throw the error if no cached data
    throw error;
  }
}

/**
 * Wrapper for form submissions that saves to IndexedDB when offline
 * and syncs when back online
 */
export async function submitFormWithOfflineSupport(
  url: string,
  method: string,
  data: any,
  headers: Record<string, string> = { 'Content-Type': 'application/json' }
): Promise<any> {
  // If online, try normal submission
  if (navigator.onLine) {
    try {
      const response = await apiRequest(method, url, data);
      return await response.json();
    } catch (error) {
      // If API request fails, save to IndexedDB
      await saveFormData(url, method, headers, JSON.stringify(data));
      throw new Error('Failed to submit form. Data saved for submission when back online.');
    }
  } else {
    // If offline, save to IndexedDB
    await saveFormData(url, method, headers, JSON.stringify(data));
    throw new Error('You are offline. Data saved for submission when back online.');
  }
}

/**
 * Register event listeners to handle coming online
 */
export function registerOnlineStatusHandlers(): void {
  // When the user comes back online, trigger sync
  window.addEventListener('online', () => {
    // Notify the service worker to start syncing
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-forms');
      });
    }
  });
}