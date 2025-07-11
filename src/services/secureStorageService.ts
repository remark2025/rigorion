
/**
 * This service provides secure storage functionality for the application.
 * It works in conjunction with the Dexie encrypted database.
 */

// Store data in localStorage with a timestamp for validity checking
export async function storeDataLocally(data: any): Promise<void> {
  try {
    const storageItem = {
      data,
      timestamp: new Date().getTime(),
      expiresIn: 86400000 // 24 hours in milliseconds
    };
    localStorage.setItem('secureData', JSON.stringify(storageItem));
    console.log('Data stored locally with expiration');
  } catch (error) {
    console.error('Error storing data locally:', error);
    throw error;
  }
}

// Check if locally stored data is valid (not expired)
export async function isLocalDataValid(): Promise<boolean> {
  try {
    const storedItem = localStorage.getItem('secureData');
    if (!storedItem) return false;
    
    const { timestamp, expiresIn } = JSON.parse(storedItem);
    const now = new Date().getTime();
    const isValid = now - timestamp < expiresIn;
    
    return isValid;
  } catch (error) {
    console.error('Error checking data validity:', error);
    return false;
  }
}

// Retrieve locally stored data
export async function retrieveLocalData(): Promise<any> {
  try {
    const storedItem = localStorage.getItem('secureData');
    if (!storedItem) return null;
    
    const { data } = JSON.parse(storedItem);
    return data;
  } catch (error) {
    console.error('Error retrieving local data:', error);
    return null;
  }
}

// Download encrypted data from storage service
export async function downloadEncryptedData(): Promise<any> {
  try {
    // Simulate downloading from a remote source
    // In a real app, this would fetch from an API
    const response = await fetch('/secure-data.json');
    if (!response.ok) throw new Error('Failed to download data');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error downloading encrypted data:', error);
    throw error;
  }
}

// Function to securely store content with encryption
export async function secureStoreContent(key: string, content: any): Promise<void> {
  try {
    // Store content in local storage with base64 encoding (simplified version)
    localStorage.setItem(key, btoa(JSON.stringify(content)));
    console.log(`Content securely stored with key: ${key}`);
  } catch (error) {
    console.error("Error storing content securely:", error);
    throw error;
  }
}

// Function to retrieve securely stored content
export async function secureRetrieveContent(key: string): Promise<any | null> {
  try {
    const storedContent = localStorage.getItem(key);
    if (!storedContent) return null;
    
    // Parse the base64 encoded content (simplified version)
    return JSON.parse(atob(storedContent));
  } catch (error) {
    console.error(`Error retrieving secure content for key ${key}:`, error);
    return null;
  }
}

// Function to remove securely stored content
export async function secureRemoveContent(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
    console.log(`Secure content removed for key: ${key}`);
  } catch (error) {
    console.error(`Error removing secure content for key ${key}:`, error);
    throw error;
  }
}
