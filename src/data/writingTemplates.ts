import { WritingTemplate, WritingPrompt } from "@/types/WritingInterface";

export const writingTemplates: WritingTemplate[] = [
  // Template 1: Five-Paragraph Argumentative Essay
  {
    id: "argumentative-5-paragraph",
    name: "Five-Paragraph Argumentative Essay",
    category: "argumentative",
    description: "Classic structure for presenting and defending a clear position with evidence and reasoning.",
    difficulty: "intermediate",
    estimatedLength: "350-450 words",
    timeLimit: 25,
    sections: [
      {
        id: "introduction",
        name: "Introduction",
        description: "Hook the reader and present your thesis statement",
        fixedSentences: [
          "In today's society, the question of [TOPIC] has become increasingly important.",
          "Many people believe that [OPPOSING VIEW], but this perspective overlooks crucial considerations.",
          "After careful analysis, it becomes clear that [YOUR POSITION] because of [MAIN REASONS]."
        ],
        customSentences: 2,
        guidelines: [
          "Start with a hook that grabs attention",
          "Provide brief background on the topic", 
          "End with a clear thesis statement",
          "Keep introduction to 3-4 sentences"
        ],
        examples: [
          "In today's society, the question of whether students should have longer school days has become increasingly important.",
          "Many people believe that extending school hours would improve academic performance, but this perspective overlooks crucial considerations about student well-being.",
          "After careful analysis, it becomes clear that longer school days would be detrimental to students because they would increase stress, reduce time for extracurricular activities, and lead to diminished learning quality."
        ]
      },
      {
        id: "body-paragraph-1",
        name: "Body Paragraph 1",
        description: "Present your strongest argument with evidence",
        fixedSentences: [
          "First and most importantly, [MAIN POINT 1] creates significant problems.",
          "Evidence clearly demonstrates that [SUPPORTING EVIDENCE].",
          "This example illustrates how [EXPLANATION OF EVIDENCE].",
          "Therefore, it is evident that [CONCLUSION FROM EVIDENCE]."
        ],
        customSentences: 3,
        guidelines: [
          "Start with your strongest argument",
          "Provide specific evidence or examples",
          "Explain how the evidence supports your point",
          "Connect back to your thesis"
        ],
        examples: [
          "First and most importantly, longer school days would create significant problems by increasing student stress levels.",
          "Evidence clearly demonstrates that students already report high levels of academic pressure and anxiety.",
          "This example illustrates how adding more hours to an already demanding schedule would push many students beyond their emotional limits."
        ]
      },
      {
        id: "body-paragraph-2", 
        name: "Body Paragraph 2",
        description: "Present your second argument with evidence",
        fixedSentences: [
          "Furthermore, [MAIN POINT 2] would have serious consequences.",
          "Consider the fact that [SUPPORTING EVIDENCE].",
          "This situation demonstrates that [EXPLANATION].",
          "As a result, [CONSEQUENCE OR IMPACT]."
        ],
        customSentences: 3,
        guidelines: [
          "Use transition words to connect to previous paragraph",
          "Present a different but related argument",
          "Use varied sentence structures",
          "Maintain focus on your thesis"
        ],
        examples: [
          "Furthermore, longer school days would have serious consequences by reducing time for essential extracurricular activities.",
          "Consider the fact that sports, arts, and volunteer work are crucial for developing well-rounded individuals.",
          "This situation demonstrates that students need time outside of academics to explore their interests and develop social skills."
        ]
      },
      {
        id: "body-paragraph-3",
        name: "Body Paragraph 3", 
        description: "Address counterarguments and refute them",
        fixedSentences: [
          "Some critics argue that [OPPOSING VIEW], and this concern deserves consideration.",
          "However, this argument fails to account for [REFUTATION POINT].",
          "In reality, [COUNTER TO OPPOSING VIEW].",
          "Thus, while [OPPOSING VIEW] may seem reasonable, [YOUR POSITION] remains the stronger approach."
        ],
        customSentences: 2,
        guidelines: [
          "Acknowledge the opposing viewpoint fairly",
          "Show understanding of why others might disagree", 
          "Present evidence that counters the opposition",
          "Reinforce why your position is superior"
        ],
        examples: [
          "Some critics argue that longer school days would improve academic achievement, and this concern deserves consideration.",
          "However, this argument fails to account for the law of diminishing returns in learning.",
          "In reality, exhausted and overwhelmed students perform worse academically, not better."
        ]
      },
      {
        id: "conclusion",
        name: "Conclusion",
        description: "Summarize your argument and call for action",
        fixedSentences: [
          "In conclusion, the evidence clearly supports the position that [RESTATE THESIS].",
          "The arguments presented demonstrate that [SUMMARY OF MAIN POINTS].",
          "Moving forward, it is essential that [CALL TO ACTION OR IMPLICATIONS]."
        ],
        customSentences: 1,
        guidelines: [
          "Restate your thesis in different words",
          "Briefly summarize your main arguments",
          "End with implications or call to action",
          "Do not introduce new information"
        ],
        examples: [
          "In conclusion, the evidence clearly supports the position that longer school days would harm rather than help students.",
          "The arguments presented demonstrate that increased stress, reduced extracurricular time, and diminished learning quality outweigh any potential academic benefits.",
          "Moving forward, it is essential that educators focus on improving teaching quality rather than simply increasing quantity of instruction time."
        ]
      }
    ],
    transitionPhrases: {
      sequence: ["First", "Second", "Third", "Next", "Finally"],
      addition: ["Furthermore", "Moreover", "Additionally", "In addition", "Also"],
      contrast: ["However", "Nevertheless", "On the other hand", "In contrast", "Despite this"],
      cause_effect: ["Therefore", "As a result", "Consequently", "Thus", "Because of this"],
      emphasis: ["Indeed", "Clearly", "Obviously", "Undoubtedly", "Certainly"],
      conclusion: ["In conclusion", "To summarize", "Overall", "In summary", "Ultimately"]
    },
    scoringCriteria: {
      structure: [
        "Clear introduction with thesis statement",
        "Well-organized body paragraphs with topic sentences",
        "Logical flow between paragraphs", 
        "Strong conclusion that reinforces main points"
      ],
      coherence: [
        "Effective use of transition words and phrases",
        "Ideas connect logically within and between paragraphs",
        "Consistent point of view throughout",
        "Clear relationships between evidence and claims"
      ],
      development: [
        "Sufficient evidence to support each main point",
        "Specific examples and details",
        "Analysis explains how evidence supports the argument",
        "Addresses counterarguments effectively"
      ],
      language: [
        "Varied sentence structure and length",
        "Appropriate vocabulary for academic writing",
        "Clear and precise word choice",
        "Minimal grammatical and spelling errors"
      ]
    }
  },

  // Template 2: Analytical Essay
  {
    id: "analytical-literary",
    name: "Literary Analysis Essay",
    category: "analysis",
    description: "Structured approach for analyzing texts, themes, characters, and literary devices.",
    difficulty: "advanced",
    estimatedLength: "400-500 words", 
    timeLimit: 30,
    sections: [
      {
        id: "introduction",
        name: "Introduction",
        description: "Introduce the work and present your analytical thesis",
        fixedSentences: [
          "In [AUTHOR'S] work [TITLE], the author explores the complex theme of [THEME/TOPIC].",
          "Through careful examination of [LITERARY ELEMENTS], it becomes apparent that [AUTHOR'S PURPOSE].",
          "Specifically, [AUTHOR] uses [SPECIFIC TECHNIQUES] to demonstrate that [THESIS STATEMENT]."
        ],
        customSentences: 2,
        guidelines: [
          "Identify the author, title, and main theme",
          "Mention specific literary techniques you'll analyze",
          "Present a clear analytical thesis",
          "Avoid plot summary in favor of analysis"
        ],
        examples: [
          "In Harper Lee's work To Kill a Mockingbird, the author explores the complex theme of moral courage in the face of social injustice.",
          "Through careful examination of character development and symbolism, it becomes apparent that Lee aims to challenge readers' understanding of true bravery.",
          "Specifically, Lee uses the contrasting characters of Atticus Finch and Mrs. Dubose to demonstrate that real courage requires standing up for what is right, even when facing certain defeat."
        ]
      },
      {
        id: "body-paragraph-1",
        name: "Body Paragraph 1",
        description: "Analyze first literary element or example",
        fixedSentences: [
          "One of the most significant ways [AUTHOR] develops [THEME] is through [LITERARY DEVICE/CHARACTER/SETTING].",
          "For example, when [SPECIFIC EXAMPLE FROM TEXT].",
          "This technique reveals that [ANALYSIS OF DEEPER MEANING].",
          "The significance of this choice becomes clear when we consider [BROADER IMPLICATIONS]."
        ],
        customSentences: 3,
        guidelines: [
          "Focus on one specific literary element",
          "Provide concrete examples from the text",
          "Explain what the examples reveal about the theme",
          "Connect to the larger work and thesis"
        ],
        examples: [
          "One of the most significant ways Lee develops the theme of moral courage is through the character of Atticus Finch.",
          "For example, when Atticus chooses to defend Tom Robinson despite knowing he will face community backlash.",
          "This technique reveals that true moral courage requires sacrifice and personal risk."
        ]
      },
      {
        id: "body-paragraph-2",
        name: "Body Paragraph 2", 
        description: "Analyze second literary element or example",
        fixedSentences: [
          "Additionally, [AUTHOR] reinforces this theme through [SECOND LITERARY ELEMENT].",
          "The passage where [SPECIFIC TEXTUAL EVIDENCE] particularly demonstrates [POINT].",
          "By employing [TECHNIQUE], the author suggests that [INTERPRETATION].",
          "This literary choice supports the overall message that [CONNECTION TO THESIS]."
        ],
        customSentences: 3,
        guidelines: [
          "Present a different but related analytical point",
          "Use different types of evidence than paragraph 1",
          "Maintain focus on your thesis throughout",
          "Show how multiple elements work together"
        ],
        examples: [
          "Additionally, Lee reinforces this theme through the character of Mrs. Dubose.",
          "The passage where Mrs. Dubose fights her morphine addiction particularly demonstrates that courage takes many forms.",
          "By employing this parallel character, the author suggests that both physical and moral battles require the same inner strength."
        ]
      },
      {
        id: "body-paragraph-3",
        name: "Body Paragraph 3",
        description: "Analyze third element or synthesis of ideas",
        fixedSentences: [
          "The culmination of these techniques appears when [CLIMACTIC EXAMPLE OR SYNTHESIS].",
          "Here, [AUTHOR] brings together [MULTIPLE ELEMENTS] to create [EFFECT].",
          "This moment in the text illustrates [DEEPER UNDERSTANDING].",
          "Through this synthesis, we understand that [FINAL ANALYTICAL INSIGHT]."
        ],
        customSentences: 3,
        guidelines: [
          "Show how different elements work together",
          "Focus on a climactic or synthesizing moment",
          "Demonstrate sophisticated analytical thinking",
          "Prepare for conclusion by showing full understanding"
        ],
        examples: [
          "The culmination of these techniques appears when Scout finally understands what her father meant about real courage.",
          "Here, Lee brings together the lessons from both Atticus and Mrs. Dubose to create Scout's moment of moral awakening.",
          "This moment in the text illustrates that courage is not about winning, but about doing what is right."
        ]
      },
      {
        id: "conclusion",
        name: "Conclusion",
        description: "Synthesize analysis and discuss broader significance",
        fixedSentences: [
          "Through the analysis of [LITERARY ELEMENTS DISCUSSED], it becomes clear that [AUTHOR] successfully [ACHIEVES PURPOSE].",
          "The techniques examined reveal the author's sophisticated understanding of [BROADER THEME/HUMAN CONDITION].",
          "Ultimately, [TITLE] serves as [LASTING SIGNIFICANCE OR RELEVANCE]."
        ],
        customSentences: 2,
        guidelines: [
          "Synthesize your analytical points",
          "Explain the author's overall achievement",
          "Discuss why this analysis matters",
          "Connect to universal or timeless themes"
        ],
        examples: [
          "Through the analysis of character development and parallel structures, it becomes clear that Lee successfully challenges traditional notions of heroism.",
          "The techniques examined reveal the author's sophisticated understanding of how moral courage develops and manifests.",
          "Ultimately, To Kill a Mockingbird serves as a timeless reminder that true strength comes from moral conviction rather than physical power."
        ]
      }
    ],
    transitionPhrases: {
      analysis: ["The author reveals", "This suggests", "The text demonstrates", "Through this technique", "The significance lies in"],
      textual_evidence: ["For instance", "As evidenced by", "The passage shows", "We see this when", "This is illustrated through"],
      interpretation: ["This implies", "The deeper meaning", "This reveals", "The author suggests", "We can infer"],
      synthesis: ["Taken together", "These elements combine", "The overall effect", "Collectively", "In synthesis"],
      conclusion: ["In sum", "The analysis reveals", "Through examination", "Ultimately", "The text demonstrates"]
    },
    scoringCriteria: {
      structure: [
        "Clear analytical thesis statement",
        "Body paragraphs focused on specific literary elements",
        "Logical progression of analytical points",
        "Conclusion that synthesizes analysis"
      ],
      coherence: [
        "Smooth transitions between analytical points", 
        "Clear connections between evidence and interpretation",
        "Consistent analytical focus throughout",
        "Ideas build upon each other logically"
      ],
      development: [
        "Specific textual evidence for each point",
        "Detailed analysis of how techniques create meaning",
        "Multiple types of literary evidence",
        "Sophisticated interpretation of author's choices"
      ],
      language: [
        "Academic tone appropriate for analysis",
        "Precise literary terminology",
        "Varied sentence structures for clarity",
        "Clear and engaging prose style"
      ]
    }
  },

  // Template 3: Compare and Contrast Essay
  {
    id: "compare-contrast-block",
    name: "Compare and Contrast Essay",
    category: "compare-contrast",
    description: "Block method for comparing and contrasting two subjects, ideas, or perspectives.",
    difficulty: "intermediate",
    estimatedLength: "400-450 words",
    timeLimit: 25,
    sections: [
      {
        id: "introduction",
        name: "Introduction",
        description: "Introduce both subjects and preview the comparison",
        fixedSentences: [
          "When examining [SUBJECT A] and [SUBJECT B], both [SIMILARITY] yet differ significantly in key areas.",
          "While [SUBJECT A] is characterized by [KEY FEATURE], [SUBJECT B] is distinguished by [CONTRASTING FEATURE].",
          "A comprehensive comparison reveals that although both [SHARED CHARACTERISTIC], [OVERALL THESIS ABOUT THEIR RELATIONSHIP]."
        ],
        customSentences: 2,
        guidelines: [
          "Introduce both subjects clearly",
          "Hint at both similarities and differences", 
          "Present a thesis that shows the significance of the comparison",
          "Avoid going into detailed analysis yet"
        ],
        examples: [
          "When examining traditional classroom learning and online education, both aim to deliver quality instruction yet differ significantly in key areas.",
          "While traditional classrooms are characterized by face-to-face interaction, online education is distinguished by flexibility and technological integration.",
          "A comprehensive comparison reveals that although both methods can be effective, the choice between them depends largely on individual learning styles and circumstances."
        ]
      },
      {
        id: "subject-a-analysis",
        name: "Subject A Analysis",
        description: "Comprehensive analysis of the first subject",
        fixedSentences: [
          "[SUBJECT A] demonstrates several distinctive characteristics that define its nature.",
          "Most notably, [KEY STRENGTH/FEATURE OF SUBJECT A] makes it particularly [ADVANTAGE].",
          "However, [SUBJECT A] also presents challenges, including [WEAKNESS OR LIMITATION].",
          "Despite these drawbacks, [SUBJECT A] remains [OVERALL ASSESSMENT] because [REASONING]."
        ],
        customSentences: 4,
        guidelines: [
          "Focus entirely on Subject A",
          "Present both strengths and weaknesses",
          "Use specific examples and details",
          "Maintain balanced, objective tone"
        ],
        examples: [
          "Traditional classroom learning demonstrates several distinctive characteristics that define its educational approach.",
          "Most notably, immediate teacher-student interaction makes it particularly effective for complex problem-solving and discussion-based learning.",
          "However, traditional classrooms also present challenges, including rigid scheduling and limited accommodation for different learning paces.",
          "Despite these drawbacks, traditional education remains valuable because it fosters social skills and provides structured support."
        ]
      },
      {
        id: "subject-b-analysis", 
        name: "Subject B Analysis",
        description: "Comprehensive analysis of the second subject",
        fixedSentences: [
          "In contrast, [SUBJECT B] exhibits different characteristics that set it apart.",
          "The primary advantage of [SUBJECT B] lies in [KEY STRENGTH/FEATURE].",
          "Conversely, [SUBJECT B] faces difficulties with [WEAKNESS OR LIMITATION].",
          "Nevertheless, [SUBJECT B] offers [OVERALL BENEFIT] that [SPECIFIC VALUE]."
        ],
        customSentences: 4,
        guidelines: [
          "Focus entirely on Subject B", 
          "Use contrasting transitions to show differences",
          "Present parallel structure to Subject A analysis",
          "Be equally detailed and balanced"
        ],
        examples: [
          "In contrast, online education exhibits different characteristics that set it apart from traditional methods.",
          "The primary advantage of online learning lies in its flexibility and accessibility for diverse student populations.",
          "Conversely, online education faces difficulties with maintaining student engagement and preventing isolation.",
          "Nevertheless, online learning offers personalized pacing that allows students to master material at their own speed."
        ]
      },
      {
        id: "synthesis-comparison",
        name: "Direct Comparison",
        description: "Direct comparison highlighting key similarities and differences",
        fixedSentences: [
          "When directly comparing [SUBJECT A] and [SUBJECT B], several key patterns emerge.",
          "Both approaches share [IMPORTANT SIMILARITY], demonstrating that [SIGNIFICANCE OF SIMILARITY].",
          "However, the fundamental difference lies in [MAIN CONTRASTING ELEMENT].",
          "This distinction suggests that [IMPLICATION OF THE DIFFERENCE]."
        ],
        customSentences: 3,
        guidelines: [
          "Compare subjects directly rather than separately",
          "Identify the most significant similarity",
          "Highlight the most important difference", 
          "Explain why these comparisons matter"
        ],
        examples: [
          "When directly comparing traditional and online education, several key patterns emerge.",
          "Both approaches share the goal of knowledge transfer, demonstrating that effective learning can occur through multiple modalities.",
          "However, the fundamental difference lies in the degree of personal interaction and immediate feedback available.",
          "This distinction suggests that the choice between methods should depend on the learner's need for social interaction and self-directed study skills."
        ]
      },
      {
        id: "conclusion",
        name: "Conclusion", 
        description: "Synthesize the comparison and present final judgment",
        fixedSentences: [
          "The comparison between [SUBJECT A] and [SUBJECT B] reveals that [OVERALL CONCLUSION].",
          "Rather than viewing these as competing alternatives, it becomes clear that [SYNTHESIS OR RELATIONSHIP].",
          "Ultimately, the choice between [SUBJECT A] and [SUBJECT B] should be based on [DETERMINING FACTORS]."
        ],
        customSentences: 2,
        guidelines: [
          "Provide a balanced final assessment",
          "Avoid simply choosing one as 'better'",
          "Suggest criteria for making the choice",
          "End with broader implications"
        ],
        examples: [
          "The comparison between traditional classroom learning and online education reveals that both have significant value in modern education.",
          "Rather than viewing these as competing alternatives, it becomes clear that they serve different needs and learning preferences.",
          "Ultimately, the choice between traditional and online education should be based on individual learning styles, life circumstances, and educational goals."
        ]
      }
    ],
    transitionPhrases: {
      contrast: ["In contrast", "However", "On the other hand", "Conversely", "Unlike", "Whereas"],
      similarity: ["Similarly", "Likewise", "In the same way", "Both", "Equally", "Just as"],
      comparison: ["When comparing", "In relation to", "Relative to", "As opposed to", "Compared with"],
      emphasis: ["Most importantly", "Significantly", "Notably", "Particularly", "Especially"],
      synthesis: ["Overall", "Taking everything into account", "When considered together", "In the final analysis"]
    },
    scoringCriteria: {
      structure: [
        "Clear introduction that establishes comparison framework",
        "Balanced treatment of both subjects",
        "Logical organization (block or point-by-point)",
        "Synthesis that shows significance of comparison"
      ],
      coherence: [
        "Effective transitions between subjects and points",
        "Parallel structure in comparing elements",
        "Clear relationships between similarities and differences",
        "Consistent comparison criteria throughout"
      ],
      development: [
        "Specific details and examples for both subjects",
        "Equal depth of analysis for each subject",
        "Clear explanation of similarities and differences",
        "Meaningful synthesis of comparison results"
      ],
      language: [
        "Appropriate comparative language and transitions",
        "Balanced and objective tone",
        "Precise vocabulary for expressing relationships",
        "Varied sentence structures for engaging prose"
      ]
    }
  }
];

