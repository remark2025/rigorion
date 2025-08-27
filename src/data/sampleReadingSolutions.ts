import { ReadingSolution } from "@/types/ReadingInterface";

export const sampleReadingPassage = `Climate change represents one of the most pressing challenges of our time, fundamentally altering weather patterns and ecosystem dynamics across the globe. Scientists have reached a consensus that anthropogenic factors—primarily the emission of greenhouse gases from industrial activities—are the predominant drivers of current warming trends.

The ramifications of this phenomenon are far-reaching and multifaceted. Rising sea levels threaten coastal communities, while increasingly erratic precipitation patterns disrupt agricultural systems worldwide. Moreover, the thermal expansion of ocean waters, coupled with glacial melting, exacerbates flooding risks in low-lying areas.

However, the situation is not entirely without hope. Innovative technologies, such as renewable energy systems and carbon capture mechanisms, offer potential pathways to mitigation. Furthermore, international cooperation through agreements like the Paris Climate Accord demonstrates a collective commitment to addressing this global crisis.

Nevertheless, skeptics argue that the economic costs of transitioning to sustainable practices may outweigh the benefits, particularly for developing nations already struggling with poverty and infrastructure deficits. This perspective, while understandable, fails to account for the long-term economic devastation that unchecked climate change would inevitably bring.

In conclusion, while the challenge of climate change is undeniably complex and daunting, the convergence of scientific understanding, technological innovation, and political will suggests that meaningful progress is not only possible but essential for the future of humanity.`;

