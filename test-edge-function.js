// Quick test script to check what get-questions Edge Function currently returns

const SUPABASE_URL = 'https://zmsqscxqxlhhehzwbylv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendiemx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MTM2MDQsImV4cCI6MjAzNTQ4OTYwNH0.aYGUSDFVfP8G3NVdADqUnM1RHEeWHiAp9qFDm_zPNGw';

async function testGetQuestions() {
  try {
    console.log('🚀 Testing get-questions Edge Function...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-questions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Response data:', JSON.stringify(data, null, 2));
    
    if (data.questions) {
      console.log(`📝 Found ${data.questions.length} questions`);
      
      if (data.questions.length > 0) {
        const firstQuestion = data.questions[0];
        console.log('🔍 First question details:');
        console.log('  - ID:', firstQuestion.id);
        console.log('  - Content:', firstQuestion.content?.substring(0, 100) + '...');
        console.log('  - Has interactive solution:', !!firstQuestion.interactiveSolution);
        
        if (firstQuestion.interactiveSolution) {
          console.log('  - Interactive fields:', Object.keys(firstQuestion.interactiveSolution));
          console.log('  - Has renderPayload:', !!firstQuestion.interactiveSolution.renderPayload);
        }
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testGetQuestions();