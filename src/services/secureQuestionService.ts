import { Question } from "@/types/QuestionInterface";

interface PaginationInfo {
  hasMore: boolean;
  nextCursor: string | null;
  limit: number;
}

interface QuestionsResponse {
  questions: Question[];
  success: boolean;
  count: number;
  pagination: PaginationInfo;
  timestamp: string;
}

interface InteractiveSolutionResponse {
  success: boolean;
  questionId: string;
  renderPayload: any;
  timestamp: string;
}

class SecureQuestionService {
  private baseUrl = 'https://zmsqscxqxlhhehzwbylv.supabase.co/functions/v1';
  private lastEtag: string | null = null;
  private lastSyncAt: string | null = null;

  async fetchQuestions(options: {
    packId?: string;
    since?: string;
    limit?: number;
    cursor?: string;
    useCache?: boolean;
  } = {}): Promise<Question[]> {
    const {
      packId,
      since = this.lastSyncAt || undefined,
      limit = 500,
      cursor,
      useCache = true
    } = options;

    // Build URL with query parameters (fallback to working endpoint until secure is deployed)
    const url = new URL(`${this.baseUrl}/get-questions`);
    if (packId) url.searchParams.set('packId', packId);
    if (since) url.searchParams.set('since', since);
    if (cursor) url.searchParams.set('cursor', cursor);
    url.searchParams.set('limit', limit.toString());

    // Get user token from localStorage or auth context
    const userToken = this.getUserToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };

    // Add ETag for caching
    if (useCache && this.lastEtag) {
      headers['If-None-Match'] = this.lastEtag;
    }

    try {
      console.log('📡 Fetching questions from secure endpoint:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers
      });

      // Handle 304 Not Modified (cached)
      if (response.status === 304) {
        console.log('📦 Using cached questions (304)');
        return []; // Return empty - caller should use cached data
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Store ETag for next request
      const etag = response.headers.get('etag');
      if (etag) {
        this.lastEtag = etag;
      }

      const data = await response.json();
      
      // Handle both new format and legacy format
      if (data.questions) {
        console.log(`✅ Fetched ${data.questions.length} questions`);
        
        // Update sync timestamp only on 200 (not 304)
        if (data.timestamp && response.status === 200) {
          this.lastSyncAt = data.timestamp;
        }
        
        return data.questions;
      } else if (Array.isArray(data)) {
        // Legacy format - direct array
        console.log(`✅ Fetched ${data.length} questions (legacy format)`);
        return data;
      } else {
        throw new Error('Unexpected response format');
      }

    } catch (error) {
      console.error('❌ Secure question service error:', error);
      throw error;
    }
  }

  async fetchAllQuestions(packId?: string): Promise<Question[]> {
    const allQuestions: Question[] = [];
    let cursor: string | null = null;
    let hasMore = true;

    while (hasMore) {
      const questions = await this.fetchQuestions({
        packId,
        cursor: cursor || undefined,
        limit: 500
      });

      allQuestions.push(...questions);

      // Check if we got a full page (indicates more data might be available)
      hasMore = questions.length === 500;
      
      // Get composite cursor for next page (updatedAt,id)
      if (hasMore && questions.length > 0) {
        const lastQ = questions[questions.length - 1];
        cursor = `${lastQ.updatedAt},${lastQ.id}`;
      } else {
        hasMore = false;
      }
    }

    console.log(`📚 Fetched total of ${allQuestions.length} questions`);
    return allQuestions;
  }

  async getInteractiveSolution(questionId: string): Promise<any> {
    // For now, return null since the interactive solution endpoint isn't deployed yet
    // This will fall back to static solutions in the interactiveLoader
    console.log(`🎨 Interactive solution endpoint not available yet for: ${questionId}, using static fallback`);
    return null;
  }

  private getUserToken(): string {
    // Try to get from Supabase auth context
    if (typeof window !== 'undefined') {
      // Check localStorage for Supabase session
      const authData = localStorage.getItem('sb-zmsqscxqxlhhehzwbylv-auth-token');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          return parsed.access_token || '';
        } catch (e) {
          console.warn('Failed to parse auth token');
        }
      }
    }
    
    // Fallback to anon key (less secure but allows basic access)
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjIwNDksImV4cCI6MjA3MDgzODA0OX0.ns8hcVCVuE81-kepvptKwfQtU4fs6_2EaPOZ2whEOIQ';
  }

  // Reset cache state (useful for testing or logout)
  clearCache(): void {
    this.lastEtag = null;
    this.lastSyncAt = null;
  }
}

export const secureQuestionService = new SecureQuestionService();