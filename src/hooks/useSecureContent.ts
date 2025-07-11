
import { useState, useEffect, useCallback } from 'react';
import { 
  downloadEncryptedData, 
  retrieveLocalData, 
  storeDataLocally, 
  isLocalDataValid 
} from '@/services/secureStorageService';
import { useToast } from '@/components/ui/use-toast';

export function useSecureContent() {
  const [questions, setQuestions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const { toast } = useToast();
  
  // Initialize worker
  useEffect(() => {
    try {
      const newWorker = new Worker(
        new URL('../workers/decrypt.worker.ts', import.meta.url), 
        { type: 'module' }
      );
      
      setWorker(newWorker);
      
      return () => {
        newWorker.terminate();
      };
    } catch (err) {
      console.error('Error initializing worker:', err);
      setError('Failed to initialize decryption worker');
      toast({
        title: "Worker Error",
        description: "Failed to initialize decryption worker",
        variant: "destructive"
      });
    }
  }, []);
  
  // Load encrypted data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Check if we have valid local data
        const isValid = await isLocalDataValid();
        let encryptedData: any = null;
        
        if (isValid) {
          // Try to use local data first
          encryptedData = await retrieveLocalData();
          console.log('Using locally stored encrypted data');
        }
        
        if (!encryptedData) {
          // If no local data or it's invalid, fetch from Supabase
          try {
            console.log('Downloading fresh encrypted data from Supabase');
            encryptedData = await downloadEncryptedData();
            
            // Store for offline use
            if (encryptedData) {
              await storeDataLocally(encryptedData);
              console.log('Encrypted data stored locally for future use');
            }
          } catch (downloadError) {
            console.error('Download error:', downloadError);
            // Try local data as fallback even if it's expired
            encryptedData = await retrieveLocalData();
            
            if (!encryptedData) {
              throw new Error('No data available online or offline');
            }
            console.log('Using expired local data as fallback');
            toast({
              title: "Using Offline Data",
              description: "Could not download fresh data. Using cached data.",
              variant: "default"
            });
          }
        }
        
        // Parse the encrypted data if it's a Uint8Array
        let jsonText = encryptedData;
        if (encryptedData instanceof Uint8Array) {
          const textDecoder = new TextDecoder();
          jsonText = textDecoder.decode(encryptedData);
        }
        console.log('Data loaded, length:', typeof jsonText === 'string' ? jsonText.length : 'not a string');
        
        try {
          // Try to parse as JSON directly (for development/testing)
          const jsonData = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
          if (jsonData && jsonData.questions) {
            console.log('Valid JSON found with questions property');
            setQuestions(jsonData.questions);
            setIsLoading(false);
          } else {
            console.log('Valid JSON found, but no questions property');
            // Save the entire JSON for later decryption
            setQuestions({ _encrypted: JSON.stringify(jsonData) });
            setIsLoading(false);
          }
        } catch (parseError) {
          // Not valid JSON, must be encrypted
          console.log('Data is encrypted, will decrypt on demand');
          // Save the encrypted data for later decryption
          setQuestions({ _encrypted: typeof jsonText === 'string' ? jsonText : JSON.stringify(jsonText) });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading secure content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load secure content');
        setIsLoading(false);
        toast({
          title: "Loading Error",
          description: err instanceof Error ? err.message : 'Failed to load secure content',
          variant: "destructive" 
        });
      }
    }
    
    loadData();
  }, []);
  
  // Decrypt question when needed
  const decryptQuestion = useCallback(async (questionId: string): Promise<string> => {
    if (!worker) {
      const errorMsg = 'Decryption worker not initialized';
      console.error(errorMsg);
      return errorMsg;
    }
    
    if (!questions._encrypted && !questions[questionId]) {
      const errorMsg = `Question ${questionId} not found`;
      console.error(errorMsg);
      return errorMsg;
    }
    
    return new Promise((resolve) => {
      // Define handler for worker messages
      const messageHandler = (e: MessageEvent) => {
        if (e.data.success) {
          worker.removeEventListener('message', messageHandler);
          resolve(e.data.result);
        } else {
          console.error('Decryption error:', e.data.error);
          worker.removeEventListener('message', messageHandler);
          resolve('Unable to decrypt content: ' + (e.data.error || 'Unknown error'));
        }
      };
      
      // Add message listener
      worker.addEventListener('message', messageHandler);
      
      console.log(`Attempting to decrypt ${questionId === '_encrypted' ? 'full dataset' : 'question ' + questionId}`);
      
      // If we have individual encrypted questions
      if (questions[questionId]) {
        worker.postMessage({ 
          action: 'decrypt',
          cipherText: questions[questionId] 
        });
      }
      // If we have a fully encrypted JSON
      else if (questions._encrypted) {
        worker.postMessage({ 
          action: 'decrypt',
          cipherText: questions._encrypted,
          key: import.meta.env.VITE_ENCRYPTION_KEY || 'secure-key-for-demo-purposes-only'
        });
      }
    });
  }, [worker, questions]);
  
  return { decryptQuestion, isLoading, error };
}

export default useSecureContent;
