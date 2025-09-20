// Test free models that might work without verification
const testFreeModels = async () => {
  const apiKey = 'feac253ff5e040b9af39ab5c7468f4a4';
  const baseURL = 'https://api.aimlapi.com/v1';
  
  // List of potentially free models to test
  const modelsToTest = [
    'mistralai/mistral-7b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
    'microsoft/phi-3-mini-128k-instruct',
    'google/gemma-2-9b-it',
    'meta-llama/llama-3.2-3b-instruct',
    'huggingfaceh4/zephyr-7b-beta'
  ];
  
  console.log('🧪 Testing Free AI Models...\n');

  for (const model of modelsToTest) {
    console.log(`Testing: ${model}`);
    
    try {
      const response = await fetch(baseURL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: 'Fix this grammar error: "The students was happy." Return: CORRECTED: [fixed version]'
            }
          ],
          temperature: 0.3,
          max_tokens: 50
        })
      });

      if (response.ok) {
        const result = await response.json();
        const aiResponse = result.choices[0].message.content;
        console.log(`✅ SUCCESS with ${model}!`);
        console.log(`Response: ${aiResponse}`);
        console.log('─'.repeat(50));
        break; // Found a working model
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${response.status} - ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`💥 Network error: ${error.message}`);
    }
    
    console.log(''); // Empty line between tests
  }
};

testFreeModels();