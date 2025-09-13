import { Question } from "@/types/QuestionInterface";

export const generateSampleQuestions = (count: number = 98): Question[] => {
  const questions: Question[] = [];
  
  // Reading and Writing Questions (54 questions - 55% of total)
  const readingWritingCount = Math.ceil(count * 0.55);
  
  for (let i = 0; i < readingWritingCount; i++) {
    const isReading = i % 2 === 0;
    questions.push({
      id: `rw_${i + 1}`,
      number: i + 1,
      content: isReading 
        ? `According to the passage, which of the following best describes the author's main argument?`
        : `Which choice completes the text with the most logical and precise word or phrase?`,
      difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as "easy" | "medium" | "hard",
      chapter: isReading ? "Reading Comprehension" : "Writing and Language",
      module: "Reading and Writing",
      bookmarked: false,
      examNumber: 1,
      choices: [
        "The author emphasizes the importance of collaborative research.",
        "The text advocates for increased funding in scientific research.",
        "The passage suggests that technological advancement is inevitable.",
        "The writer argues for a more cautious approach to innovation."
      ],
      correctAnswer: "The author emphasizes the importance of collaborative research.",
      explanation: "The correct answer demonstrates the author's central thesis about collaboration in research.",
      solution: "This question tests reading comprehension and the ability to identify main ideas.",
      hint: "Look for repeated themes and the author's primary focus throughout the passage.",
      calculatorAllowed: false,
      passage: isReading ? `In recent years, scientific breakthroughs have increasingly resulted from collaborative efforts rather than individual discoveries. This shift represents a fundamental change in how research is conducted, with teams of specialists working together to solve complex problems. The benefits of this approach are evident in fields ranging from medicine to climate science, where interdisciplinary cooperation has led to significant advances.` : undefined
    });
  }
  
  // Math Questions (44 questions - 45% of total)
  const mathCount = count - readingWritingCount;
  
  for (let i = 0; i < mathCount; i++) {
    const questionNumber = readingWritingCount + i + 1;
    const isAlgebra = i % 2 === 0;
    
    questions.push({
      id: `math_${i + 1}`,
      number: questionNumber,
      content: isAlgebra 
        ? `If 3x + 7 = 22, what is the value of x?`
        : `A circle has a radius of 5 units. What is the area of the circle?`,
      difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as "easy" | "medium" | "hard",
      chapter: isAlgebra ? "Algebra" : "Geometry",
      module: "Math",
      bookmarked: false,
      examNumber: 1,
      choices: isAlgebra ? [
        "x = 5",
        "x = 15", 
        "x = 3",
        "x = 7"
      ] : [
        "25π square units",
        "10π square units",
        "5π square units", 
        "50π square units"
      ],
      correctAnswer: isAlgebra ? "x = 5" : "25π square units",
      explanation: isAlgebra 
        ? "Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5"
        : "Area of circle = πr² = π(5)² = 25π square units",
      solution: isAlgebra
        ? "This is a basic linear equation. Isolate the variable by performing inverse operations."
        : "Use the circle area formula A = πr² and substitute the given radius.",
      hint: isAlgebra 
        ? "Use inverse operations to isolate the variable x."
        : "Remember the formula for the area of a circle: A = πr²",
      calculatorAllowed: true
    });
  }
  
  return questions;
};

export const sampleSATQuestions: Question[] = generateSampleQuestions(98);