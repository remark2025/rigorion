// Check what content packs exist in the database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zmsqscxqxlhhehzwbylv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjIwNDksImV4cCI6MjA3MDgzODA0OX0.ns8hcVCVuE81-kepvptKwfQtU4fs6_2EaPOZ2whEOIQ';

async function checkContentPacks() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('🔍 Checking content_packs table...');
    
    const { data: packs, error } = await supabase
      .from('content_packs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching content packs:', error);
      return;
    }

    if (packs && packs.length > 0) {
      console.log(`✅ Found ${packs.length} content packs:`);
      packs.forEach((pack, i) => {
        console.log(`${i + 1}. ID: ${pack.id}, Title: "${pack.title}", Slug: "${pack.slug}"`);
      });
    } else {
      console.log('❌ No content packs found');
    }

    // Also check existing questions to see their pack_id values
    console.log('\n🔍 Checking existing questions pack_id values...');
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('public_id, pack_id')
      .limit(10);

    if (qError) {
      console.error('❌ Error fetching questions:', qError);
      return;
    }

    if (questions && questions.length > 0) {
      console.log('📝 Existing questions pack_id values:');
      questions.forEach(q => {
        console.log(`  - ${q.public_id}: pack_id = ${q.pack_id}`);
      });
    }

  } catch (error) {
    console.error('💥 Exception:', error);
  }
}

checkContentPacks();