export const sampleReadingSolution: ReadingSolution = {
  passageId: "READING-CLIMATE-001",
  
  // Pattern Recognition View
  patternRecognition: {
    keyPhrases: [
      {
        text: "most pressing challenges of our time",
        start: 42,
        end: 76,
        type: "key_phrase",
        explanation: "Establishes the urgency and importance of the topic",
        importance: "high"
      },
      {
        text: "Scientists have reached a consensus",
        start: 157,
        end: 191,
        type: "evidence",
        explanation: "Appeals to scientific authority to support the argument",
        importance: "high"
      },
      {
        text: "anthropogenic factors",
        start: 197,
        end: 218,
        type: "key_vocabulary",
        explanation: "Technical term meaning 'caused by human activity'",
        importance: "medium"
      },
      {
        text: "However",
        start: 592,
        end: 599,
        type: "tone_shifter",
        explanation: "Signals a contrast or shift in perspective from negative to positive",
        importance: "high"
      },
      {
        text: "Rising sea levels threaten coastal communities",
        start: 373,
        end: 419,
        type: "evidence",
        explanation: "Specific example of climate change impacts",
        importance: "medium"
      },
      {
        text: "renewable energy systems and carbon capture mechanisms",
        start: 663,
        end: 717,
        type: "evidence",
        explanation: "Examples of technological solutions to climate change",
        importance: "medium"
      },
      {
        text: "Nevertheless",
        start: 887,
        end: 899,
        type: "tone_shifter",
        explanation: "Introduces counterargument or opposing viewpoint",
        importance: "high"
      },
      {
        text: "skeptics argue",
        start: 901,
        end: 915,
        type: "key_phrase",
        explanation: "Introduces opposing perspective to maintain balanced argument",
        importance: "medium"
      },
      {
        text: "fails to account for",
        start: 1130,
        end: 1150,
        type: "tone_shifter",
        explanation: "Dismisses the counterargument by pointing out its limitations",
        importance: "medium"
      },
      {
        text: "convergence of scientific understanding, technological innovation, and political will",
        start: 1377,
        end: 1459,
        type: "key_phrase",
        explanation: "Summarizes the three main factors that make progress possible",
        importance: "high"
      }
    ],
    colorScheme: {
      key_phrase: "#3B82F6",
      evidence: "#10B981", 
      tone_shifter: "#F59E0B",
      key_vocabulary: "#8B5CF6"
    },
    legend: [
      {
        type: "key_phrase",
        label: "Key Phrases",
        description: "Main arguments and central themes",
        color: "#3B82F6"
      },
      {
        type: "evidence", 
        label: "Evidence",
        description: "Facts, examples, and supporting information",
        color: "#10B981"
      },
      {
        type: "tone_shifter",
        label: "Tone Shifters", 
        description: "Words that change argument direction",
        color: "#F59E0B"
      },
      {
        type: "key_vocabulary",
        label: "Key Vocabulary",
        description: "Important terms for comprehension",
        color: "#8B5CF6"
      }
    ]
  },

  // Simplifier View
  simplifier: {
    wordSimplifications: [
      {
        original: "anthropogenic",
        synonym: "human-caused",
        explanation: "Relating to or resulting from the influence of human beings on nature",
        start: 197,
        end: 210
      },
      {
        original: "predominant",
        synonym: "main", 
        explanation: "Having greater power, influence, or importance than others",
        start: 278,
        end: 289
      },
      {
        original: "ramifications",
        synonym: "consequences",
        explanation: "Complex or unwelcome consequences of an action or event",
        start: 321,
        end: 334
      },
      {
        original: "multifaceted",
        synonym: "many-sided",
        explanation: "Having many different aspects or features",
        start: 368,
        end: 380
      },
      {
        original: "erratic",
        synonym: "unpredictable",
        explanation: "Not regular in pattern or behavior; unpredictable",
        start: 450,
        end: 457
      },
      {
        original: "exacerbates",
        synonym: "worsens",
        explanation: "Makes (a problem or negative situation) worse",
        start: 567,
        end: 578
      },
      {
        original: "mitigation",
        synonym: "reduction",
        explanation: "The action of reducing the severity or seriousness of something",
        start: 747,
        end: 757
      },
      {
        original: "infrastructure deficits", 
        synonym: "lacking basic facilities",
        explanation: "Shortage of fundamental facilities and systems serving a country or area",
        start: 1056,
        end: 1079
      },
      {
        original: "convergence",
        synonym: "coming together",
        explanation: "The process of coming together from different directions to meet at a point",
        start: 1377,
        end: 1388
      }
    ],
    sentenceExplanations: [
      {
        sentence: "Climate change represents one of the most pressing challenges of our time, fundamentally altering weather patterns and ecosystem dynamics across the globe.",
        explanation: "This opening sentence establishes climate change as an urgent, global problem that is changing how weather works and affecting all living systems on Earth.",
        start: 0,
        end: 155,
        complexity: "key"
      },
      {
        sentence: "The thermal expansion of ocean waters, coupled with glacial melting, exacerbates flooding risks in low-lying areas.",
        explanation: "This sentence explains that as ocean water gets warmer, it expands (takes up more space), and when combined with ice melting, this makes flooding worse in areas close to sea level.",
        start: 499,
        end: 615,
        complexity: "difficult"
      },
      {
        sentence: "This perspective, while understandable, fails to account for the long-term economic devastation that unchecked climate change would inevitably bring.",
        explanation: "The author acknowledges that economic concerns about fighting climate change make sense, but argues that not acting would cause much worse economic damage in the future.",
        start: 1081,
        end: 1227,
        complexity: "difficult"
      }
    ],
    readingLevel: {
      original: 12,
      simplified: 9
    }
  },

  // Idea Tracer View  
  ideaTracer: {
    overallThesis: "Climate change is a serious global challenge caused primarily by human activities, but through the combination of technology, international cooperation, and political commitment, meaningful progress is possible despite economic concerns.",
    paragraphIdeas: [
      {
        paragraphIndex: 0,
        mainIdea: "Climate change is a major global problem caused primarily by human industrial activities.",
        supportingPoints: [
          "Scientists agree that human activities are the main cause",
          "Weather patterns and ecosystems are being fundamentally changed",
          "Greenhouse gases from industry are the primary driver"
        ],
        logicalFlow: "Establishes the problem and its cause through scientific consensus",
        connectionToNext: "Sets up the discussion of specific impacts that will be detailed in the next paragraph"
      },
      {
        paragraphIndex: 1, 
        mainIdea: "Climate change has wide-ranging negative impacts on both natural and human systems.",
        supportingPoints: [
          "Rising sea levels threaten coastal areas",
          "Unpredictable weather patterns hurt agriculture", 
          "Ocean expansion and ice melting increase flood risks"
        ],
        logicalFlow: "Provides specific examples of the impacts mentioned in paragraph 1",
        connectionToPrevious: "Expands on the 'altering weather patterns and ecosystem dynamics' mentioned earlier",
        connectionToNext: "After establishing the problems, introduces potential solutions"
      },
      {
        paragraphIndex: 2,
        mainIdea: "There are reasons for hope through technology and international cooperation.",
        supportingPoints: [
          "Renewable energy and carbon capture offer solutions",
          "International agreements like Paris Climate Accord show commitment",
          "Innovation provides pathways to reduce the problem"
        ],
        logicalFlow: "Shifts from problems to solutions using 'However' as transition",
        connectionToPrevious: "Contrasts with the negative impacts by showing positive developments",
        connectionToNext: "Sets up the counterargument that will be addressed"
      },
      {
        paragraphIndex: 3,
        mainIdea: "Economic concerns about climate action are understandable but shortsighted.",
        supportingPoints: [
          "Critics worry about costs of sustainable transitions",
          "Developing nations face particular economic challenges", 
          "This view doesn't consider long-term economic damage from inaction"
        ],
        logicalFlow: "Presents counterargument fairly, then refutes it with stronger logic",
        connectionToPrevious: "Acknowledges potential obstacles to the solutions mentioned earlier",
        connectionToNext: "Leads to final conclusion that weighs all perspectives"
      },
      {
        paragraphIndex: 4,
        mainIdea: "Despite the complexity of climate change, progress is both possible and necessary.",
        supportingPoints: [
          "The challenge is complex but not insurmountable",
          "Science, technology, and politics are aligning", 
          "Action is essential for humanity's future"
        ],
        logicalFlow: "Synthesizes all previous points into an optimistic but realistic conclusion",
        connectionToPrevious: "Builds on the refutation of economic concerns to argue for action",
        conclusion: "Ends with hope tempered by urgency"
      }
    ],
    logicalStructure: "problem-solution",
    keyTransitions: [
      "However (introduces solutions after problems)",
      "Moreover (adds another impact)",
      "Furthermore (adds to international cooperation)",
      "Nevertheless (introduces counterargument)", 
      "In conclusion (final synthesis)"
    ],
    mainConclusion: "Climate change is a complex challenge that requires immediate action, but the alignment of scientific knowledge, technological solutions, and international cooperation makes meaningful progress achievable and essential.",
    rewrittenVersion: `Climate change is one of today's biggest problems. It's changing weather around the world and affecting all living things. Scientists agree that humans are the main cause, especially through pollution from factories and industry.

This problem affects many areas of life. Ocean levels are rising and threatening people who live near coasts. Weather is becoming more unpredictable, making it harder for farmers to grow food. As ocean water gets warmer, it expands, and combined with melting ice, this creates more flooding in low areas.

But there is hope. New technology like solar and wind power can help reduce pollution. Scientists are also working on ways to capture carbon from the air. Countries around the world are working together through agreements like the Paris Climate Accord to solve this problem.

Some people worry that fighting climate change costs too much money, especially for poor countries that are still developing. While this concern makes sense, these critics don't think about how much more expensive it will be if we don't act now. Climate change will cause much worse economic problems in the future.

Even though climate change is a complicated and scary problem, we have reasons to be hopeful. Scientists understand what's happening, we have new technologies to help, and world leaders are starting to work together. Taking action is not just possible—it's absolutely necessary for the future of humanity.`
  }
};

export const getReadingSolution = (passageId: string): ReadingSolution | undefined => {
  // In a real app, this would fetch from a database
  if (passageId === "READING-CLIMATE-001") {
    return sampleReadingSolution;
  }
  return undefined;
};