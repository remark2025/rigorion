// Check the questions table schema to see all required fields

const response = await fetch("https://zmsqscxqxlhhehzwbylv.supabase.co/functions/v1/get-questions", {
  headers: {
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjIwNDksImV4cCI6MjA3MDgzODA0OX0.ns8hcVCVuE81-kepvptKwfQtU4fs6_2EaPOZ2whEOIQ",
    "content-type": "application/json"
  }
});

const data = await response.json();

if (data.questions && data.questions.length > 0) {
  console.log("✅ Current database questions structure:");
  const firstQuestion = data.questions[0];
  
  console.log("Database question fields:");
  Object.keys(firstQuestion).forEach(key => {
    const value = firstQuestion[key];
    const type = value === null ? 'null' : typeof value;
    console.log(`  ${key}: ${type} = ${JSON.stringify(value)?.substring(0, 50)}...`);
  });
  
  // Also try to get one via direct SQL to see the raw database structure
  console.log("\n🔍 Raw database fields we need to match...");
} else {
  console.log("❌ No questions found to analyze schema");
}