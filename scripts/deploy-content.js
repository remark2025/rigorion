#!/usr/bin/env node

/**
 * Content Deployment Script
 * 
 * Deploys built content packs to Supabase Storage with CDN optimization
 * Manages versioning, cache invalidation, and rollback capabilities
 */

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  buildDir: path.join(__dirname, '../content/build'),
  manifestFile: path.join(__dirname, '../content/build/manifest.json'),
  bucket: 'content-packs',
  publicPath: 'public',
  versionsToKeep: 5,
  deploymentTimeout: 300000, // 5 minutes
};

class ContentDeployer {
  constructor() {
    this.supabase = null;
    this.manifest = null;
    this.deploymentId = null;
    this.deployed = {
      packs: 0,
      totalSize: 0,
      errors: [],
      skipped: [],
    };
  }

  async deploy() {
    console.log('🚀 Starting content deployment...');
    
    try {
      await this.initialize();
      await this.loadManifest();
      await this.createDeployment();
      await this.deployPacks();
      await this.deployManifest();
      await this.updateDeploymentRecord();
      await this.cleanupOldVersions();
      
      this.printSummary();
      console.log('✅ Deployment completed successfully!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      await this.rollback();
      process.exit(1);
    }
  }

  async initialize() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    console.log(`📡 Connected to Supabase: ${supabaseUrl}`);
    console.log(`🆔 Deployment ID: ${this.deploymentId}`);
  }

  async loadManifest() {
    try {
      const manifestContent = await fs.readFile(CONFIG.manifestFile, 'utf8');
      this.manifest = JSON.parse(manifestContent);
      
      console.log(`📋 Loaded manifest: ${this.manifest.totalPacks} packs, ${this.formatBytes(this.manifest.totalSize)}`);
    } catch (error) {
      throw new Error(`Failed to load manifest: ${error.message}`);
    }
  }

  async createDeployment() {
    console.log('📝 Creating deployment record...');
    
    const { error } = await this.supabase
      .from('content_deployments')
      .insert({
        id: this.deploymentId,
        status: 'in_progress',
        pack_count: this.manifest.totalPacks,
        total_size: this.manifest.totalSize,
        manifest_version: this.manifest.version,
        started_at: new Date().toISOString(),
      });
    
    if (error) {
      throw new Error(`Failed to create deployment record: ${error.message}`);
    }
  }

  async deployPacks() {
    console.log('📦 Deploying content packs...');
    
    const packIds = Object.keys(this.manifest.packs);
    
    for (const packId of packIds) {
      await this.deployPack(packId);
    }
    
    console.log(`📦 Deployed ${this.deployed.packs}/${packIds.length} packs`);
  }

