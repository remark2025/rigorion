import { useState, useEffect } from 'react';

interface PracticeSessionProps {
  objectiveType: "questions" | "time";
  objectiveValue: number;
  questions: any[]; // Replace with your question type
}

const PracticeSession = ({ objectiveType, objectiveValue, questions }: PracticeSessionProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(objectiveType === "time" ? objectiveValue : 0); // Time in seconds

  useEffect(() => {
    if (objectiveType === "time" && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [objectiveType, timeLeft]);

  useEffect(() => {
    if (objectiveType === "time" && timeLeft === 0) {
      // Handle time's up scenario (e.g., show results)
      console.log("Time's up!");
    }
  }, [objectiveType, timeLeft]);

  const goToNextQuestion = () => {
    if (objectiveType === "questions") {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Handle end of questions (e.g., show results)
        console.log("End of questions!");
      }
    } else if (objectiveType === "time") {
      // Cycle to the next question, resetting the timer for each question
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
      setTimeLeft(objectiveValue / questions.length); //reset time for each question
    }
  };

  return (
    <div>
      {/* Display current question */}
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{questions[currentQuestionIndex]?.text}</p>

      {objectiveType === "time" && <p>Time left: {timeLeft} seconds</p>}

      <button onClick={goToNextQuestion}>Next Question</button>
    </div>
  );
};

export default PracticeSession;
