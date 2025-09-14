
// Generic fetch utility for Supabase Edge Functions
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types/QuestionInterface';

// Base URL for Supabase Edge Functions - use the same URL as the client
const EDGE_FUNCTION_BASE_URL = SUPABASE_URL;

export interface EdgeFunctionResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Retrieves current auth token from Supabase
 * @returns Authorization header object or empty object if no token
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      return {
        Authorization: `Bearer ${data.session.access_token}`
      };
    }
    return {};
  } catch (error) {
    console.error("Error getting auth token:", error);
    return {};
  }
}

/**
 * Calls a Supabase Edge Function using the fetch API
 * @param functionName Name of the edge function to call
 * @param options Additional fetch options (method, headers, body)
 * @param queryParams Optional URL query parameters
 * @returns Promise with the edge function response
 */
export async function callEdgeFunction<T>(
  functionName: string,
  options: RequestInit = { method: 'GET' },
  queryParams: Record<string, string> = {}
): Promise<EdgeFunctionResponse<T>> {
  try {
    // Build query string from params
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${EDGE_FUNCTION_BASE_URL}/functions/v1/${functionName}${queryString ? `?${queryString}` : ''}`;
    
    console.log(`Calling Edge Function: ${functionName}`, { url, method: options.method });
    
    // Get auth headers if not provided in options
    const authHeaders = await getAuthHeaders();
    const hasAuthHeader = options.headers && 
      (options.headers as Record<string, string>)['Authorization'] !== undefined;
    
    // For Edge Functions, we need the anon key as a fallback
    const fallbackHeaders = authHeaders.Authorization ? {} : {
      'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    };
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...fallbackHeaders,
      ...(hasAuthHeader ? {} : authHeaders),
      ...options.headers,
    };

    console.log(`Headers for ${functionName}:`, headers);

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit', // Don't send cookies for CORS
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge Function ${functionName} failed:`, errorText);
      throw new Error(`Error from ${functionName}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Error calling Edge Function ${functionName}:`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Hook to fetch data from a Supabase Edge Function
 * @param functionName Name of the edge function to call
 * @param options Additional fetch options
 * @param queryParams Optional URL query parameters 
 * @returns Object containing data, loading state, and any errors
 */
export function useEdgeFunction<T>(
  functionName: string, 
  options: RequestInit = { method: 'GET' },
  queryParams: Record<string, string> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const result = await callEdgeFunction<T>(functionName, options, queryParams);
        
        if (!isMounted) return;
        
        if (result.error) {
          setError(result.error);
          toast({
            title: "Error",
            description: `Failed to load data from ${functionName}`,
            variant: "destructive",
          });
        } else {
          setData(result.data);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err as Error);
        toast({
          title: "Error",
          description: `Failed to load data from ${functionName}`,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [functionName, JSON.stringify(options), JSON.stringify(queryParams)]);

  return { data, loading, error };
}

/**
 * Specialized function to fetch data from the my-function endpoint
 * @param options Additional fetch options
 * @returns Promise with the edge function response
 */
export async function fetchMyFunctionData<T>(options: RequestInit = { method: 'GET' }) {
  try {
    console.log('Fetching data from my-function endpoint...');
    const result = await callEdgeFunction<T>('my-function', options);
    
    if (result.error) {
      console.error('Error fetching from my-function endpoint:', result.error);
      toast({
        title: "API Error",
        description: `Failed to fetch from my-function: ${result.error.message}`,
        variant: "destructive",
      });
    }
    
    return result;
  } catch (error) {
    console.error('Exception when fetching from my-function:', error);
    toast({
      title: "Exception",
      description: `Exception when calling my-function: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Hook to fetch data from the my-function endpoint
 * @param options Additional fetch options
 * @param queryParams Optional URL query parameters
 * @returns Object containing data, loading state, and any errors
 */
export function useMyFunctionData<T>(
  options: RequestInit = { method: 'GET' },
  queryParams: Record<string, string> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const result = await callEdgeFunction<T>('my-function', options, queryParams);
        
        if (!isMounted) return;
        
        if (result.error) {
          setError(result.error);
          toast({
            title: "Error",
            description: `Failed to load data from my-function`,
            variant: "destructive",
          });
        } else {
          setData(result.data);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err as Error);
        toast({
          title: "Error",
          description: `Failed to load data from my-function`,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(options), JSON.stringify(queryParams)]);

  return { data, loading, error };
}

/**
 * Specialized function to log interactions via the log-interaction endpoint
 * @param interactionData Data to log
 * @param options Additional fetch options
 * @returns Promise with the edge function response
 */
export async function logInteraction<T>(
  interactionData: any,
  options: RequestInit = {}
): Promise<EdgeFunctionResponse<T>> {
  try {
    console.log('Logging interaction...', interactionData);
    
    // Set up default POST options
    const postOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(interactionData),
      ...options,
    };
    
    const result = await callEdgeFunction<T>('log-interaction', postOptions);
    
    if (result.error) {
      console.error('Error logging interaction:', result.error);
      toast({
        title: "API Error",
        description: `Failed to log interaction: ${result.error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Interaction logged successfully",
      });
    }
    
    return result;
  } catch (error) {
    console.error('Exception when logging interaction:', error);
    toast({
      title: "Exception",
      description: `Exception when logging interaction: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Hook to log interactions using the log-interaction endpoint
 */
export function useLogInteraction() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitInteraction = async (interactionData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await logInteraction(interactionData);
      setData(result.data);
      return result;
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { submitInteraction, data, loading, error };
}

/**
 * Specialized service for fetching questions via the get-questions Edge Function
 */
export class EdgeFunctionQuestionService {
  /**
   * Fetch questions using the get-questions Edge Function
   */
  async fetchQuestions(): Promise<Question[]> {
    try {
      console.log('🚀 Calling get-questions Edge Function...');
      
      const result = await callEdgeFunction<{ questions: Question[]; success: boolean; count: number }>('get-questions');
      
      if (result.error) {
        throw result.error;
      }

      if (!result.data?.success) {
        throw new Error('Edge Function returned unsuccessful response');
      }

      console.log(`✅ Edge Function returned ${result.data.count} questions`);
      return result.data.questions || [];

    } catch (error) {
      console.error('💥 Edge Function question service error:', error);
      throw error;
    }
  }

  /**
   * Test if the get-questions Edge Function is available
   */
  async testFunction(): Promise<boolean> {
    try {
      const questions = await this.fetchQuestions();
      return questions.length > 0;
    } catch (error) {
      console.error('Edge Function test failed:', error);
      return false;
    }
  }
}

export const edgeFunctionQuestionService = new EdgeFunctionQuestionService();
