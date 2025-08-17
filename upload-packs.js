#!/usr/bin/env node

/**
 * Upload content packs to Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zmsqscxqxlhhehzwbylv.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function uploadPacks() {
  console.log('📦 Uploading content packs to Supabase Storage...');
  
  const buildDir = path.join(__dirname, 'content/build');
  const packsDir = path.join(buildDir, 'packs');
  const manifestPath = path.join(buildDir, 'manifest.json');
  
  try {
    // Upload manifest.json
    console.log('📄 Uploading manifest.json...');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    
    const { error: manifestError } = await supabase.storage
      .from('question-packs')
      .upload('manifest.json', manifestContent, {
        contentType: 'application/json',
        upsert: true,
      });
    
    if (manifestError) {
      console.error('❌ Failed to upload manifest:', manifestError.message);
      return;
    }
    
    console.log('✅ Manifest uploaded successfully');
    
    // Upload pack files
    const packFiles = await fs.readdir(packsDir);
    const jsonFiles = packFiles.filter(file => file.endsWith('.json'));
    
    for (const file of jsonFiles) {
      console.log(`📦 Uploading ${file}...`);
      
      const filePath = path.join(packsDir, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      const { error: packError } = await supabase.storage
        .from('question-packs')
        .upload(`packs/${file}`, fileContent, {
          contentType: 'application/json',
          upsert: true,
        });
      
      if (packError) {
        console.error(`❌ Failed to upload ${file}:`, packError.message);
      } else {
        console.log(`✅ ${file} uploaded successfully`);
      }
    }
    
    console.log('\n🎉 All content packs uploaded!');
    console.log('\nNow test with: ./test-entitlement.sh');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadPacks();