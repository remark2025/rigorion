import { PassageContent } from '../../types';

export const artificialIntelligencePassage: PassageContent = {
  id: 8,
  title: "Artificial Intelligence: Promise and Peril",
  imageUrl: "/resources/passages/ai-technology.jpg",
  text: `Artificial intelligence has evolved from science fiction fantasy to practical reality, transforming industries and reshaping societal expectations about technology's role in daily life. Machine learning algorithms now influence everything from medical diagnoses to financial decisions, yet this rapid advancement has sparked intense debate about AI's long-term implications for humanity.

Proponents argue that AI's benefits far outweigh potential risks. In healthcare, AI systems can analyze medical images with superhuman accuracy, detecting cancers that human radiologists might miss. Similarly, AI-powered drug discovery platforms have accelerated the development of life-saving medications by predicting molecular interactions. These applications suggest that AI could democratize access to high-quality healthcare worldwide.

Moreover, AI's problem-solving capabilities extend beyond healthcare. Climate scientists use machine learning to model complex environmental systems, while engineers employ AI to optimize renewable energy grids. In education, personalized learning platforms adapt to individual student needs, potentially revolutionizing how we approach teaching and learning.

However, critics raise legitimate concerns about AI's darker implications. The automation of jobs could displace millions of workers, exacerbating economic inequality. Furthermore, AI systems can perpetuate or amplify existing biases present in their training data, leading to discriminatory outcomes in hiring, lending, and criminal justice applications.

Privacy concerns add another layer of complexity. AI systems require vast amounts of data to function effectively, raising questions about surveillance and personal autonomy. Additionally, the concentration of AI development among a few powerful tech companies could lead to unprecedented levels of corporate influence over society.

Perhaps most troubling is the potential for AI to be weaponized. Autonomous weapons systems represent a profound shift in warfare, while sophisticated deepfake technology threatens to undermine our ability to distinguish truth from falsehood in an era already plagued by misinformation.

The challenge lies not in halting AI development—which would be both impossible and undesirable—but in ensuring that its benefits are broadly shared while minimizing potential harms. This requires thoughtful regulation, ethical guidelines, and international cooperation to establish norms for responsible AI development.

Ultimately, artificial intelligence is neither inherently good nor evil; it is a powerful tool whose impact depends entirely on how we choose to develop and deploy it. The decisions we make today about AI governance will determine whether this technology serves as humanity's greatest achievement or its gravest mistake.`,
  
  highlights: {
    evidence: [
      "AI systems can analyze medical images with superhuman accuracy, detecting cancers that human radiologists might miss",
      "AI-powered drug discovery platforms have accelerated the development of life-saving medications",
      "The automation of jobs could displace millions of workers, exacerbating economic inequality",
      "AI systems can perpetuate or amplify existing biases present in their training data"
    ],
    toneShifters: [
      "However",
      "Furthermore", 
      "Additionally",
      "Perhaps most troubling",
      "Ultimately"
    ],
    transitions: [
      "Moreover",
      "Similarly",
      "However",
      "Furthermore",
      "Additionally"
    ],
    mainIdeas: [
      "AI has evolved from fiction to reality and now influences many aspects of daily life",
      "AI offers significant benefits in healthcare, climate science, and education",
      "Critics worry about job displacement, bias, privacy, and weaponization",
      "The key challenge is ensuring AI's benefits while minimizing potential harms"
    ]
  },
  
  questions: [
    {
      id: "q1",
      text: "According to the passage, what is the primary challenge regarding AI development?",
      options: [
        "Stopping AI development before it becomes dangerous",
        "Ensuring benefits are shared while minimizing harms",
        "Preventing corporate control of AI technology",
        "Eliminating bias from AI training data"
      ],
      correct: 1,
      explanation: "The passage states that 'The challenge lies not in halting AI development—which would be both impossible and undesirable—but in ensuring that its benefits are broadly shared while minimizing potential harms.'"
    },
    {
      id: "q2",
      text: "The author's overall stance toward artificial intelligence can best be described as:",
      options: [
        "Completely optimistic about AI's potential",
        "Strongly opposed to AI development",
        "Cautiously neutral, acknowledging both benefits and risks",
        "Primarily concerned with AI's economic impacts"
      ],
      correct: 2,
      explanation: "The passage presents both significant benefits and serious concerns about AI, concluding that 'artificial intelligence is neither inherently good nor evil; it is a powerful tool whose impact depends entirely on how we choose to develop and deploy it.'"
    }
  ]
};