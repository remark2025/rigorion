// Check what's currently in the database

const response = await fetch("https://zmsqscxqxlhhehzwbylv.supabase.co/functions/v1/get-questions", {
  headers: {
    "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FzY3hxeGxoaGVoendieWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjIwNDksImV4cCI6MjA3MDgzODA0OX0.ns8hcVCVuE81-kepvptKwfQtU4fs6_2EaPOZ2whEOIQ",
    "content-type": "application/json"
  }
});

const data = await response.json();

console.log(`Found ${data.count} questions in database:`);
data.questions.forEach((q, i) => {
  console.log(`${i+1}. ${q.id} - ${q.content.substring(0, 60)}... [Interactive: ${!!q.interactiveSolution}]`);
});