// Sample Writing Prompts
export const writingPrompts: WritingPrompt[] = [
  // Argumentative Prompts
  {
    id: "social-media-mental-health",
    title: "Social Media and Mental Health",
    prompt: "Some educators argue that social media use among teenagers should be strictly limited during school hours to improve mental health and academic focus. Others contend that social media is an important tool for communication and learning that should not be restricted. Write an essay in which you develop a position on whether schools should limit students' social media use during school hours. Use appropriate evidence and examples to support your argument.",
    templateIds: ["argumentative-5-paragraph"],
    difficulty: "medium",
    topic: "Technology and Education",
    keywords: ["social media", "mental health", "education", "teenagers", "school policy"],
    rubric: {
      excellent: "Presents a clear, well-reasoned position with strong evidence and addresses counterarguments effectively",
      good: "Takes a clear position with adequate support and some consideration of opposing views",
      fair: "States a position with limited evidence and minimal consideration of counterarguments", 
      poor: "Unclear position with insufficient evidence and no consideration of opposing perspectives"
    }
  },
  {
    id: "homework-effectiveness",
    title: "The Value of Homework",
    prompt: "Research suggests that the effectiveness of homework varies significantly across grade levels and subjects. Some educators advocate for eliminating homework entirely, arguing it creates unnecessary stress and reduces family time. Others maintain that homework is essential for reinforcing learning and developing study habits. Write an essay arguing for or against the elimination of homework in middle and high schools. Support your position with specific reasons and evidence.",
    templateIds: ["argumentative-5-paragraph"],
    difficulty: "medium", 
    topic: "Education Policy",
    keywords: ["homework", "education", "stress", "learning", "study habits"],
    rubric: {
      excellent: "Develops a nuanced argument with compelling evidence from multiple perspectives",
      good: "Presents a clear argument with relevant evidence and reasoning",
      fair: "Makes an argument with some evidence but lacks depth or consideration of complexity",
      poor: "Weak argument with little evidence or reasoning"
    }
  },
  {
    id: "artificial-intelligence-jobs",
    title: "AI and the Future of Work",
    prompt: "Artificial intelligence and automation are rapidly changing the job market. While some argue that AI will create new opportunities and increase productivity, others worry about widespread unemployment and economic inequality. Write an essay in which you argue whether the benefits of AI advancement outweigh the potential risks to employment. Use specific examples and evidence to support your position.",
    templateIds: ["argumentative-5-paragraph", "compare-contrast-block"],
    difficulty: "hard",
    topic: "Technology and Society",
    keywords: ["artificial intelligence", "automation", "employment", "economy", "technology"],
    rubric: {
      excellent: "Demonstrates sophisticated understanding of complex issues with well-integrated evidence",
      good: "Shows good grasp of the topic with solid evidence and reasoning",
      fair: "Basic understanding with adequate support but limited complexity",
      poor: "Superficial treatment with weak evidence and reasoning"
    }
  },

  // Analysis Prompts
  {
    id: "literary-symbolism",
    title: "Symbolism in Literature",
    prompt: "Choose a work of literature you have read that makes significant use of symbolism. Write an essay analyzing how the author uses specific symbols to develop a central theme. Explain what the symbols represent, how they are developed throughout the work, and why they are effective in conveying the author's message. Use specific textual evidence to support your analysis.",
    templateIds: ["analytical-literary"],
    difficulty: "hard",
    topic: "Literary Analysis",
    keywords: ["symbolism", "theme", "literature", "textual evidence", "literary devices"],
    rubric: {
      excellent: "Provides insightful analysis with sophisticated interpretation and strong textual evidence",
      good: "Offers clear analysis with good textual support and reasonable interpretation",
      fair: "Basic analysis with some textual evidence but limited insight",
      poor: "Weak analysis with minimal textual support and poor interpretation"
    }
  },
  {
    id: "character-development",
    title: "Character Development Analysis",
    prompt: "Select a character from a novel, play, or long poem who undergoes significant change or development. Write an essay analyzing how and why this character changes throughout the work. Consider what events, relationships, or realizations contribute to the character's development and how this development relates to the work's overall meaning. Support your analysis with specific evidence from the text.",
    templateIds: ["analytical-literary"],
    difficulty: "medium",
    topic: "Literary Analysis", 
    keywords: ["character development", "change", "literature", "analysis", "textual evidence"],
    rubric: {
      excellent: "Demonstrates deep understanding of character development with insightful connections to themes",
      good: "Shows good understanding with clear analysis and adequate textual support",
      fair: "Basic character analysis with some evidence but limited depth",
      poor: "Superficial analysis with little evidence or understanding"
    }
  },

  // Compare and Contrast Prompts
  {
    id: "learning-styles",
    title: "Learning Approaches Comparison",
    prompt: "Compare and contrast two different approaches to learning: collaborative group work and independent study. Consider the advantages and disadvantages of each approach, the types of learners who might benefit most from each method, and the kinds of subjects or skills that might be best taught through each approach. Conclude with your assessment of how these methods might work together effectively.",
    templateIds: ["compare-contrast-block"],
    difficulty: "medium",
    topic: "Education and Learning",
    keywords: ["learning styles", "collaboration", "independent study", "education", "comparison"],
    rubric: {
      excellent: "Provides balanced, thorough comparison with insightful analysis of both approaches",
      good: "Offers clear comparison with adequate detail and reasonable conclusions",
      fair: "Basic comparison with some details but limited analysis",
      poor: "Weak comparison with insufficient detail and poor organization"
    }
  },
  {
    id: "communication-methods",
    title: "Digital vs. Face-to-Face Communication",
    prompt: "Compare and contrast digital communication (texting, social media, video calls) with traditional face-to-face communication. Analyze the effectiveness of each method for different purposes, such as maintaining relationships, conducting business, or learning. Consider both the advantages and limitations of each approach, and conclude with your thoughts on how both forms of communication can be used effectively in modern life.",
    templateIds: ["compare-contrast-block"],
    difficulty: "easy",
    topic: "Communication and Technology",
    keywords: ["communication", "digital", "face-to-face", "relationships", "technology"],
    rubric: {
      excellent: "Sophisticated analysis of both forms with nuanced understanding of their applications",
      good: "Clear comparison with good examples and reasonable conclusions",
      fair: "Adequate comparison with basic understanding and some examples", 
      poor: "Weak comparison with poor examples and unclear conclusions"
    }
  }
];

export const getTemplateById = (templateId: string): WritingTemplate | undefined => {
  return writingTemplates.find(template => template.id === templateId);
};

export const getPromptById = (promptId: string): WritingPrompt | undefined => {
  return writingPrompts.find(prompt => prompt.id === promptId);
};

export const getPromptsByTemplate = (templateId: string): WritingPrompt[] => {
  return writingPrompts.filter(prompt => prompt.templateIds.includes(templateId));
};

export const getTemplatesByCategory = (category: string): WritingTemplate[] => {
  return writingTemplates.filter(template => template.category === category);
};