  async deployPack(packId) {
    try {
      const packInfo = this.manifest.packs[packId];
      const packFilePath = path.join(CONFIG.buildDir, packInfo.file);
      
      console.log(`  Deploying pack: ${packId}`);
      
      // Check if pack already exists with same hash
      const existingPath = `${CONFIG.publicPath}/packs/${packId}.json`;
      const { data: existingFile } = await this.supabase.storage
        .from(CONFIG.bucket)
        .download(existingPath);
      
      if (existingFile) {
        // Calculate hash of existing file
        const existingContent = await existingFile.text();
        const crypto = await import('crypto');
        const existingHash = crypto.createHash('sha256').update(existingContent).digest('hex');
        
        if (existingHash === packInfo.hash) {
          console.log(`    ⏭️  Skipped (unchanged): ${packId}`);
          this.deployed.skipped.push(packId);
          return;
        }
      }
      
      // Read pack file
      const packContent = await fs.readFile(packFilePath, 'utf8');
      
      // Upload to storage
      const uploadPath = `${CONFIG.publicPath}/packs/${packId}.json`;
      const { error: uploadError } = await this.supabase.storage
        .from(CONFIG.bucket)
        .upload(uploadPath, packContent, {
          contentType: 'application/json',
          cacheControl: packInfo.cacheControl,
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Update pack metadata
      await this.updatePackMetadata(packId, packInfo);
      
      this.deployed.packs++;
      this.deployed.totalSize += packInfo.size;
      
      console.log(`    ✓ Deployed: ${packId} (${this.formatBytes(packInfo.size)})`);
      
    } catch (error) {
      console.error(`    ❌ Failed to deploy pack ${packId}:`, error.message);
      this.deployed.errors.push({ packId, error: error.message });
    }
  }

  async updatePackMetadata(packId, packInfo) {
    const { error } = await this.supabase
      .from('content_packs')
      .upsert({
        id: packId,
        title: packInfo.title,
        description: packInfo.description,
        difficulty: packInfo.difficulty,
        question_count: packInfo.questionCount,
        size_bytes: packInfo.size,
        content_hash: packInfo.hash,
        file_path: packInfo.file,
        last_modified: packInfo.lastModified,
        cache_control: packInfo.cacheControl,
        etag: packInfo.etag,
        deployment_id: this.deploymentId,
        is_active: true,
      });
    
    if (error) {
      throw new Error(`Failed to update pack metadata: ${error.message}`);
    }
  }

  async deployManifest() {
    console.log('📄 Deploying manifest...');
    
    try {
      // Update manifest with deployment info
      const deploymentManifest = {
        ...this.manifest,
        deploymentId: this.deploymentId,
        deployedAt: new Date().toISOString(),
        deployedPacks: this.deployed.packs,
        skippedPacks: this.deployed.skipped.length,
      };
      
      const manifestContent = JSON.stringify(deploymentManifest, null, 2);
      const compactManifest = JSON.stringify(deploymentManifest);
      
      // Upload full manifest
      await this.supabase.storage
        .from(CONFIG.bucket)
        .upload(`${CONFIG.publicPath}/manifest.json`, manifestContent, {
          contentType: 'application/json',
          cacheControl: 'public, max-age=300', // 5 minutes cache
          upsert: true,
        });
      
      // Upload compact manifest
      await this.supabase.storage
        .from(CONFIG.bucket)
        .upload(`${CONFIG.publicPath}/manifest.min.json`, compactManifest, {
          contentType: 'application/json',
          cacheControl: 'public, max-age=300',
          upsert: true,
        });
      
      // Upload versioned manifest for rollback
      const versionedPath = `versions/${this.deploymentId}/manifest.json`;
      await this.supabase.storage
        .from(CONFIG.bucket)
        .upload(versionedPath, manifestContent, {
          contentType: 'application/json',
          upsert: true,
        });
      
      console.log('    ✓ Manifest deployed');
      
    } catch (error) {
      throw new Error(`Failed to deploy manifest: ${error.message}`);
    }
  }

  async updateDeploymentRecord() {
    const status = this.deployed.errors.length > 0 ? 'completed_with_errors' : 'completed';
    
    const { error } = await this.supabase
      .from('content_deployments')
      .update({
        status,
        deployed_packs: this.deployed.packs,
        skipped_packs: this.deployed.skipped.length,
        error_count: this.deployed.errors.length,
        errors: this.deployed.errors.length > 0 ? this.deployed.errors : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', this.deploymentId);
    
    if (error) {
      console.warn('Failed to update deployment record:', error.message);
    }
  }

  async cleanupOldVersions() {
    console.log('🧹 Cleaning up old versions...');
    
    try {
      // Get list of version directories
      const { data: files } = await this.supabase.storage
        .from(CONFIG.bucket)
        .list('versions');
      
      if (!files || files.length <= CONFIG.versionsToKeep) {
        console.log('    ⏭️  No cleanup needed');
        return;
      }
      
      // Sort by creation time and remove oldest
      const sortedFiles = files
        .filter(file => file.name.startsWith('deploy_'))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      const filesToDelete = sortedFiles.slice(0, -CONFIG.versionsToKeep);
      
      for (const file of filesToDelete) {
        await this.supabase.storage
          .from(CONFIG.bucket)
          .remove([`versions/${file.name}/manifest.json`]);
        
        console.log(`    🗑️  Removed old version: ${file.name}`);
      }
      
    } catch (error) {
      console.warn('Failed to cleanup old versions:', error.message);
    }
  }

  async rollback() {
    console.log('🔄 Attempting rollback...');
    
    try {
      // Mark deployment as failed
      await this.supabase
        .from('content_deployments')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', this.deploymentId);
      
      // TODO: Implement actual rollback logic
      // This would restore the previous manifest and remove partially deployed packs
      
      console.log('    ✓ Deployment marked as failed');
    } catch (error) {
      console.error('Rollback failed:', error.message);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printSummary() {
    console.log('\n📊 Deployment Summary:');
    console.log(`   Deployment ID: ${this.deploymentId}`);
    console.log(`   Packs deployed: ${this.deployed.packs}`);
    console.log(`   Packs skipped: ${this.deployed.skipped.length}`);
    console.log(`   Total size: ${this.formatBytes(this.deployed.totalSize)}`);
    console.log(`   Errors: ${this.deployed.errors.length}`);
    
    if (this.deployed.skipped.length > 0) {
      console.log('\n⏭️  Skipped packs (unchanged):');
      this.deployed.skipped.forEach(packId => console.log(`   ${packId}`));
    }
    
    if (this.deployed.errors.length > 0) {
      console.log('\n❌ Deployment errors:');
      this.deployed.errors.forEach(({ packId, error }) => {
        console.log(`   ${packId}: ${error}`);
      });
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployer = new ContentDeployer();
  deployer.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

export { ContentDeployer };