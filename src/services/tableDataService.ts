
import { supabase } from '@/lib/supabase';
import { toast } from "@/hooks/use-toast";

// List of all available tables in the Supabase database
// These tables may not exist yet in your database - the code will handle this gracefully
export const TABLES = [
  'community_stats',
  'model_sat_math_question',
  'model_test_question',
  'objectives',
  'sat_math_leaders_board',
  'sat_math_progress',
  'sat_math_questions',
  'user_profiles',
  'user_question_interactions'
];

/**
 * Fetch data from a single table
 * @param tableName Name of the table to fetch data from
 * @param options Optional query parameters like limit, select columns, etc.
 * @returns Promise resolving to the table data
 */
export async function fetchTable(
  tableName: string, 
  options: {
    limit?: number;
    columns?: string;
    filters?: Record<string, any>;
  } = {}
) {
  try {
    console.log(`Fetching data from ${tableName} table...`);
    
    // Start building the query - use type assertion here to bypass TypeScript restrictions
    // as we're dynamically selecting tables that TypeScript doesn't know about at compile time
    let query = supabase.from(tableName as any).select(options.columns || '*');
    
    // Apply limit if provided
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    // Apply any filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      // Check if this is a "table doesn't exist" error
      if (error.code === '42P01') {
        console.warn(`Table '${tableName}' does not exist yet in the database`);
        return { data: [], count: 0 };
      }
      
      console.error(`Error fetching ${tableName}:`, error);
      throw new Error(`Error fetching ${tableName}: ${error.message}`);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} rows from ${tableName}`);
    return { data, count };
  } catch (err: any) {
    console.error(`Exception fetching ${tableName}:`, err);
    toast({
      title: `Error fetching ${tableName}`,
      description: err.message || "An unknown error occurred",
      variant: "destructive",
    });
    return { data: [], count: 0 };
  }
}

/**
 * Fetch data from multiple tables
 * @param tableNames Array of table names to fetch data from
 * @param options Optional query parameters
 * @returns Promise resolving to an object with table data
 */
export async function fetchMultipleTables(
  tableNames: string[] = TABLES, 
  options: {
    limit?: number;
    toast?: boolean;
  } = { limit: 10, toast: true }
) {
  const results: Record<string, any[]> = {};
  let successCount = 0;
  let errorCount = 0;

  console.log(`Starting to fetch data from ${tableNames.length} tables...`);
  
  for (const table of tableNames) {
    try {
      const { data } = await fetchTable(table, { limit: options.limit });
      results[table] = data || [];
      successCount++;
    } catch (err) {
      console.error(`Failed to fetch ${table}:`, err);
      results[table] = []; // or null if you prefer
      errorCount++;
    }
  }

  if (options.toast) {
    if (errorCount > 0) {
      toast({
        title: "Data Fetch Results",
        description: `Successfully fetched ${successCount} tables. Failed to fetch ${errorCount} tables.`,
        variant: errorCount > successCount ? "destructive" : "default",
      });
    } else {
      toast({
        title: "Success",
        description: `Successfully fetched data from all ${successCount} tables`,
      });
    }
  }

  return results;
}

/**
 * Fetch all tables in the database
 * @param options Optional query parameters
 * @returns Promise resolving to an object with all table data
 */
export async function fetchAllTables(
  options: {
    limit?: number;
    toast?: boolean;
  } = { limit: 10, toast: true }
) {
  return fetchMultipleTables(TABLES, options);
}

/**
 * Function to check if a table exists
 * @param tableName Table name to check
 * @returns Promise resolving to boolean
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Try to fetch 0 rows from the table
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);
      
    // If no error, the table exists
    return !error;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    return false;
  }
}

/**
 * Get counts for all tables
 * @returns Promise resolving to an object with table counts
 */
export async function getTableCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  
  for (const table of TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist
          counts[table] = 0;
          continue;
        }
        throw error;
      }
      
      counts[table] = count || 0;
    } catch (err) {
      console.error(`Error getting count for ${table}:`, err);
      counts[table] = 0;
    }
  }
  
  return counts;
}

// Export types for better type checking
export type TableNames = typeof TABLES[number];
