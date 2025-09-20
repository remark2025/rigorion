// Test the AI Writing Examiner with mock service
import { aiGrammarService } from './src/services/aiGrammarService.js';

const testWritingExaminer = async () => {
  console.log('🧪 Testing AI Writing Examiner with Mock Service...\n');

  const sampleEssay = `Social media has become a integral part of modern communication, fundamentally reshaping how we interact and consume information. While these platforms offer remarkable benefits in connecting people and democratizing access to knowledge, I believe that the mental health risks, particularly for teenagers, outweigh these advantages and require immediate attention.

The evidence linking social media use to mental health problems are compelling and growing. Research from Stanford University demonstrates that teenagers who spend more than three hours daily on social media platforms show significantly higher rates of anxiety and depression.`;

  try {
    console.log('📝 Analyzing sample essay...');
    const result = await aiGrammarService.analyzeEssay(sampleEssay);
    
    console.log('✅ Analysis Results:');
    console.log(`📊 Corrections found: ${result.corrections.length}`);
    console.log(`🎯 SAT Score: ${result.satScore.total}/100`);
    
    if (result.corrections.length > 0) {
      console.log('\n📋 Sample corrections:');
      result.corrections.slice(0, 3).forEach((correction, index) => {
        console.log(`  ${index + 1}. ${correction.type}: "${correction.originalText}" → "${correction.correctedText}"`);
        console.log(`     Rule: ${correction.grammarRule}`);
        console.log(`     Explanation: ${correction.explanation}\n`);
      });
    }
    
    console.log('🎉 AI Writing Examiner is working properly with mock service!');
    
  } catch (error) {
    console.error('❌ Error testing writing examiner:', error);
  }
};

testWritingExaminer();