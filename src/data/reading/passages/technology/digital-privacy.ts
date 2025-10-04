import { PassageContent } from '../../types';

export const digitalPrivacyPassage: PassageContent = {
  id: 11,
  title: "Digital Privacy and Surveillance",
  text: `In the digital age, the balance between security and privacy has become increasingly complex. Every click, search, and digital interaction generates data that can be collected, analyzed, and stored indefinitely. Government agencies argue that surveillance programs are essential for national security and crime prevention.

However, privacy advocates contend that mass data collection violates fundamental rights. The European Union's General Data Protection Regulation (GDPR) represents one attempt to restore control to individuals over their personal information. Similarly, many tech companies have begun implementing stronger encryption and privacy features.

Nevertheless, the debate continues as new technologies emerge. Facial recognition systems, for instance, can identify individuals in public spaces with remarkable accuracy. While law enforcement praises these tools for solving crimes, critics worry about the creation of a surveillance state.

Furthermore, the commercialization of personal data has created a new economy where information is currency. Social media platforms and search engines collect vast amounts of user data to sell targeted advertising. This raises questions about whether users truly understand what they're agreeing to when they accept terms of service.

In conclusion, finding the right balance between privacy and security remains one of the defining challenges of our time. As technology advances, society must continually reevaluate the trade-offs between convenience, safety, and personal freedom.`,
  
  highlights: {
    evidence: [
      "Every click, search, and digital interaction generates data that can be collected, analyzed, and stored indefinitely",
      "The European Union's General Data Protection Regulation (GDPR) represents one attempt to restore control",
      "Facial recognition systems, for instance, can identify individuals in public spaces with remarkable accuracy"
    ],
    toneShifters: [
      "However",
      "Nevertheless", 
      "While",
      "Furthermore"
    ],
    transitions: [
      "Similarly",
      "for instance",
      "In conclusion"
    ],
    difficult: {
      "surveillance": "Close observation or monitoring of behavior, activities, or information",
      "indefinitely": "For an unlimited or unspecified period of time",
      "contend": "Assert something as a position in an argument",
      "commercialization": "The process of making something available for sale or profit"
    }
  },
  
  questions: [
    {
      id: 1,
      text: "What is the main conflict discussed in this passage?",
      type: "main-idea",
      options: ["Technology vs. tradition", "Security vs. privacy", "Government vs. corporations", "Europe vs. America"],
      correctAnswer: 1,
      hint: "Look at the opening sentence and the conclusion. The passage consistently discusses the tension between these two competing interests."
    },
    {
      id: 2,
      text: "The author's attitude toward surveillance technology can best be described as:",
      type: "tone",
      options: ["Strongly supportive", "Completely opposed", "Balanced and analytical", "Confused and uncertain"],
      correctAnswer: 2,
      hint: "Notice how the author presents arguments from both sides (government agencies vs. privacy advocates) without taking a strong position."
    },
    {
      id: 3,
      text: "Which example does the author use to illustrate privacy concerns?",
      type: "evidence",
      options: ["Social media advertising", "Facial recognition systems", "Encryption technology", "GDPR regulations"],
      correctAnswer: 1,
      hint: "Look for specific technologies mentioned that worry critics about creating a 'surveillance state.'"
    }
  ]
};