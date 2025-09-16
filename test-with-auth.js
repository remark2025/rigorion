// Test script using the proper auth token from your frontend

const SUPABASE_URL = 'https://zmsqscxqxlhhehzwbylv.supabase.co';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjIwNDksImV4cCI6MjA3MDgzODA0OX0.ns8hcVCVuE81-kepvptKwfQtU4fs6_2EaPOZ2whEOIQ';

async function testGetQuestionsWithAuth() {
  try {
    console.log('🚀 Testing get-questions with proper auth...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-questions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success:', data.success);
    console.log('📝 Question count:', data.count);
    
    if (data.questions && data.questions.length > 0) {
      console.log('\n🔍 First question analysis:');
      const firstQ = data.questions[0];
      console.log('  - ID:', firstQ.id);
      console.log('  - Content preview:', firstQ.content?.substring(0, 50) + '...');
      console.log('  - Has interactiveSolution:', !!firstQ.interactiveSolution);
      console.log('  - Difficulty:', firstQ.difficulty);
      console.log('  - Chapter:', firstQ.chapter);
      
      if (firstQ.interactiveSolution) {
        console.log('\n🎮 Interactive Solution Details:');
        console.log('  - hasInteractiveGraph:', firstQ.interactiveSolution.hasInteractiveGraph);
        console.log('  - Has graphConfig:', !!firstQ.interactiveSolution.graphConfig);
        console.log('  - Has parameters:', !!firstQ.interactiveSolution.parameters);
        console.log('  - Has renderPayload:', !!firstQ.interactiveSolution.renderPayload);
        console.log('  - Solution steps count:', firstQ.interactiveSolution.solutionSteps?.length || 0);
        
        if (firstQ.interactiveSolution.renderPayload) {
          console.log('\n📦 RenderPayload content:', Object.keys(firstQ.interactiveSolution.renderPayload));
        }
      } else {
        console.log('\n❌ No interactive solution found');
      }
    } else {
      console.log('❌ No questions returned');
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testGetQuestionsWithAuth();