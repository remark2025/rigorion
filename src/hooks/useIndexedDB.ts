import { useEffect, useState, useCallback } from 'react';
import {
  initDB,
  storePack,
  getPack,
  getAllPacks,
  getQuestion,
  getQuestionsByPack,
  queueAttempt,
  getQueuedAttempts,
  markAttemptsSynced,
  getQueuedAttemptsCount,
  addBookmark,
  removeBookmark,
  isBookmarked,
  getUserBookmarks,
  getSyncState,
  updateSyncState,
  clearUserData,
  getDatabaseStats,
} from '@/lib/indexedDB';
import { toast } from './use-toast';

interface IndexedDBState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  stats: any;
}

export function useIndexedDB() {
  const [state, setState] = useState<IndexedDBState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    stats: null,
  });

  const initialize = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await initDB();
      const stats = await getDatabaseStats();
      
      setState({
        isInitialized: true,
        isLoading: false,
        error: null,
        stats,
      });
      
      console.log('IndexedDB initialized with stats:', stats);
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      setState({
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: null,
      });
      
      toast({
        title: 'Storage Error',
        description: 'Failed to initialize offline storage. Some features may not work.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, []);

  const refreshStats = useCallback(async () => {
    if (!state.isInitialized) return;
    
    try {
      const stats = await getDatabaseStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  }, [state.isInitialized]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Pack operations
  const storePackData = useCallback(async (pack: any) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    
    try {
      await storePack(pack);
      await refreshStats();
      console.log(`Pack stored successfully: ${pack.id}`);
    } catch (error) {
      console.error('Failed to store pack:', error);
      throw error;
    }
  }, [state.isInitialized, refreshStats]);

  const getPackData = useCallback(async (packId: string) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    return await getPack(packId);
  }, [state.isInitialized]);

  const getAllPacksData = useCallback(async () => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    return await getAllPacks();
  }, [state.isInitialized]);

  // Question operations
  const getQuestionData = useCallback(async (questionId: string) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    return await getQuestion(questionId);
  }, [state.isInitialized]);

  const getQuestionsByPackData = useCallback(async (packId: string) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    return await getQuestionsByPack(packId);
  }, [state.isInitialized]);

  // Attempt operations
  const queueAttemptData = useCallback(async (attempt: any) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    
    try {
      await queueAttempt(attempt);
      await refreshStats();
      console.log('Attempt queued successfully');
    } catch (error) {
      console.error('Failed to queue attempt:', error);
      throw error;
    }
  }, [state.isInitialized, refreshStats]);

  const getQueuedAttemptsData = useCallback(async (limit?: number) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    return await getQueuedAttempts(limit);
  }, [state.isInitialized]);

  const markAttemptsSyncedData = useCallback(async (idempotencyKeys: string[]) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    
    try {
      await markAttemptsSynced(idempotencyKeys);
      await refreshStats();
      console.log(`Marked ${idempotencyKeys.length} attempts as synced`);
    } catch (error) {
      console.error('Failed to mark attempts as synced:', error);
      throw error;
    }
  }, [state.isInitialized, refreshStats]);

  // Bookmark operations
  const addBookmarkData = useCallback(async (userId: string, questionId: string) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    
    try {
      await addBookmark(userId, questionId);
      await refreshStats();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      throw error;
    }
  }, [state.isInitialized, refreshStats]);

  const removeBookmarkData = useCallback(async (userId: string, questionId: string) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    
    try {
      await removeBookmark(userId, questionId);
      await refreshStats();
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      throw error;
    }
  }, [state.isInitialized, refreshStats]);

  const checkIsBookmarked = useCallback(async (userId: string, questionId: string) => {
    if (!state.isInitialized) return false;
    return await isBookmarked(userId, questionId);
  }, [state.isInitialized]);

  const getUserBookmarksData = useCallback(async (userId: string) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    return await getUserBookmarks(userId);
  }, [state.isInitialized]);

  // Sync operations
  const getSyncStateData = useCallback(async () => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    return await getSyncState();
  }, [state.isInitialized]);

  const updateSyncStateData = useCallback(async (updates: any) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    
    try {
      await updateSyncState(updates);
      await refreshStats();
    } catch (error) {
      console.error('Failed to update sync state:', error);
      throw error;
    }
  }, [state.isInitialized, refreshStats]);

  // Utility operations
  const clearUserDataFromDB = useCallback(async (userId: string) => {
    if (!state.isInitialized) throw new Error('Database not initialized');
    
    try {
      await clearUserData(userId);
      await refreshStats();
      
      toast({
        title: 'Data Cleared',
        description: 'User data has been cleared from local storage.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw error;
    }
  }, [state.isInitialized, refreshStats]);

  return {
    ...state,
    refreshStats,
    
    // Pack operations
    storePack: storePackData,
    getPack: getPackData,
    getAllPacks: getAllPacksData,
    
    // Question operations
    getQuestion: getQuestionData,
    getQuestionsByPack: getQuestionsByPackData,
    
    // Attempt operations
    queueAttempt: queueAttemptData,
    getQueuedAttempts: getQueuedAttemptsData,
    markAttemptsSynced: markAttemptsSyncedData,
    getQueuedAttemptsCount,
    
    // Bookmark operations
    addBookmark: addBookmarkData,
    removeBookmark: removeBookmarkData,
    isBookmarked: checkIsBookmarked,
    getUserBookmarks: getUserBookmarksData,
    
    // Sync operations
    getSyncState: getSyncStateData,
    updateSyncState: updateSyncStateData,
    
    // Utility operations
    clearUserData: clearUserDataFromDB,
  };
}

// Hook for managing offline questions
export function useOfflineQuestions(packId?: string) {
  const db = useIndexedDB();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuestions = useCallback(async () => {
    if (!db.isInitialized || !packId) return;

    try {
      setIsLoading(true);
      const questionsData = await db.getQuestionsByPack(packId);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to load offline questions:', error);
      toast({
        title: 'Load Error',
        description: 'Failed to load questions from local storage.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [db.isInitialized, packId, db.getQuestionsByPack]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    isLoading,
    reload: loadQuestions,
  };
}