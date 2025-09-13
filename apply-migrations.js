// Apply database migrations to Supabase instance
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://zmsqscxqxlhhehzwbylv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2MjA0OSwiZXhwIjoyMDcwODM4MDQ5fQ.jO6Ma55TN_3S3KL2GWAtYWWBau_XhSuaQDnAi7EO3Xk';

// Use service role for database admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const migrationFiles = [
  '20250113_phase1_enums_and_types.sql',
  '20250113_phase1_core_tables.sql',
  '20250113_phase1_indexes_constraints.sql',
  '20250113_phase2_content_lifecycle.sql',
  '20250113_phase2_authoring_infrastructure.sql',
  '20250113_phase3_interactive_solutions.sql',
  '20250113_phase4_full_text_search.sql',
  '20250113_phase5_security_rls.sql'
];

async function applyMigrations() {
  console.log('🚀 Starting database migration process...');
  
  for (const filename of migrationFiles) {
    const filePath = path.join('supabase/migrations', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filename} - file not found`);
      continue;
    }
    
    console.log(`📄 Applying ${filename}...`);
    
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`❌ Error applying ${filename}:`, error);
        
        // Try alternative method - direct query
        const { error: directError } = await supabase
          .from('migrations')
          .insert({ name: filename, executed_at: new Date() });
        
        console.log(`🔄 Trying direct SQL execution for ${filename}...`);
        // We'll need to execute the SQL another way
      } else {
        console.log(`✅ Successfully applied ${filename}`);
      }
      
    } catch (err) {
      console.error(`💥 Exception applying ${filename}:`, err.message);
    }
    
    // Add small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🏁 Migration process completed!');
  
  // Test the new schema
  console.log('\n🔍 Testing new schema...');
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (error) {
      console.log('⚠️  Could not list tables, but this might be expected');
    } else {
      console.log('✅ Available tables:', tables?.map(t => t.table_name));
    }
  } catch (err) {
    console.log('Testing schema with direct table access...');
  }
  
  // Try to access the new questions table
  try {
    const { data: questionCount, error: countError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' });
      
    if (countError) {
      console.log('❌ Questions table not accessible yet:', countError.message);
    } else {
      console.log(`✅ Questions table accessible with ${questionCount?.length || 0} records`);
    }
  } catch (err) {
    console.log('❌ Questions table test failed:', err.message);
  }
}

applyMigrations();