// Test alternative models that might be available without verification
const testAlternativeModels = async () => {
  const apiKey = 'feac253ff5e040b9af39ab5c7468f4a4';
  const baseURL = 'https://api.aimlapi.com/v1';
  
  // Alternative models to try
  const modelsToTest = [
    'gpt-3.5-turbo',
    'gpt-4',
    'claude-3-haiku',
    'claude-3-sonnet',
    'mistral/mistral-small',
    'meta-llama/llama-2-7b-chat',
    'deepseek/deepseek-chat'
  ];

  const testPrompt = `Analyze this sentence for grammar errors: "The students was happy about there test results." Return only: ERRORS FOUND: [list of errors]`;

  console.log('🧪 Testing Alternative Models...\n');

  for (const model of modelsToTest) {
    console.log(`Testing model: ${model}`);
    
    try {
      const response = await fetch(baseURL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: testPrompt }],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (response.ok) {
        const result = await response.json();
        const aiResponse = result.choices[0].message.content;
        console.log(`✅ ${model}: ${aiResponse.substring(0, 100)}...\n`);
        return model; // Return the first working model
      } else {
        const error = await response.text();
        console.log(`❌ ${model}: ${response.status} - ${JSON.parse(error).message}\n`);
      }
    } catch (error) {
      console.log(`💥 ${model}: ${error.message}\n`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('No working models found. Account verification may be required.');
  return null;
};

testAlternativeModels();