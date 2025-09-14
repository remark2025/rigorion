// Quick test script for the simple-progress function
// Run this in browser console on your app to test

const testUserId = 'c5ef07d2-1f0b-41c8-aa69-09f62b94de0c'; // Your test user ID from interactions

fetch(`https://zmsqscxqxlhhehzwbylv.supabase.co/functions/v1/simple-progress?userId=${testUserId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || 'your_token_here'}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('🎯 Progress Function Response:', data);
  
  if (data.success && data.data) {
    console.log('✅ Key metrics:');
    console.log(`- Total interactions: ${data.data.totalInteractions}`);
    console.log(`- Correct answers: ${data.data.correctAnswers}`);
    console.log(`- Average score: ${data.data.averageScore}%`);
    console.log(`- Performance graph days: ${data.data.performanceGraph?.length}`);
    console.log(`- Skill analytics count: ${data.data.skillAnalytics?.length}`);
  }
})
.catch(error => {
  console.error('❌ Error testing progress function:', error);
});