
// src/services/mathQuestionService.ts
import { callEdgeFunction } from './edgeFunctionService';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export async function getModelSatQuestions() {
  try {
    const { data, error } = await callEdgeFunction('get-sat-model-question');
    
    return { data, error: error ? error.message : null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getCustomFunction() {
  try {
    console.log('Calling my-function endpoint...');
    
    // Get the current session to include auth token if available
    const { data: { session } } = await supabase.auth.getSession();
    const options: RequestInit = { 
      method: 'GET',
      headers: {} 
    };
    
    // If there's an active session, include the Authorization header
    if (session?.access_token) {
      options.headers = {
        Authorization: `Bearer ${session.access_token}`
      };
      console.log('Including auth token in request');
    }
    
    const { data, error } = await callEdgeFunction('my-function', options);
    
    if (error) {
      console.error('Error fetching from my-function endpoint:', error);
      toast({
        title: "API Error",
        description: `Failed to fetch from my-function: ${error.message}`,
        variant: "destructive",
      });
      return { data: null, error: error.message };
    }
    
    console.log('Successfully fetched data from my-function:', data);
    toast({
      title: "Success",
      description: "Successfully fetched data from my-function",
    });
    return { data, error: null };
  } catch (error) {
    console.error('Exception when fetching from my-function:', error);
    toast({
      title: "Exception",
      description: `Exception when calling my-function: ${error instanceof Error ? error.message : String(error)}`,
      variant: "destructive",
    });
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

// Function to demonstrate the API call
export async function testCustomFunction() {
  console.log('Testing custom function API call...');
  const result = await getCustomFunction();
  console.log('Test result:', result);
  return result;
}
