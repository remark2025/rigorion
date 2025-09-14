// Add this to browser console to debug the question transformation
console.log("Current question data:", window.currentQuestion || "No current question found");

// Check if QuestionsContext has the question data
const questionsContext = window.React?.useContext || null;
if (questionsContext) {
    console.log("Questions context available");
} else {
    console.log("Questions context not available - check React DevTools");
}

// Check the raw question data structure
const questionsData = localStorage.getItem('questions') || sessionStorage.getItem('questions');
if (questionsData) {
    try {
        const parsed = JSON.parse(questionsData);
        console.log("Stored questions data:", parsed);
    } catch (e) {
        console.log("No valid questions data in storage");
    }
}