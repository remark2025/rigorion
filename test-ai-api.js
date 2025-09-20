// Test script to verify AI API is working
const testAIAPI = async () => {
  const apiKey = 'feac253ff5e040b9af39ab5c7468f4a4';
  const baseURL = 'https://api.aimlapi.com/v1';
  
  const testEssay = `Social media has become very important in our lives. Many people use it every day to communicate with friends and family. However, some experts think that social media can be harmful to mental health, especially for teenagers. 

In my opinion, social media has both good and bad effects. On one hand, it helps people stay connected and share information quickly. On the other hand, it can cause problems like cyberbullying and addiction.

First, social media allows people to communicate across long distances. For example, I can talk to my relatives who live in different countries through platforms like Facebook and Instagram. This is very convenient and helps maintain relationships.

However, spending too much time on social media can be bad for mental health. Studies show that excessive use can lead to depression and anxiety. Also, people often compare themselves to others online, which can make them feel bad about themselves.

In conclusion, while social media has many benefits, we should use it carefully and not let it control our lives.`;

  console.log('🧪 Testing AI API...\n');
  console.log('📝 Sample Essay:');
  console.log(testEssay.substring(0, 200) + '...\n');

  try {
    const response = await fetch(baseURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-prover-v2',
        messages: [
          {
            role: 'user',
            content: `You are a SAT Writing expert. Analyze this student essay for grammar, style, and SAT Writing conventions. Return your analysis as JSON in this exact format:

{
  "corrections": [
    {
      "type": "grammar",
      "severity": "major",
      "startIndex": 0,
      "endIndex": 10,
      "originalText": "text to replace",
      "correctedText": "replacement text",
      "explanation": "Why this correction improves the writing",
      "grammarRule": "Specific SAT rule name",
      "confidence": 0.95
    }
  ],
  "overallFeedback": {
    "strengths": ["Clear thesis", "Good organization"],
    "weaknesses": ["Some run-on sentences", "Word choice could be more precise"],
    "suggestions": ["Break long sentences", "Use more specific vocabulary"],
    "score": 85
  },
  "satFocus": {
    "mainIssues": ["Subject-verb agreement", "Pronoun clarity"],
    "priorities": ["Fix major grammar errors first", "Then work on concision"]
  }
}

Student Essay:
"""
${testEssay}
"""

Provide specific, actionable feedback that helps the student improve their SAT Writing score.`
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        frequency_penalty: 0.5,
        max_tokens: 1536,
        top_k: 40
      })
    });

    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    const analysisText = result.choices[0].message.content;
    
    console.log('✅ Raw AI Response:');
    console.log('═'.repeat(50));
    console.log(analysisText);
    console.log('═'.repeat(50));

    try {
      const analysis = JSON.parse(analysisText);
      console.log('\n🎯 Parsed Analysis:');
      console.log('Corrections found:', analysis.corrections?.length || 0);
      console.log('Overall score:', analysis.overallFeedback?.score || 'N/A');
      console.log('Main issues:', analysis.satFocus?.mainIssues || []);
      
      if (analysis.corrections && analysis.corrections.length > 0) {
        console.log('\n📝 Sample Corrections:');
        analysis.corrections.slice(0, 3).forEach((correction, index) => {
          console.log(`${index + 1}. ${correction.originalText} → ${correction.correctedText}`);
          console.log(`   Rule: ${correction.grammarRule}`);
          console.log(`   Explanation: ${correction.explanation}\n`);
        });
      }
    } catch (parseError) {
      console.log('\n⚠️ Response not in JSON format. Raw response shown above.');
      console.log('Parse error:', parseError.message);
    }

  } catch (error) {
    console.error('💥 Network/Request Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.log('🔧 Possible fixes:');
      console.log('1. Check internet connection');
      console.log('2. Verify API endpoint URL');
      console.log('3. Check if API service is accessible');
    }
  }
};

// Run the test
console.log('🚀 Starting AI API Test...\n');
testAIAPI();