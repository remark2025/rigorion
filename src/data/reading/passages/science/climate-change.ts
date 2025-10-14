import { PassageContent } from '../../types';

export const climateChangePassage: PassageContent = {
  id: 1,
  title: "Climate Change and Global Action",
  imageUrl: "/resources/passages/climate-change.jpg",
  text: `Climate change represents one of the most pressing challenges of our time. According to NASA, global temperatures have risen by 1.1°C since the late 19th century. However, the impact varies significantly across different regions of the world.

First, we must understand that greenhouse gases trap heat in the atmosphere. This phenomenon, known as the greenhouse effect, is natural and necessary for life. Nevertheless, human activities have intensified this process dramatically. For instance, carbon dioxide levels have increased by 50% since pre-industrial times.

Furthermore, the consequences extend beyond just temperature increases. Scientists have documented rising sea levels, more frequent extreme weather events, and disruptions to ecosystems worldwide. In fact, the past decade has seen record-breaking temperatures globally.

On the other hand, there is hope. Renewable energy technologies have become increasingly affordable and efficient. Moreover, countries around the world are committing to ambitious climate goals. Although challenges remain, collective action can still make a significant difference.

In conclusion, addressing climate change requires both immediate action and long-term commitment. The evidence is clear, and the time to act is now.`,
  
  highlights: {
    evidence: [
      "According to NASA, global temperatures have risen by 1.1°C since the late 19th century",
      "carbon dioxide levels have increased by 50% since pre-industrial times",
      "Scientists have documented rising sea levels, more frequent extreme weather events, and disruptions to ecosystems worldwide",
      "the past decade has seen record-breaking temperatures globally"
    ],
    toneShifters: [
      "However",
      "Nevertheless",
      "On the other hand",
      "Although"
    ],
    transitions: [
      "First",
      "For instance",
      "Furthermore",
      "In fact",
      "Moreover",
      "In conclusion"
    ],
    difficult: {
      "phenomenon": "An observable event or fact, especially one that is remarkable",
      "greenhouse effect": "The trapping of heat in Earth's atmosphere by certain gases",
      "intensified": "Made or become more intense or stronger",
      "ecosystems": "Communities of living organisms interacting with their environment"
    }
  },
  
  questions: [
    {
      id: 1,
      text: "What is the main purpose of this passage?",
      type: "purpose",
      options: ["To explain the greenhouse effect", "To present climate change as serious but addressable", "To criticize countries", "To provide temperature history"],
      correctAnswer: 1,
      hint: "Look at the introduction and conclusion. The author balances urgency with hope, suggesting action is both needed and possible."
    },
    {
      id: 2,
      text: "The author's tone can best be described as:",
      type: "tone",
      options: ["Alarmist and panicked", "Optimistic but cautious", "Neutral and detached", "Critical and angry"],
      correctAnswer: 1,
      hint: "Notice words like 'hope,' 'can still make a difference' balanced with 'pressing challenges.' This indicates measured optimism."
    },
    {
      id: 3,
      text: "What evidence supports the climate change claim?",
      type: "evidence",
      options: ["Only rising sea levels", "NASA temperature data and CO2 levels", "Political commitments", "Renewable energy"],
      correctAnswer: 1,
      hint: "Look for specific facts and data. The passage cites NASA's temperature measurements and CO2 percentage increases."
    }
  ]
};