#!/usr/bin/env node

/**
 * Content Validation Script
 * 
 * Validates content pack structure, quality, and educational standards
 * Runs comprehensive checks before deployment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation rules
const VALIDATION_RULES = {
  pack: {
    requiredFields: ['id', 'title', 'description', 'difficulty', 'questions'],
    maxTitleLength: 100,
    maxDescriptionLength: 500,
    minQuestions: 1,
    maxQuestions: 100,
    validDifficulties: ['beginner', 'intermediate', 'advanced'],
  },
  question: {
    requiredFields: ['id', 'type', 'content', 'correct_answer', 'explanation'],
    validTypes: ['multiple_choice', 'grid_in', 'student_response'],
    maxContentLength: 5000,
    maxExplanationLength: 2000,
    minOptions: 2,
    maxOptions: 5,
  },
  content: {
    maxPackSizeMB: 5,
    requiredImageAlt: true,
    forbiddenWords: ['TODO', 'FIXME', 'XXX', 'PLACEHOLDER'],
    minimumWordCount: 10,
  },
  educational: {
    explanationRequired: true,
    diverseQuestionTypes: true,
    bloomsTaxonomy: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
    readabilityScore: { min: 8, max: 16 }, // Grade level
  }
};

class ContentValidator {
  constructor() {
    this.results = {
      totalPacks: 0,
      totalQuestions: 0,
      errors: [],
      warnings: [],
      info: [],
      passed: false,
    };
  }

  async validate(sourceDir) {
    console.log('🔍 Starting content validation...');
    
    try {
      const files = await fs.readdir(sourceDir);
      const packFiles = files.filter(file => file.endsWith('.json'));
      
      this.results.totalPacks = packFiles.length;
      
      for (const file of packFiles) {
        const packPath = path.join(sourceDir, file);
        await this.validatePack(packPath);
      }
      
      await this.validateCollection();
      
      this.results.passed = this.results.errors.length === 0;
      this.printResults();
      
      return this.results.passed;
      
    } catch (error) {
      this.addError('SYSTEM', `Validation failed: ${error.message}`);
      this.printResults();
      return false;
    }
  }

  async validatePack(packPath) {
    const packName = path.basename(packPath, '.json');
    
    try {
      const content = await fs.readFile(packPath, 'utf8');
      const pack = JSON.parse(content);
      
      console.log(`  Validating pack: ${packName}`);
      
      // Basic structure validation
      this.validatePackStructure(packName, pack);
      
      // Content validation
      this.validatePackContent(packName, pack);
      
      // Question validation
      this.validateQuestions(packName, pack.questions || []);
      
      // Educational quality validation
      this.validateEducationalQuality(packName, pack);
      
      // Technical validation
      this.validateTechnical(packName, pack, content);
      
      this.results.totalQuestions += (pack.questions || []).length;
      
    } catch (error) {
      if (error.name === 'SyntaxError') {
        this.addError(packName, 'Invalid JSON format');
      } else {
        this.addError(packName, `Validation error: ${error.message}`);
      }
    }
  }

  validatePackStructure(packName, pack) {
    // Required fields
    for (const field of VALIDATION_RULES.pack.requiredFields) {
      if (!pack[field]) {
        this.addError(packName, `Missing required field: ${field}`);
      }
    }
    
    // Field validation
    if (pack.title && pack.title.length > VALIDATION_RULES.pack.maxTitleLength) {
      this.addError(packName, `Title too long: ${pack.title.length} > ${VALIDATION_RULES.pack.maxTitleLength}`);
    }
    
    if (pack.description && pack.description.length > VALIDATION_RULES.pack.maxDescriptionLength) {
      this.addError(packName, `Description too long: ${pack.description.length} > ${VALIDATION_RULES.pack.maxDescriptionLength}`);
    }
    
    if (pack.difficulty && !VALIDATION_RULES.pack.validDifficulties.includes(pack.difficulty)) {
      this.addError(packName, `Invalid difficulty: ${pack.difficulty}`);
    }
    
    // Questions array validation
    if (!Array.isArray(pack.questions)) {
      this.addError(packName, 'Questions must be an array');
    } else {
      const questionCount = pack.questions.length;
      if (questionCount < VALIDATION_RULES.pack.minQuestions) {
        this.addError(packName, `Too few questions: ${questionCount} < ${VALIDATION_RULES.pack.minQuestions}`);
      }
      if (questionCount > VALIDATION_RULES.pack.maxQuestions) {
        this.addError(packName, `Too many questions: ${questionCount} > ${VALIDATION_RULES.pack.maxQuestions}`);
      }
    }
  }

  validatePackContent(packName, pack) {
    // Check for forbidden words
    const allText = [pack.title, pack.description].join(' ').toLowerCase();
    for (const word of VALIDATION_RULES.content.forbiddenWords) {
      if (allText.includes(word.toLowerCase())) {
        this.addWarning(packName, `Contains placeholder text: ${word}`);
      }
    }
    
    // Validate metadata
    if (!pack.category) {
      this.addWarning(packName, 'Missing category field');
    }
    
    if (!pack.tags || !Array.isArray(pack.tags) || pack.tags.length === 0) {
      this.addWarning(packName, 'Missing or empty tags array');
    }
  }

  validateQuestions(packName, questions) {
    const questionIds = [];
    const questionTypes = new Set();
    
    questions.forEach((question, index) => {
      const questionRef = `${packName}[${index}]`;
      
      // Required fields
      for (const field of VALIDATION_RULES.question.requiredFields) {
        if (!question[field]) {
          this.addError(questionRef, `Missing required field: ${field}`);
        }
      }
      
      // Unique IDs
      if (question.id) {
        if (questionIds.includes(question.id)) {
          this.addError(questionRef, `Duplicate question ID: ${question.id}`);
        } else {
          questionIds.push(question.id);
        }
      }
      
      // Question type validation
      if (question.type) {
        if (!VALIDATION_RULES.question.validTypes.includes(question.type)) {
          this.addError(questionRef, `Invalid question type: ${question.type}`);
        } else {
          questionTypes.add(question.type);
        }
      }
      
      // Content validation
      this.validateQuestionContent(questionRef, question);
      
      // Type-specific validation
      if (question.type === 'multiple_choice') {
        this.validateMultipleChoice(questionRef, question);
      }
      
      // Educational validation
      this.validateQuestionEducational(questionRef, question);
    });
    
    // Diversity check
    if (questions.length > 3 && questionTypes.size === 1) {
      this.addWarning(packName, 'All questions are the same type - consider adding variety');
    }
  }

  validateQuestionContent(questionRef, question) {
    // Content length
    if (question.content && question.content.length > VALIDATION_RULES.question.maxContentLength) {
      this.addError(questionRef, `Content too long: ${question.content.length} > ${VALIDATION_RULES.question.maxContentLength}`);
    }
    
    if (question.explanation && question.explanation.length > VALIDATION_RULES.question.maxExplanationLength) {
      this.addError(questionRef, `Explanation too long: ${question.explanation.length} > ${VALIDATION_RULES.question.maxExplanationLength}`);
    }
    
    // Minimum content
    if (question.content) {
      const wordCount = this.countWords(question.content);
      if (wordCount < VALIDATION_RULES.content.minimumWordCount) {
        this.addWarning(questionRef, `Content seems short: ${wordCount} words`);
      }
    }
    
    // Forbidden words
    const questionText = [question.content, question.explanation].join(' ').toLowerCase();
    for (const word of VALIDATION_RULES.content.forbiddenWords) {
      if (questionText.includes(word.toLowerCase())) {
        this.addError(questionRef, `Contains placeholder text: ${word}`);
      }
    }
    
    // Image alt text
    if (question.content && question.content.includes('<img')) {
      if (!question.content.includes('alt=')) {
        this.addError(questionRef, 'Images must include alt text for accessibility');
      }
    }
  }

  validateMultipleChoice(questionRef, question) {
    if (!Array.isArray(question.options)) {
      this.addError(questionRef, 'Multiple choice questions must have options array');
      return;
    }
    
    const optionCount = question.options.length;
    if (optionCount < VALIDATION_RULES.question.minOptions) {
      this.addError(questionRef, `Too few options: ${optionCount} < ${VALIDATION_RULES.question.minOptions}`);
    }
    
    if (optionCount > VALIDATION_RULES.question.maxOptions) {
      this.addError(questionRef, `Too many options: ${optionCount} > ${VALIDATION_RULES.question.maxOptions}`);
    }
    
    // Option validation
    const optionIds = [];
    let correctOptionFound = false;
    
    question.options.forEach((option, optIndex) => {
      if (!option.id || !option.text) {
        this.addError(questionRef, `Option ${optIndex}: Missing id or text`);
      }
      
      if (option.id && optionIds.includes(option.id)) {
        this.addError(questionRef, `Duplicate option ID: ${option.id}`);
      } else if (option.id) {
        optionIds.push(option.id);
      }
      
      if (option.id === question.correct_answer) {
        correctOptionFound = true;
      }
      
      // Option text length
      if (option.text && option.text.length > 200) {
        this.addWarning(questionRef, `Option ${option.id} text is long: ${option.text.length} chars`);
      }
    });
    
    if (!correctOptionFound) {
      this.addError(questionRef, 'Correct answer must match one of the option IDs');
    }
  }

  validateQuestionEducational(questionRef, question) {
    // Explanation quality
    if (question.explanation) {
      const explanationWordCount = this.countWords(question.explanation);
      if (explanationWordCount < 5) {
        this.addWarning(questionRef, 'Explanation seems too brief');
      }
      
      // Check if explanation reveals the answer process
      if (!question.explanation.toLowerCase().includes('because') && 
          !question.explanation.toLowerCase().includes('since') &&
          !question.explanation.toLowerCase().includes('therefore')) {
        this.addWarning(questionRef, 'Explanation should explain why the answer is correct');
      }
    }
    
    // Difficulty consistency
    if (question.difficulty && question.content) {
      const wordCount = this.countWords(question.content);
      const readabilityScore = this.estimateReadabilityGrade(question.content);
      
      if (question.difficulty === 'beginner' && readabilityScore > 12) {
        this.addWarning(questionRef, 'Content may be too complex for beginner difficulty');
      }
      
      if (question.difficulty === 'advanced' && readabilityScore < 10) {
        this.addWarning(questionRef, 'Content may be too simple for advanced difficulty');
      }
    }
    
    // Topics validation
    if (!question.topics || !Array.isArray(question.topics) || question.topics.length === 0) {
      this.addWarning(questionRef, 'Missing topics array for content categorization');
    }
  }

  validateEducationalQuality(packName, pack) {
    if (!pack.questions || pack.questions.length === 0) return;
    
    // Check explanation coverage
    const questionsWithExplanations = pack.questions.filter(q => q.explanation && q.explanation.trim().length > 0);
    const explanationCoverage = questionsWithExplanations.length / pack.questions.length;
    
    if (explanationCoverage < 0.8) {
      this.addWarning(packName, `Low explanation coverage: ${Math.round(explanationCoverage * 100)}%`);
    }
    
    // Difficulty distribution
    const difficulties = pack.questions.map(q => q.difficulty).filter(Boolean);
    const difficultyDistribution = {};
    difficulties.forEach(d => difficultyDistribution[d] = (difficultyDistribution[d] || 0) + 1);
    
    if (Object.keys(difficultyDistribution).length === 1 && pack.questions.length > 5) {
      this.addWarning(packName, 'All questions have the same difficulty - consider adding variety');
    }
    
    // Topic coverage
    const allTopics = pack.questions.flatMap(q => q.topics || []);
    const uniqueTopics = new Set(allTopics);
    
    if (uniqueTopics.size < 2 && pack.questions.length > 3) {
      this.addWarning(packName, 'Limited topic coverage - consider adding variety');
    }
  }

  validateTechnical(packName, pack, jsonContent) {
    // File size check
    const sizeKB = Buffer.byteLength(jsonContent, 'utf8') / 1024;
    const sizeMB = sizeKB / 1024;
    
    if (sizeMB > VALIDATION_RULES.content.maxPackSizeMB) {
      this.addError(packName, `Pack too large: ${sizeMB.toFixed(2)}MB > ${VALIDATION_RULES.content.maxPackSizeMB}MB`);
    }
    
    // JSON structure validation
    try {
      JSON.stringify(pack);
    } catch (error) {
      this.addError(packName, 'Pack contains non-serializable data');
    }
    
    // Performance considerations
    if (pack.questions && pack.questions.length > 50) {
      this.addInfo(packName, `Large pack with ${pack.questions.length} questions - consider splitting`);
    }
  }

  async validateCollection() {
    console.log('  Validating collection consistency...');
    
    // Check for minimum pack count
    if (this.results.totalPacks < 1) {
      this.addError('COLLECTION', 'No content packs found');
    }
    
    // Check for reasonable question count
    if (this.results.totalQuestions < 10) {
      this.addWarning('COLLECTION', `Low total question count: ${this.results.totalQuestions}`);
    }
    
    console.log(`  Collection has ${this.results.totalPacks} packs with ${this.results.totalQuestions} total questions`);
  }

  countWords(text) {
    if (typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  estimateReadabilityGrade(text) {
    // Simplified Flesch-Kincaid grade level calculation
    if (typeof text !== 'string' || text.length === 0) return 0;
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = this.countWords(text);
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) return 0;
    
    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    return 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  }

  countSyllables(text) {
    // Simple syllable counting heuristic
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/e$/, '')
      .replace(/[aeiouy]{2,}/g, 'a')
      .match(/[aeiouy]/g)?.length || 1;
  }

  addError(context, message) {
    this.results.errors.push({ context, message, type: 'ERROR' });
  }

  addWarning(context, message) {
    this.results.warnings.push({ context, message, type: 'WARNING' });
  }

  addInfo(context, message) {
    this.results.info.push({ context, message, type: 'INFO' });
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    console.log(`   Total packs: ${this.results.totalPacks}`);
    console.log(`   Total questions: ${this.results.totalQuestions}`);
    console.log(`   Errors: ${this.results.errors.length}`);
    console.log(`   Warnings: ${this.results.warnings.length}`);
    console.log(`   Status: ${this.results.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(({ context, message }) => {
        console.log(`   [${context}] ${message}`);
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(({ context, message }) => {
        console.log(`   [${context}] ${message}`);
      });
    }
    
    if (this.results.info.length > 0) {
      console.log('\nℹ️  Info:');
      this.results.info.forEach(({ context, message }) => {
        console.log(`   [${context}] ${message}`);
      });
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const sourceDir = process.argv[2] || path.join(__dirname, '../content/source');
  
  const validator = new ContentValidator();
  validator.validate(sourceDir).then(passed => {
    process.exit(passed ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export { ContentValidator, VALIDATION_RULES };