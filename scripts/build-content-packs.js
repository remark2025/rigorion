#!/usr/bin/env node

/**
 * Content Pack Builder
 * 
 * Automates the process of building content packs from source files
 * Generates hashes, validates content, and optimizes for CDN delivery
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  encodeQuestionPayload,
  compressPayload,
  encryptPayload,
  getMasterContentKey,
  derivePackKey,
  deriveQuestionKey,
  hashBuffer,
  bufferToBase64,
  makeAad,
  getBrotliRatio,
} from './lib/encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENABLE_ENCRYPTION = process.argv.includes('--encrypt');
const KEY_VERSION = process.env.CONTENT_KEY_VERSION || 'v1';

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '../content/source'),
  buildDir: path.join(__dirname, '../content/build'),
  manifestFile: path.join(__dirname, '../content/build/manifest.json'),
  maxPackSize: 5 * 1024 * 1024, // 5MB max per pack
  compressionLevel: 9,
  hashAlgorithm: 'sha256',
  cacheMaxAge: 31536000, // 1 year in seconds
};
CONFIG.encryptedDir = path.join(CONFIG.buildDir, 'encrypted');
CONFIG.encryptedPackDir = path.join(CONFIG.encryptedDir, 'packs');
CONFIG.encryptedManifestFile = path.join(CONFIG.encryptedDir, 'manifest.json');

// Pack validation schema
const PACK_SCHEMA = {
  required: ['id', 'title', 'description', 'difficulty', 'questions'],
  questionRequired: ['id', 'type', 'content', 'options', 'correct_answer', 'explanation'],
  difficultyLevels: ['beginner', 'intermediate', 'advanced', 'mixed'],
  questionTypes: ['multiple_choice', 'grid_in', 'student_response'],
};

class ContentPackBuilder {
  constructor() {
    this.manifest = {
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      packs: {},
      totalSize: 0,
    };
    this.errors = [];
    this.warnings = [];
    this.encryptionEnabled = ENABLE_ENCRYPTION;
    this.masterContentKey = this.encryptionEnabled ? getMasterContentKey() : null;
    this.encryptedManifest = this.encryptionEnabled
      ? {
          version: '1.0.0',
          buildTime: new Date().toISOString(),
          keyVersion: KEY_VERSION,
          packs: {},
          questions: {},
        }
      : null;
  }

  async build() {
    console.log('🏗️  Starting content pack build...');
    
    try {
      await this.ensureDirectories();
      await this.loadSourcePacks();
      await this.generateManifest();
      await this.writeManifest();
      if (this.encryptionEnabled) {
        await this.writeEncryptedManifest();
      }
      
      this.printSummary();
      
      if (this.errors.length > 0) {
        process.exit(1);
      }
      
      console.log('✅ Build completed successfully!');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    await fs.mkdir(CONFIG.buildDir, { recursive: true });
    await fs.mkdir(path.join(CONFIG.buildDir, 'packs'), { recursive: true });
    if (this.encryptionEnabled) {
      await fs.mkdir(CONFIG.encryptedPackDir, { recursive: true });
    }
  }

  async loadSourcePacks() {
    console.log('📂 Loading source packs...');
    
    try {
      const sourceFiles = await fs.readdir(CONFIG.sourceDir);
      const packFiles = sourceFiles.filter(file => file.endsWith('.json'));
      
      for (const file of packFiles) {
        const packId = path.basename(file, '.json');
        await this.processPack(packId, path.join(CONFIG.sourceDir, file));
      }
      
      console.log(`📦 Processed ${Object.keys(this.manifest.packs).length} packs`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  Source directory not found: ${CONFIG.sourceDir}`);
        console.log('Creating example pack structure...');
        await this.createExamplePacks();
      } else {
        throw error;
      }
    }
  }

  async processPack(packId, filePath) {
    try {
      console.log(`  Processing pack: ${packId}`);
      
      const rawContent = await fs.readFile(filePath, 'utf8');
      const packData = JSON.parse(rawContent);
      
      // Validate pack structure
      this.validatePack(packId, packData);
      
      // Process and optimize content
      const processedPack = await this.processPackContent(packData);
      
      // Generate content hash
      const contentString = JSON.stringify(processedPack, null, 0);
      const contentHash = crypto.createHash(CONFIG.hashAlgorithm).update(contentString).digest('hex');
      const contentSize = Buffer.byteLength(contentString, 'utf8');
      
      // Check size limits
      if (contentSize > CONFIG.maxPackSize) {
        this.errors.push(`Pack ${packId} exceeds size limit: ${this.formatBytes(contentSize)} > ${this.formatBytes(CONFIG.maxPackSize)}`);
        return;
      }
      
      // Write optimized pack file
      const packFilePath = path.join(CONFIG.buildDir, 'packs', `${packId}.json`);
      await fs.writeFile(packFilePath, contentString, 'utf8');
      
      // Add to manifest
      this.manifest.packs[packId] = {
        id: packId,
        title: processedPack.title,
        description: processedPack.description,
        difficulty: processedPack.difficulty,
        questionCount: processedPack.questions.length,
        size: contentSize,
        hash: contentHash,
        file: `packs/${packId}.json`,
        lastModified: new Date().toISOString(),
        cacheControl: `public, max-age=${CONFIG.cacheMaxAge}, immutable`,
        etag: `"${contentHash}"`,
      };
      
      this.manifest.totalSize += contentSize;
      
      console.log(`    ✓ ${processedPack.questions.length} questions, ${this.formatBytes(contentSize)}, hash: ${contentHash.substring(0, 8)}...`);
      
      if (this.encryptionEnabled) {
        await this.buildEncryptedPack(packId, processedPack);
      }
      
    } catch (error) {
      this.errors.push(`Failed to process pack ${packId}: ${error.message}`);
    }
  }

  validatePack(packId, packData) {
    // Validate required fields
    for (const field of PACK_SCHEMA.required) {
      if (!packData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate difficulty level
    if (!PACK_SCHEMA.difficultyLevels.includes(packData.difficulty)) {
      throw new Error(`Invalid difficulty level: ${packData.difficulty}`);
    }
    
    // Validate questions
    if (!Array.isArray(packData.questions) || packData.questions.length === 0) {
      throw new Error('Pack must contain at least one question');
    }
    
    packData.questions.forEach((question, index) => {
      this.validateQuestion(question, index);
    });
    
    // Check for duplicate question IDs
    const questionIds = packData.questions.map(q => q.id);
    const duplicates = questionIds.filter((id, index) => questionIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate question IDs: ${duplicates.join(', ')}`);
    }
  }

  validateQuestion(question, index) {
    // Validate required fields
    for (const field of PACK_SCHEMA.questionRequired) {
      if (question[field] === undefined || question[field] === null) {
        throw new Error(`Question ${index}: Missing required field: ${field}`);
      }
    }
    
    // Validate question type
    if (!PACK_SCHEMA.questionTypes.includes(question.type)) {
      throw new Error(`Question ${index}: Invalid question type: ${question.type}`);
    }
    
    // Validate multiple choice questions
    if (question.type === 'multiple_choice') {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new Error(`Question ${index}: Multiple choice questions must have at least 2 options`);
      }
      
      if (!question.options.some(opt => opt.id === question.correct_answer)) {
        throw new Error(`Question ${index}: Correct answer must match one of the option IDs`);
      }
    }
    
    // Validate content length
    if (typeof question.content === 'string' && question.content.length > 5000) {
      this.warnings.push(`Question ${question.id}: Content is very long (${question.content.length} chars)`);
    }
  }

  async processPackContent(packData) {
    const processed = { ...packData };
    
    // Process questions
    processed.questions = packData.questions.map(question => {
      const processedQuestion = { ...question };
      
      // Add metadata
      processedQuestion.wordCount = this.countWords(question.content);
      processedQuestion.estimatedTime = Math.max(30, Math.ceil(processedQuestion.wordCount / 200 * 60)); // seconds
      
      // Process content (remove extra whitespace, etc.)
      if (typeof processedQuestion.content === 'string') {
        processedQuestion.content = processedQuestion.content.trim().replace(/\s+/g, ' ');
      }
      
      // Process options for multiple choice
      if (question.type === 'multiple_choice' && Array.isArray(question.options)) {
        processedQuestion.options = question.options.map(option => ({
          ...option,
          text: typeof option.text === 'string' ? option.text.trim() : option.text,
        }));
      }
      
      // Generate question hash for caching
      const questionString = JSON.stringify({
        content: processedQuestion.content,
        options: processedQuestion.options,
        type: processedQuestion.type,
      });
      processedQuestion.contentHash = crypto.createHash('md5').update(questionString).digest('hex');
      
      return processedQuestion;
    });
    
    // Add pack metadata
    processed.version = '1.0.0';
    processed.generatedAt = new Date().toISOString();
    processed.wordCount = processed.questions.reduce((sum, q) => sum + (q.wordCount || 0), 0);
    processed.estimatedTime = processed.questions.reduce((sum, q) => sum + (q.estimatedTime || 0), 0);
    
    return processed;
  }

  async generateManifest() {
    console.log('📋 Generating manifest...');
    
    // Sort packs by difficulty and title
    const sortedPacks = Object.entries(this.manifest.packs)
      .sort(([, a], [, b]) => {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        const diffCompare = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        return diffCompare !== 0 ? diffCompare : a.title.localeCompare(b.title);
      });
    
    this.manifest.packs = Object.fromEntries(sortedPacks);
    this.manifest.packIds = Object.keys(this.manifest.packs);
    this.manifest.totalPacks = this.manifest.packIds.length;
  }

  async writeManifest() {
    const manifestContent = JSON.stringify(this.manifest, null, 2);
    await fs.writeFile(CONFIG.manifestFile, manifestContent, 'utf8');
    
    // Also write a compact version for production
    const compactManifest = JSON.stringify(this.manifest);
    await fs.writeFile(
      path.join(CONFIG.buildDir, 'manifest.min.json'),
      compactManifest,
      'utf8'
    );
    
    console.log(`📄 Manifest written: ${CONFIG.manifestFile}`);
  }

  async createExamplePacks() {
    await fs.mkdir(CONFIG.sourceDir, { recursive: true });
    
    const examplePack = {
      id: 'sample-math',
      title: 'Sample Math Pack',
      description: 'Example content pack for testing',
      difficulty: 'intermediate',
      category: 'math',
      tags: ['algebra', 'geometry'],
      questions: [
        {
          id: 'MATH-001',
          type: 'multiple_choice',
          content: 'What is the value of x in the equation 2x + 5 = 13?',
          options: [
            { id: 'A', text: '3' },
            { id: 'B', text: '4' },
            { id: 'C', text: '5' },
            { id: 'D', text: '6' },
          ],
          correct_answer: 'B',
          explanation: 'Solving for x: 2x + 5 = 13, so 2x = 8, therefore x = 4.',
          difficulty: 'intermediate',
          topics: ['algebra', 'linear-equations'],
        },
        {
          id: 'MATH-002',
          type: 'multiple_choice',
          content: 'If a triangle has sides of length 3, 4, and 5, what type of triangle is it?',
          options: [
            { id: 'A', text: 'Acute' },
            { id: 'B', text: 'Right' },
            { id: 'C', text: 'Obtuse' },
            { id: 'D', text: 'Equilateral' },
          ],
          correct_answer: 'B',
          explanation: 'This is a right triangle because 3² + 4² = 9 + 16 = 25 = 5².',
          difficulty: 'beginner',
          topics: ['geometry', 'triangles'],
        },
      ],
    };
    
    await fs.writeFile(
      path.join(CONFIG.sourceDir, 'sample-math.json'),
      JSON.stringify(examplePack, null, 2),
      'utf8'
    );
    
    console.log(`📝 Created example pack: ${CONFIG.sourceDir}/sample-math.json`);
  }

  async buildEncryptedPack(packId, packData) {
    const packKey = derivePackKey(this.masterContentKey, packId);
    const entries = [];
    const ciphertextChunks = [];
    let offset = 0;
    let totalRawBytes = 0;
    let totalCompressedBytes = 0;
    let totalCiphertextBytes = 0;

    for (const question of packData.questions) {
      const rawBuffer = encodeQuestionPayload(question);
      const compressed = compressPayload(rawBuffer);
      const questionKey = deriveQuestionKey(packKey, question.id, KEY_VERSION);
      const plaintextHash = hashBuffer(compressed);
      const aad = makeAad(packId, question.id, plaintextHash);
      const { ciphertext, iv, authTag } = encryptPayload({
        key: questionKey,
        plaintext: compressed,
        aad,
      });

      const ciphertextHash = hashBuffer(ciphertext);
      const entry = {
        questionId: question.id,
        offset,
        length: ciphertext.length,
        iv: bufferToBase64(iv),
        authTag: bufferToBase64(authTag),
        aadHash: hashBuffer(aad),
        plaintextSha256: plaintextHash,
        ciphertextSha256: ciphertextHash,
        rawBytes: rawBuffer.length,
        compressedBytes: compressed.length,
        ciphertextBytes: ciphertext.length,
        brotliRatio: getBrotliRatio(rawBuffer.length, compressed.length),
      };

      entries.push(entry);
      if (this.encryptedManifest && this.encryptedManifest.questions) {
        this.encryptedManifest.questions[question.id] = {
          packId,
          entryIndex: entries.length - 1,
        };
      }
      ciphertextChunks.push(ciphertext);
      offset += ciphertext.length;
      totalRawBytes += rawBuffer.length;
      totalCompressedBytes += compressed.length;
      totalCiphertextBytes += ciphertext.length;
    }

    const packBuffer = Buffer.concat(ciphertextChunks);
    const packFilePath = path.join(CONFIG.encryptedPackDir, `${packId}.bin`);
    const packManifestPath = path.join(CONFIG.encryptedPackDir, `${packId}.manifest.json`);

    await fs.writeFile(packFilePath, packBuffer);
    await fs.writeFile(
      packManifestPath,
      JSON.stringify(
        {
          packId,
          keyVersion: KEY_VERSION,
          cipher: 'AES-256-GCM',
          compression: 'brotli',
          encoding: 'canonical-json',
          questionCount: entries.length,
          totalRawBytes,
          totalCompressedBytes,
          totalCiphertextBytes,
          blobHash: hashBuffer(packBuffer),
          entries,
        },
        null,
        2
      ),
      'utf8'
    );

    // Add question-to-pack mapping to global manifest
    if (!this.encryptedManifest.questionIndex) {
      this.encryptedManifest.questionIndex = {};
    }
    
    entries.forEach(entry => {
      this.encryptedManifest.questionIndex[entry.questionId] = {
        packId,
        offset: entry.offset,
        length: entry.length
      };
    });

    this.encryptedManifest.packs[packId] = {
      id: packId,
      questionCount: entries.length,
      keyVersion: KEY_VERSION,
      packFile: path.relative(CONFIG.buildDir, packFilePath).replace(/\\/g, '/'),
      manifestFile: path.relative(CONFIG.buildDir, packManifestPath).replace(/\\/g, '/'),
      hash: hashBuffer(packBuffer),
      size: packBuffer.length,
      lastModified: new Date().toISOString(),
    };

    console.log(
      `      🔐 Encrypted pack ready: ${this.formatBytes(packBuffer.length)} (avg ratio ${getBrotliRatio(
        totalRawBytes,
        totalCompressedBytes
      )})`
    );
  }

  async writeEncryptedManifest() {
    if (!this.encryptionEnabled) return;
    const manifestContent = JSON.stringify(this.encryptedManifest, null, 2);
    await fs.writeFile(CONFIG.encryptedManifestFile, manifestContent, 'utf8');
    console.log(`🔐 Encrypted manifest written: ${CONFIG.encryptedManifestFile}`);
  }

  countWords(text) {
    if (typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printSummary() {
    console.log('\n📊 Build Summary:');
    console.log(`   Packs: ${this.manifest.totalPacks}`);
    console.log(`   Total size: ${this.formatBytes(this.manifest.totalSize)}`);
    console.log(`   Build time: ${this.manifest.buildTime}`);
    if (this.encryptionEnabled) {
      const encryptedPacks = Object.values(this.encryptedManifest.packs || {});
      const encryptedBytes = encryptedPacks.reduce((sum, pack) => sum + (pack.size || 0), 0);
      console.log(
        `   Encrypted packs: ${encryptedPacks.length} (${this.formatBytes(encryptedBytes)})`
      );
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`   ${error}`));
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new ContentPackBuilder();
  builder.build().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
  });
}

export { ContentPackBuilder, CONFIG };
