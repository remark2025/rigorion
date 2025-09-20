// Test the Gemma model
const testGemmaModel = async () => {
  const apiKey = 'feac253ff5e040b9af39ab5c7468f4a4';
  const baseURL = 'https://api.aimlapi.com/v1';
  
  console.log('🧪 Testing Google Gemma Model...\n');

  try {
    const response = await fetch(baseURL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'google/gemma-3-4b-it',
        messages: [
          {
            role: 'user',
            content: 'Find grammar errors in this sentence: "The students was happy about there test results." List each error and correction.'
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    console.log('📡 API Response Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.choices[0].message.content;
      console.log('✅ SUCCESS! Gemma AI Response:');
      console.log('═'.repeat(50));
      console.log(aiResponse);
      console.log('═'.repeat(50));
      console.log('\n🎉 Gemma model is working! Your SAT Writing Demo now has real AI.');
      console.log('💡 The demo will now provide genuine AI grammar analysis.');
    } else {
      const error = await response.text();
      console.log('❌ Error with Gemma model:', response.status);
      console.log('Response:', error);
      
      // Try to suggest alternative models
      console.log('\n🔧 If Gemma doesn\'t work, try these models:');
      console.log('- microsoft/phi-3-mini-4k-instruct');
      console.log('- meta-llama/llama-3.2-1b-instruct');
      console.log('- mistralai/mistral-7b-instruct');
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
};

testGemmaModel();