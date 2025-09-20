// Test if real API is working after verification
const testRealAPI = async () => {
  const apiKey = 'feac253ff5e040b9af39ab5c7468f4a4';
  const baseURL = 'https://api.aimlapi.com/v1';
  
  console.log('🧪 Testing Real AI API (Post-Verification)...\n');

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
            content: 'Analyze this sentence for one grammar error: "The students was happy." Return only: ERROR: [specific error] CORRECTION: [fixed version]'
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    console.log('📡 API Response Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      const aiResponse = result.choices[0].message.content;
      console.log('✅ SUCCESS! Real AI Response:');
      console.log('═'.repeat(50));
      console.log(aiResponse);
      console.log('═'.repeat(50));
      console.log('\n🎉 Your API is working! The SAT Writing Demo will now use real AI.');
      console.log('💡 Refresh your browser and try the Writing Demo again.');
    } else {
      const error = await response.text();
      console.log('❌ Still getting error:', response.status);
      console.log('Error details:', error);
      
      if (response.status === 403) {
        console.log('\n🔧 Next steps:');
        console.log('1. Complete verification at: https://aimlapi.com/app/billing/verification');
        console.log('2. Check if verification is complete');
        console.log('3. Try a different model (some may be free)');
      }
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
};

testRealAPI();