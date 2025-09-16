// Check the raw database structure by looking at the get-questions Edge Function code
// to see what fields it expects and maps

console.log(`
Based on the working question structure and the get-questions Edge Function, here are the fields we need:

FRONTEND FIELDS (what get-questions returns):
- id (maps from public_id)
- number (maps from question_number) ⚠️ MISSING
- content ✅
- difficulty ✅
- chapter (maps from topic) ✅
- module (we set this based on subject) ✅
- bookmarked (always false for new questions) ✅
- examNumber (default 1) ✅
- choices ✅
- correctAnswer (maps from correct_answer) ✅
- solution (maps from solution_text) ✅
- explanation ✅
- hint ✅
- solutionSteps (from solution_steps table) ✅
- calculatorAllowed (maps from calculator_allowed) ✅
- interactiveSolution (from interactive_solutions table) ✅

DATABASE FIELDS WE NEED TO PROVIDE:
- public_id ✅
- pack_id ✅ (UUID from content_packs)
- question_number ⚠️ MISSING - this is the issue!
- content ✅
- question_type ✅
- subject ✅
- topic ✅
- subtopic ✅
- difficulty ✅
- choices ✅
- correct_answer ✅
- solution_text ✅
- explanation ✅
- hint ✅
- calculator_allowed ✅
- estimated_time ✅
- has_interactive ✅
- status ✅

THE MISSING FIELD: question_number
This should be coreQuestion.number (which exists in our data)
`);

// Let's also check what a working database question looks like by examining the get-questions transformation
const workingQuestionExample = {
  database_fields: {
    public_id: "READ-FICTION-001",
    pack_id: "some-uuid",
    question_number: 1, // ⚠️ THIS IS WHAT WE'RE MISSING
    content: "According to the passage...",
    question_type: "multiple_choice",
    subject: "reading", 
    topic: "Reading Comprehension",
    subtopic: null,
    difficulty: "easy",
    choices: [{"id": "A", "text": "Better vocabulary"}, {"id": "B", "text": "Better writing skills"}],
    correct_answer: "C",
    solution_text: "The passage states...",
    explanation: "Look for information...",
    hint: "Find the phrase...",
    calculator_allowed: false,
    estimated_time: 60,
    has_interactive: false,
    status: "published"
  },
  frontend_mapping: {
    id: "database.public_id",
    number: "database.question_number", // ⚠️ Maps to our missing field
    content: "database.content",
    // ... etc
  }
};

console.log("\\n🔧 The fix is to add question_number field mapping from coreQuestion.number");