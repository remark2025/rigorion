import { PassageContent } from '../../types';

export const quantumComputingPassage: PassageContent = {
  id: 5,
  title: "The Quantum Computing Revolution",
  imageUrl: "/resources/passages/quantum-computing.jpg",
  text: `Quantum computing represents a paradigm shift in computational technology that could revolutionize fields from cryptography to drug discovery. Unlike classical computers that process information in binary bits (0s and 1s), quantum computers utilize quantum bits, or "qubits," which can exist in multiple states simultaneously through a phenomenon called superposition.

This quantum advantage becomes apparent when considering computational complexity. While a classical computer must check each possible solution sequentially, a quantum computer can explore multiple solutions simultaneously. Consequently, problems that would take classical computers thousands of years to solve could potentially be completed in minutes on a sufficiently powerful quantum machine.

However, significant challenges remain. Quantum states are extremely fragile, requiring temperatures near absolute zero and sophisticated error correction systems. Current quantum computers can only maintain coherence for microseconds before environmental interference destroys the quantum state. Furthermore, programming quantum algorithms requires an entirely different approach than traditional computing.

Despite these obstacles, progress has been remarkable. IBM, Google, and other tech giants have achieved quantum supremacy—demonstrating that quantum computers can solve specific problems faster than the world's most powerful supercomputers. Nevertheless, practical applications remain limited, and widespread adoption may still be decades away.

The implications for cybersecurity are particularly profound. Current encryption methods rely on the difficulty of factoring large numbers, a task that quantum computers could accomplish with relative ease. This reality has prompted governments and organizations worldwide to develop quantum-resistant encryption methods.

In the medical field, quantum computers could simulate molecular interactions with unprecedented accuracy, potentially accelerating drug discovery and leading to personalized treatments. Similarly, financial institutions are exploring quantum algorithms for portfolio optimization and risk analysis.

While quantum computing may not replace classical computers entirely, it will likely serve as a powerful complement for specialized applications. The question is not whether quantum computing will transform technology, but rather how quickly these transformations will occur.`,
  
  highlights: {
    evidence: [
      "quantum computers utilize quantum bits, or 'qubits,' which can exist in multiple states simultaneously",
      "problems that would take classical computers thousands of years to solve could potentially be completed in minutes",
      "IBM, Google, and other tech giants have achieved quantum supremacy",
      "Current encryption methods rely on the difficulty of factoring large numbers, a task that quantum computers could accomplish with relative ease"
    ],
    toneShifters: [
      "However",
      "Despite these obstacles",
      "Nevertheless",
      "While quantum computing may not replace classical computers entirely"
    ],
    transitions: [
      "Unlike classical computers",
      "Consequently",
      "Furthermore",
      "Similarly"
    ],
    mainIdeas: [
      "Quantum computing uses qubits that can exist in multiple states simultaneously",
      "Quantum computers face challenges with fragile quantum states and error correction",
      "Quantum supremacy has been achieved but practical applications remain limited",
      "Quantum computing will impact cybersecurity, medicine, and finance"
    ]
  },
  
  questions: [
    {
      id: "q1",
      text: "According to the passage, what is the primary advantage of quantum computing over classical computing?",
      options: [
        "Quantum computers are smaller and more efficient",
        "Quantum computers can explore multiple solutions simultaneously",
        "Quantum computers require less electricity to operate",
        "Quantum computers are easier to program"
      ],
      correct: 1,
      explanation: "The passage states that 'while a classical computer must check each possible solution sequentially, a quantum computer can explore multiple solutions simultaneously.'"
    },
    {
      id: "q2", 
      text: "The passage suggests that current quantum computers face which primary limitation?",
      options: [
        "They are too expensive to manufacture",
        "They lack sufficient processing power",
        "They can only maintain quantum coherence for microseconds",
        "They require too much physical space"
      ],
      correct: 2,
      explanation: "The passage explicitly states that 'Current quantum computers can only maintain coherence for microseconds before environmental interference destroys the quantum state.'"
    }
  ]
};