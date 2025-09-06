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
  },

  // Template 4: Problem-Solution Essay
  {
    id: "problem-solution-structured",
    name: "Problem-Solution Essay",
    category: "problem-solution",
    description: "Systematic approach to identifying problems and proposing practical solutions.",
    difficulty: "intermediate",
    estimatedLength: "400-500 words",
    timeLimit: 25,
    sections: [
      {
        id: "introduction",
        name: "Introduction",
        description: "Present the problem and preview your solution",
        fixedSentences: [
          "In today's world, [PROBLEM AREA] has become a serious concern that affects [WHO IS AFFECTED].",
          "The issue of [SPECIFIC PROBLEM] continues to worsen despite [CURRENT EFFORTS].",
          "However, there is a viable solution: [YOUR PROPOSED SOLUTION] can effectively address this problem through [APPROACH]."
        ],
        customSentences: 2,
        guidelines: [
          "Clearly define the problem and its scope",
          "Establish why this problem needs solving now",
          "Preview your solution without going into detail yet",
          "Make the problem relevant to your audience"
        ],
        examples: [
          "In today's world, food waste has become a serious concern that affects both our environment and economy.",
          "The issue of students throwing away uneaten cafeteria food continues to worsen despite awareness campaigns.",
          "However, there is a viable solution: implementing a food donation program can effectively address this problem through systematic redistribution."
        ]
      },
      {
        id: "problem-analysis",
        name: "Problem Analysis",
        description: "Analyze the problem's causes and effects in detail",
        fixedSentences: [
          "The root causes of [PROBLEM] stem from [PRIMARY CAUSE] and [SECONDARY CAUSE].",
          "This problem manifests itself through [SPECIFIC EXAMPLES/EVIDENCE].",
          "The consequences of ignoring this issue include [NEGATIVE EFFECTS].",
          "If left unaddressed, [PROBLEM] will likely result in [FUTURE CONSEQUENCES]."
        ],
        customSentences: 4,
        guidelines: [
          "Identify the main causes behind the problem",
          "Provide concrete evidence and examples",
          "Explain both current and potential future impacts",
          "Help readers understand the urgency of the situation"
        ],
        examples: [
          "The root causes of food waste stem from overordering by cafeteria staff and students taking more than they can eat.",
          "This problem manifests itself through daily observations of full trash cans and uneaten meals.",
          "The consequences of ignoring this issue include environmental damage from landfill waste and financial losses for schools.",
          "If left unaddressed, food waste will likely result in increased costs for taxpayers and continued environmental harm."
        ]
      },
      {
        id: "solution-proposal",
        name: "Solution Proposal",
        description: "Present your detailed solution with implementation steps",
        fixedSentences: [
          "The most effective approach to solving [PROBLEM] involves [MAIN SOLUTION STRATEGY].",
          "Specifically, [STEP 1] would [EXPLANATION OF FIRST STEP].",
          "Additionally, [STEP 2] would ensure [EXPLANATION OF SECOND STEP].",
          "This comprehensive approach addresses the problem by [HOW SOLUTION TARGETS CAUSES]."
        ],
        customSentences: 4,
        guidelines: [
          "Present a clear, actionable solution",
          "Break down implementation into specific steps",
          "Show how your solution addresses the root causes",
          "Make the solution realistic and feasible"
        ],
        examples: [
          "The most effective approach to solving food waste involves establishing partnerships with local food banks and shelters.",
          "Specifically, daily collection of unopened food items would redirect surplus to those in need.",
          "Additionally, student volunteer programs would ensure proper sorting and timely distribution of donated food.",
          "This comprehensive approach addresses the problem by creating value from waste while helping the community."
        ]
      },
      {
        id: "benefits-implementation",
        name: "Benefits & Implementation",
        description: "Explain benefits and address potential challenges",
        fixedSentences: [
          "Implementing this solution would provide several significant benefits, including [BENEFIT 1] and [BENEFIT 2].",
          "Critics might argue that [POTENTIAL OBJECTION], but this concern can be addressed by [COUNTER-RESPONSE].",
          "The implementation process requires [RESOURCES/REQUIREMENTS] but offers [LONG-TERM VALUE].",
          "Success can be measured through [MEASURABLE OUTCOMES] that demonstrate [EVIDENCE OF SUCCESS]."
        ],
        customSentences: 3,
        guidelines: [
          "Highlight multiple benefits of your solution",
          "Anticipate and address potential objections",
          "Discuss implementation requirements honestly",
          "Provide ways to measure success"
        ],
        examples: [
          "Implementing this solution would provide several significant benefits, including reduced environmental impact and improved community relations.",
          "Critics might argue that food safety regulations make donation complicated, but this concern can be addressed by following established FDA guidelines for food donation.",
          "The implementation process requires initial training and coordination but offers long-term cost savings and positive publicity."
        ]
      },
      {
        id: "conclusion",
        name: "Conclusion",
        description: "Call for action and reinforce the solution's importance",
        fixedSentences: [
          "The problem of [PROBLEM] demands immediate action through [PROPOSED SOLUTION].",
          "By implementing [KEY ASPECTS OF SOLUTION], we can achieve [POSITIVE OUTCOMES].",
          "The time to act is now, before [PROBLEM] becomes even more [CONSEQUENCE OF INACTION]."
        ],
        customSentences: 2,
        guidelines: [
          "Create urgency for implementing your solution",
          "Summarize the key benefits concisely",
          "End with a strong call to action",
          "Paint a picture of positive change"
        ],
        examples: [
          "The problem of food waste demands immediate action through establishing systematic donation programs.",
          "By implementing partnerships with local charities and volunteer coordination, we can achieve both environmental protection and community support.",
          "The time to act is now, before food waste becomes even more costly and environmentally damaging."
        ]
      }
    ],
    transitionPhrases: {
      problem_analysis: ["The issue arises from", "This problem occurs because", "The underlying cause is", "Evidence shows that"],
      solution_introduction: ["The solution lies in", "An effective approach involves", "This problem can be solved by", "The best strategy is to"],
      implementation: ["The first step requires", "Next, it is essential to", "Furthermore, implementation needs", "Additionally, success depends on"],
      benefits: ["This approach offers", "The advantages include", "Benefits of this solution", "Positive outcomes include"],
      conclusion: ["In summary", "Therefore, action is needed", "The solution requires", "Moving forward"]
    },
    scoringCriteria: {
      structure: [
        "Clear problem identification and definition",
        "Logical progression from problem to solution",
        "Well-organized implementation steps",
        "Strong conclusion with call to action"
      ],
      coherence: [
        "Solution directly addresses identified problems",
        "Clear connections between causes and proposed remedies",
        "Smooth transitions between problem analysis and solution",
        "Consistent focus throughout essay"
      ],
      development: [
        "Detailed analysis of problem causes and effects",
        "Specific, actionable solution with clear steps",
        "Consideration of potential challenges and objections",
        "Evidence and examples support main points"
      ],
      language: [
        "Clear, persuasive language appropriate for problem-solving",
        "Specific terminology related to the problem area",
        "Varied sentence structures for engagement",
        "Professional tone that inspires confidence"
      ]
    }
  },

  // Template 5: Cause and Effect Essay
  {
    id: "cause-effect-analytical",
    name: "Cause and Effect Essay", 
    category: "cause-effect",
    description: "Systematic analysis of causes and effects with clear causal relationships.",
    difficulty: "intermediate",
    estimatedLength: "400-450 words",
    timeLimit: 25,
    sections: [
      {
        id: "introduction",
        name: "Introduction",
        description: "Introduce the phenomenon and establish causal relationships",
        fixedSentences: [
          "The phenomenon of [MAIN TOPIC] has become increasingly significant in [CONTEXT/TIME PERIOD].",
          "Understanding [TOPIC] requires careful examination of both its underlying causes and wide-ranging effects.",
          "Analysis reveals that [TOPIC] results from [PREVIEW OF CAUSES] and leads to [PREVIEW OF EFFECTS]."
        ],
        customSentences: 2,
        guidelines: [
          "Introduce the phenomenon without bias",
          "Establish that you'll examine both causes and effects",
          "Preview the main causal relationships",
          "Make clear why this analysis matters"
        ],
        examples: [
          "The phenomenon of increasing student stress levels has become increasingly significant in modern educational environments.",
          "Understanding student stress requires careful examination of both its underlying causes and wide-ranging effects on academic performance.",
          "Analysis reveals that student stress results from academic pressure and social expectations and leads to both psychological and academic consequences."
        ]
      },
      {
        id: "primary-causes",
        name: "Primary Causes",
        description: "Analyze the main causes behind the phenomenon",
        fixedSentences: [
          "The primary cause of [PHENOMENON] can be traced to [MAIN CAUSE].",
          "This factor contributes to [PHENOMENON] because [EXPLANATION OF CAUSAL MECHANISM].",
          "Evidence supporting this causal relationship includes [SPECIFIC EVIDENCE].",
          "The significance of [MAIN CAUSE] becomes apparent when considering [IMPACT OR SCOPE]."
        ],
        customSentences: 4,
        guidelines: [
          "Focus on the most significant cause",
          "Explain HOW this cause creates the effect",
          "Provide concrete evidence for the causal relationship",
          "Show the scope or importance of this cause"
        ],
        examples: [
          "The primary cause of student stress can be traced to excessive academic workload and competition.",
          "This factor contributes to stress because students feel constantly pressured to achieve perfect grades while managing multiple demanding courses.",
          "Evidence supporting this causal relationship includes surveys showing that 75% of students report feeling overwhelmed by their academic responsibilities.",
          "The significance of academic pressure becomes apparent when considering that it affects students across all grade levels and social backgrounds."
        ]
      },
      {
        id: "secondary-causes",
        name: "Secondary Causes",
        description: "Examine additional contributing causes",
        fixedSentences: [
          "Additionally, [PHENOMENON] stems from [SECONDARY CAUSE], which [EXPLANATION].",
          "This contributing factor works by [MECHANISM OF CAUSATION].",
          "The interaction between [PRIMARY CAUSE] and [SECONDARY CAUSE] creates [COMBINED EFFECT].",
          "Together, these causes establish a pattern where [OVERALL CAUSAL PATTERN]."
        ],
        customSentences: 3,
        guidelines: [
          "Identify important secondary or contributing causes",
          "Explain how secondary causes work differently from primary ones",
          "Show how causes might interact or compound each other",
          "Build toward understanding the complete causal picture"
        ],
        examples: [
          "Additionally, student stress stems from social media pressure, which creates unrealistic expectations about success and lifestyle.",
          "This contributing factor works by exposing students to carefully curated images of others' achievements and happiness.",
          "The interaction between academic pressure and social media pressure creates a cycle where students feel inadequate both in school and social contexts.",
          "Together, these causes establish a pattern where students face constant comparison and evaluation from multiple sources."
        ]
      },
      {
        id: "immediate-effects",
        name: "Immediate Effects",
        description: "Analyze the direct, short-term effects",
        fixedSentences: [
          "The immediate effects of [PHENOMENON] manifest in [PRIMARY EFFECT AREA].",
          "Most notably, [SPECIFIC IMMEDIATE EFFECT] occurs because [CONNECTION TO CAUSES].",
          "This direct impact can be observed through [OBSERVABLE EVIDENCE].",
          "The short-term consequences particularly affect [WHO/WHAT IS MOST IMPACTED]."
        ],
        customSentences: 4,
        guidelines: [
          "Focus on effects that happen quickly or directly",
          "Show clear connections between causes and these effects",
          "Provide observable or measurable evidence",
          "Identify who or what experiences these effects most"
        ],
        examples: [
          "The immediate effects of student stress manifest in declining mental health and academic performance.",
          "Most notably, anxiety and depression symptoms occur because constant pressure overwhelms students' coping mechanisms.",
          "This direct impact can be observed through increased visits to school counselors and declining test scores.",
          "The short-term consequences particularly affect high-achieving students who put the most pressure on themselves."
        ]
      },
      {
        id: "long-term-effects",
        name: "Long-term Effects",
        description: "Examine broader, long-term consequences",
        fixedSentences: [
          "The long-term effects of [PHENOMENON] extend far beyond immediate concerns.",
          "Over time, [LONG-TERM EFFECT] develops as a result of [PROGRESSION FROM IMMEDIATE EFFECTS].",
          "These lasting consequences include [BROADER IMPACT] that affects [WIDER SCOPE].",
          "Unless addressed, [PHENOMENON] will continue to generate [FUTURE IMPLICATIONS]."
        ],
        customSentences: 3,
        guidelines: [
          "Focus on effects that develop over time",
          "Show how immediate effects lead to long-term ones",
          "Consider broader societal or systemic impacts",
          "Discuss implications for the future"
        ],
        examples: [
          "The long-term effects of student stress extend far beyond immediate academic concerns.",
          "Over time, chronic anxiety and burnout develop as a result of sustained exposure to high-pressure environments.",
          "These lasting consequences include reduced creativity, fear of risk-taking, and mental health issues that affect students well into adulthood.",
          "Unless addressed, student stress will continue to generate a generation of adults who struggle with work-life balance and self-worth."
        ]
      },
      {
        id: "conclusion",
        name: "Conclusion", 
        description: "Synthesize the causal analysis and discuss implications",
        fixedSentences: [
          "The analysis of [PHENOMENON] reveals a complex web of [SUMMARY OF CAUSAL RELATIONSHIPS].",
          "Understanding these cause-and-effect relationships is crucial because [IMPORTANCE OF UNDERSTANDING].",
          "Moving forward, addressing [PHENOMENON] requires [IMPLICATIONS FOR ACTION/POLICY]."
        ],
        customSentences: 2,
        guidelines: [
          "Summarize the key causal relationships discovered",
          "Explain why understanding these relationships matters",
          "Suggest what should be done based on this analysis",
          "End with broader significance or implications"
        ],
        examples: [
          "The analysis of student stress reveals a complex web of academic, social, and technological pressures that create both immediate and long-lasting effects.",
          "Understanding these cause-and-effect relationships is crucial because they affect not only individual students but also the future health of our society.",
          "Moving forward, addressing student stress requires systemic changes in education policy, social media regulation, and mental health support systems."
        ]
      }
    ],
    transitionPhrases: {
      causation: ["Results from", "Stems from", "Is caused by", "Arises due to", "Originates in"],
      effect: ["Leads to", "Results in", "Causes", "Produces", "Generates", "Creates"],
      sequence: ["Initially", "Subsequently", "Eventually", "Over time", "In the long run"],
      analysis: ["Evidence shows", "This demonstrates", "Analysis reveals", "Research indicates"],
      synthesis: ["The relationship between", "These connections show", "The pattern suggests", "Overall, the analysis"]
    },
    scoringCriteria: {
      structure: [
        "Clear introduction establishing causal analysis focus",
        "Logical organization of causes and effects",
        "Appropriate balance between causes and effects sections",
        "Synthesis conclusion that ties analysis together"
      ],
      coherence: [
        "Clear causal relationships throughout",
        "Logical progression from causes to effects",
        "Effective transitions showing causal connections",
        "Consistent analytical focus"
      ],
      development: [
        "Detailed analysis of both causes and effects",
        "Specific evidence supporting causal relationships",
        "Clear explanations of HOW causes create effects",
        "Consideration of both immediate and long-term impacts"
      ],
      language: [
        "Precise causal language and transitions",
        "Analytical tone appropriate for examination",
        "Clear explanations of complex relationships",
        "Varied sentence structures for clarity"
      ]
    }
  },

  // Template 6: Narrative Personal Essay
  {
    id: "narrative-personal-reflective",
    name: "Narrative Personal Essay",
    category: "narrative",
    description: "Personal storytelling with reflection on growth, learning, or significant experiences.",
    difficulty: "intermediate", 
    estimatedLength: "450-550 words",
    timeLimit: 30,
    sections: [
      {
        id: "engaging-opening",
        name: "Engaging Opening",
        description: "Hook the reader with a compelling scene or moment",
        fixedSentences: [
          "The moment I [ACTION/REALIZATION] changed everything I thought I knew about [TOPIC/CONCEPT].",
          "Standing there [SETTING DETAILS], I never expected that [UNEXPECTED ELEMENT] would teach me [LESSON].",
          "It wasn't until [SPECIFIC MOMENT/TIME] that I realized [IMPORTANT INSIGHT] about [SUBJECT]."
        ],
        customSentences: 3,
        guidelines: [
          "Start in the middle of action or a crucial moment",
          "Use sensory details to create a vivid scene",
          "Hint at the significance without explaining it yet",
          "Make the reader want to know what happens next"
        ],
        examples: [
          "The moment I stepped onto the debate stage for the first time changed everything I thought I knew about my own voice.",
          "Standing there in the bright lights with hundreds of eyes watching, I never expected that my trembling hands would teach me about courage.",
          "It wasn't until I opened my mouth to speak that I realized how much I had grown since the shy kid who hated presenting in class."
        ]
      },
      {
        id: "background-context",
        name: "Background & Context",
        description: "Provide necessary background information",
        fixedSentences: [
          "To understand this moment, it's important to know that [BACKGROUND INFORMATION].",
          "For years, I had been [PREVIOUS STATE/BEHAVIOR] because [REASONING/FEAR].",
          "My perspective on [TOPIC] was shaped by [PREVIOUS EXPERIENCES] that made me believe [OLD BELIEF].",
          "This all began when [INITIATING EVENT] forced me to [INITIAL RESPONSE/DECISION]."
        ],
        customSentences: 3,
        guidelines: [
          "Provide only essential background information",
          "Explain your previous mindset or situation",
          "Set up the contrast with what will happen later",
          "Keep the focus on details relevant to your main story"
        ],
        examples: [
          "To understand this moment, it's important to know that I had always been the student who sat in the back corner, hoping not to be called on.",
          "For years, I had been avoiding public speaking because I believed my ideas weren't worth sharing.",
          "My perspective on leadership was shaped by watching confident classmates dominate discussions while I remained silent.",
          "This all began when my English teacher assigned mandatory participation in the school debate tournament, forcing me to confront my greatest fear."
        ]
      },
      {
        id: "main-narrative-event",
        name: "Main Narrative Event",
        description: "Tell the central story with vivid details",
        fixedSentences: [
          "When [KEY EVENT] happened, I felt [EMOTIONAL RESPONSE] because [REASON].",
          "The details of that [TIME PERIOD] remain vivid: [SENSORY DETAILS].",
          "As [PROGRESSION OF EVENTS] unfolded, I began to [REALIZATION/CHANGE].",
          "The turning point came when [PIVOTAL MOMENT] made me understand [NEW INSIGHT]."
        ],
        customSentences: 5,
        guidelines: [
          "Use chronological order to tell your story",
          "Include specific, concrete details and sensory information",
          "Show your thoughts and feelings during the experience",
          "Focus on the most important moments in detail"
        ],
        examples: [
          "When my name was called to give my opening statement, I felt my heart hammering against my ribs because this was the moment I'd been dreading for weeks.",
          "The details of that three-minute speech remain vivid: the bright stage lights making everything beyond them disappear, the microphone feeling heavy in my sweaty palm, my voice starting as barely more than a whisper.",
          "As I progressed through my carefully practiced arguments about environmental policy, I began to notice something unexpected—my voice was getting stronger, not weaker.",
          "The turning point came when I saw several judges nodding along with my points, making me understand that my ideas actually did have value and impact."
        ]
      },
      {
        id: "challenge-conflict",
        name: "Challenge & Conflict", 
        description: "Describe obstacles faced and how you dealt with them",
        fixedSentences: [
          "However, [COMPLICATION/CHALLENGE] threatened to [POTENTIAL NEGATIVE OUTCOME].",
          "I struggled with [INTERNAL CONFLICT] while simultaneously dealing with [EXTERNAL CHALLENGE].",
          "The most difficult moment was when [SPECIFIC DIFFICULTY] forced me to [DIFFICULT DECISION/ACTION].",
          "Despite [OBSTACLE], I chose to [RESPONSE] because [MOTIVATION/REASONING]."
        ],
        customSentences: 4,
        guidelines: [
          "Include both internal struggles and external challenges",
          "Show how you responded to difficulties",
          "Make the conflict meaningful to your overall story",
          "Demonstrate growth through handling challenges"
        ],
        examples: [
          "However, my opponent's aggressive rebuttal threatened to shatter my newfound confidence and send me back into my shell.",
          "I struggled with self-doubt whispering that I didn't belong there while simultaneously dealing with complex policy questions I hadn't fully prepared for.",
          "The most difficult moment was when I stumbled over statistics, forcing me to abandon my script and speak from genuine understanding instead.",
          "Despite my racing heart and the urge to give up, I chose to trust my preparation and speak authentically because I realized this moment was bigger than my fear."
        ]
      },
      {
        id: "resolution-growth",
        name: "Resolution & Growth",
        description: "Show how you changed and what you learned",
        fixedSentences: [
          "By the end of [EXPERIENCE], I had transformed from [OLD SELF] into [NEW SELF].",
          "This experience taught me that [KEY LESSON] and changed how I approach [RELEVANT SITUATIONS].",
          "The most important realization was [MAJOR INSIGHT] which now influences [CURRENT BEHAVIOR/THINKING].",
          "Looking back, I can see that [EXPERIENCE] was really about [DEEPER MEANING] rather than just [SURFACE LEVEL]."
        ],
        customSentences: 3,
        guidelines: [
          "Clearly articulate what changed about you",
          "Connect the lesson to broader life applications",
          "Show ongoing impact of this experience",
          "Avoid cliché lessons—be specific and personal"
        ],
        examples: [
          "By the end of the tournament, I had transformed from someone who feared sharing ideas into someone who understood the power of authentic communication.",
          "This experience taught me that confidence isn't about never feeling afraid, but about speaking up despite the fear, and changed how I approach challenging conversations.",
          "The most important realization was that my perspective as an introvert actually brought unique value to discussions, which now influences how I contribute to group projects and leadership roles.",
          "Looking back, I can see that the debate tournament was really about finding my voice rather than just winning arguments."
        ]
      },
      {
        id: "reflective-conclusion",
        name: "Reflective Conclusion",
        description: "Connect your story to broader themes or future goals",
        fixedSentences: [
          "Today, when I encounter [SIMILAR SITUATIONS], I remember [KEY MOMENT FROM STORY] and [CURRENT RESPONSE].",
          "This experience continues to influence my [CURRENT ACTIVITIES/GOALS] because [CONNECTION].",
          "Most importantly, I learned that [UNIVERSAL TRUTH/PRINCIPLE] applies not just to [ORIGINAL SITUATION] but to [BROADER APPLICATIONS]."
        ],
        customSentences: 2,
        guidelines: [
          "Connect your personal story to universal themes",
          "Show how this experience continues to affect you",
          "End with insight that resonates beyond your specific situation",
          "Leave the reader with something meaningful to consider"
        ],
        examples: [
          "Today, when I encounter situations that intimidate me, I remember that moment when my voice found its strength and I choose courage over comfort.",
          "This experience continues to influence my involvement in student government and peer mentoring because I understand how transformative it can be when someone finds their voice.",
          "Most importantly, I learned that growth happens not in our comfort zones but in those moments when we're terrified and do it anyway—applies not just to public speaking but to every meaningful challenge we face."
        ]
      }
    ],
    transitionPhrases: {
      time: ["Initially", "At first", "Then", "Meanwhile", "Eventually", "Finally", "Now"],
      reflection: ["Looking back", "In hindsight", "I now realize", "This taught me", "I learned that"],
      contrast: ["However", "Despite this", "On the other hand", "Yet", "Nevertheless"],
      emotion: ["I felt", "The feeling was", "Emotionally", "In that moment", "My reaction was"],
      growth: ["I grew to understand", "This experience showed me", "I came to realize", "Now I know"]
    },
    scoringCriteria: {
      structure: [
        "Engaging opening that hooks the reader",
        "Clear narrative progression with logical flow",
        "Appropriate balance of story and reflection",
        "Meaningful conclusion that ties themes together"
      ],
      coherence: [
        "Consistent narrative voice and point of view",
        "Clear connections between events and insights",
        "Smooth transitions between narrative and reflection",
        "Focused theme throughout the essay"
      ],
      development: [
        "Vivid, specific details that bring the story to life",
        "Clear character development and growth",
        "Meaningful conflict and resolution",
        "Insightful reflection on experiences and lessons"
      ],
      language: [
        "Engaging, personal voice appropriate for storytelling",
        "Varied sentence structures for narrative flow",
        "Descriptive language that creates vivid scenes",
        "Authentic tone that connects with readers"
      ]
    }
  },

  // Template 7: Expository/Informative Essay
  {
    id: "expository-informative-structured",
    name: "Expository/Informative Essay",
    category: "expository", 
    description: "Clear, organized explanation of complex topics with objective information and analysis.",
    difficulty: "intermediate",
    estimatedLength: "400-500 words",
    timeLimit: 25,
    sections: [
      {
        id: "introduction",
        name: "Introduction",
        description: "Introduce the topic and establish the scope of explanation",
        fixedSentences: [
          "[TOPIC] is a complex subject that affects [RELEVANT AUDIENCE/CONTEXT] in significant ways.",
          "Understanding [TOPIC] requires examining [KEY ASPECTS] that contribute to its importance.",
          "This analysis will explore [SPECIFIC FOCUS AREAS] to provide a comprehensive understanding of [TOPIC]."
        ],
        customSentences: 2,
        guidelines: [
          "Define or introduce your topic clearly",
          "Establish why this information is important",
          "Preview the main areas you'll cover",
          "Maintain an objective, informative tone"
        ],
        examples: [
          "Renewable energy is a complex subject that affects both environmental sustainability and economic policy in significant ways.",
          "Understanding renewable energy requires examining technological advances, economic implications, and environmental benefits that contribute to its growing importance.",
          "This analysis will explore solar, wind, and hydroelectric power sources to provide a comprehensive understanding of modern renewable energy options."
        ]
      },
      {
        id: "background-overview",
        name: "Background Overview",
        description: "Provide essential background information and context",
        fixedSentences: [
          "To fully grasp [TOPIC], it is essential to understand [BACKGROUND INFORMATION].",
          "Historically, [TOPIC] has evolved from [PAST STATE] to [CURRENT STATE] due to [DRIVING FACTORS].",
          "The current significance of [TOPIC] stems from [RECENT DEVELOPMENTS/CHANGES].",
          "Key terminology includes [IMPORTANT TERMS] which refer to [DEFINITIONS/EXPLANATIONS]."
        ],
        customSentences: 3,
        guidelines: [
          "Provide necessary historical context",
          "Define important terms and concepts",
          "Explain how the topic has developed or changed",
          "Set up the foundation for detailed discussion"
        ],
        examples: [
          "To fully grasp renewable energy, it is essential to understand the difference between renewable and non-renewable energy sources.",
          "Historically, renewable energy has evolved from simple windmills and water wheels to sophisticated solar panels and wind turbines due to technological advances and environmental concerns.",
          "The current significance of renewable energy stems from climate change research and decreasing costs of renewable technology.",
          "Key terminology includes 'grid parity,' which refers to the point where renewable energy costs equal traditional energy costs without subsidies."
        ]
      },
      {
        id: "main-category-1",
        name: "Main Category 1",
        description: "Explain the first major aspect of your topic",
        fixedSentences: [
          "One of the most important aspects of [TOPIC] is [FIRST MAIN CATEGORY].",
          "This component functions by [EXPLANATION OF HOW IT WORKS].",
          "The significance of [FIRST CATEGORY] can be seen through [EXAMPLES/EVIDENCE].",
          "Current developments in [FIRST CATEGORY] include [RECENT ADVANCES/TRENDS]."
        ],
        customSentences: 4,
        guidelines: [
          "Focus on one specific aspect of your topic",
          "Explain how this aspect works or functions",
          "Provide concrete examples or evidence",
          "Include current information or recent developments"
        ],
        examples: [
          "One of the most important aspects of renewable energy is solar power technology.",
          "This component functions by converting sunlight directly into electricity through photovoltaic cells that create electrical current when exposed to light.",
          "The significance of solar power can be seen through its rapid adoption, with global solar capacity increasing by over 20% annually in recent years.",
          "Current developments in solar technology include improved efficiency rates and decreased manufacturing costs making it competitive with fossil fuels."
        ]
      },
      {
        id: "main-category-2",
        name: "Main Category 2",
        description: "Explain the second major aspect of your topic",
        fixedSentences: [
          "Another crucial element of [TOPIC] is [SECOND MAIN CATEGORY].",
          "Unlike [FIRST CATEGORY], [SECOND CATEGORY] operates through [DIFFERENT MECHANISM/APPROACH].",
          "The advantages of [SECOND CATEGORY] include [SPECIFIC BENEFITS].",
          "However, [SECOND CATEGORY] also faces challenges such as [LIMITATIONS/OBSTACLES]."
        ],
        customSentences: 4,
        guidelines: [
          "Focus on a different but related aspect",
          "Compare/contrast with the previous category when relevant",
          "Explain both advantages and limitations objectively",
          "Maintain balance in your presentation"
        ],
        examples: [
          "Another crucial element of renewable energy is wind power generation.",
          "Unlike solar power, wind energy operates through turbines that convert kinetic energy from moving air into electrical energy.",
          "The advantages of wind power include consistent energy generation in windy areas and minimal environmental impact once installed.",
          "However, wind power also faces challenges such as dependence on weather conditions and concerns about noise and visual impact."
        ]
      },
      {
        id: "main-category-3",
        name: "Main Category 3",
        description: "Explain the third major aspect of your topic", 
        fixedSentences: [
          "The third significant component of [TOPIC] involves [THIRD MAIN CATEGORY].",
          "This aspect is particularly important because [UNIQUE IMPORTANCE/ROLE].",
          "Research shows that [THIRD CATEGORY] [STATISTICAL EVIDENCE/RESEARCH FINDINGS].",
          "The future of [THIRD CATEGORY] appears [PROMISING/CHALLENGING] due to [SUPPORTING REASONS]."
        ],
        customSentences: 3,
        guidelines: [
          "Present your third main point with supporting evidence",
          "Include research, statistics, or expert opinions when possible",
          "Discuss future implications or trends",
          "Maintain objective tone while being informative"
        ],
        examples: [
          "The third significant component of renewable energy involves hydroelectric power generation.",
          "This aspect is particularly important because it provides reliable, consistent power generation that can be adjusted to meet demand fluctuations.",
          "Research shows that hydroelectric power currently supplies about 16% of global electricity and has the potential for significant expansion in developing regions.",
          "The future of hydroelectric power appears promising due to advances in small-scale and run-of-river systems that minimize environmental impact."
        ]
      },
      {
        id: "conclusion-synthesis",
        name: "Conclusion & Synthesis",
        description: "Summarize key points and discuss broader implications",
        fixedSentences: [
          "In summary, [TOPIC] encompasses [SUMMARY OF MAIN CATEGORIES] that work together to [OVERALL FUNCTION/PURPOSE].",
          "The examination of [MAIN ASPECTS] reveals that [KEY INSIGHT/PATTERN].",
          "Looking forward, [TOPIC] will likely [FUTURE IMPLICATIONS/DEVELOPMENTS] as [DRIVING FORCES] continue to influence its evolution."
        ],
        customSentences: 2,
        guidelines: [
          "Synthesize the main points rather than just listing them",
          "Identify patterns or connections between the aspects discussed",
          "Discuss implications for the future",
          "End with the broader significance of understanding this topic"
        ],
        examples: [
          "In summary, renewable energy encompasses solar, wind, and hydroelectric technologies that work together to provide clean alternatives to fossil fuel dependence.",
          "The examination of these energy sources reveals that diversification across multiple renewable technologies creates the most reliable and sustainable energy portfolio.",
          "Looking forward, renewable energy will likely dominate new power generation as costs continue to decrease and environmental concerns drive policy changes worldwide."
        ]
      }
    ],
    transitionPhrases: {
      introduction: ["To begin", "First, it is important to understand", "The topic of", "This subject involves"],
      explanation: ["This means that", "In other words", "Specifically", "For example", "To illustrate"],
      categories: ["Another important aspect", "Additionally", "Furthermore", "A second element", "In contrast"],
      evidence: ["Research indicates", "Studies show", "Evidence suggests", "Data reveals", "Experts agree"],
      conclusion: ["In conclusion", "To summarize", "Overall", "In reviewing these points", "The analysis shows"]
    },
    scoringCriteria: {
      structure: [
        "Clear introduction that establishes topic and scope",
        "Logical organization of information into categories",
        "Each section focuses on one main aspect",
        "Conclusion synthesizes information effectively"
      ],
      coherence: [
        "Smooth transitions between different aspects",
        "Clear relationships between ideas and evidence",
        "Consistent informative purpose throughout",
        "Ideas build upon each other logically"
      ],
      development: [
        "Thorough explanation of each main aspect",
        "Specific examples and evidence support main points",
        "Appropriate depth for the target audience",
        "Balance between different aspects of the topic"
      ],
      language: [
        "Objective, informative tone throughout",
        "Clear explanations of complex concepts",
        "Appropriate vocabulary for the subject matter",
        "Varied sentence structures for readability"
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

  // Problem-Solution Prompts
  {
    id: "campus-sustainability",
    title: "Campus Environmental Solutions",
    prompt: "Many schools face challenges in reducing their environmental impact while maintaining educational quality and managing budgets. Identify a specific environmental problem at schools (such as energy waste, food waste, transportation emissions, or plastic use) and propose a comprehensive solution. Your essay should clearly define the problem, explain why it needs immediate attention, and present a detailed, realistic solution that addresses the root causes. Consider potential objections and explain how your solution can be successfully implemented.",
    templateIds: ["problem-solution-structured"],
    difficulty: "medium",
    topic: "Environment and Education",
    keywords: ["sustainability", "environment", "schools", "waste reduction", "green solutions"],
    rubric: {
      excellent: "Identifies clear problem with comprehensive, actionable solution and addresses implementation challenges",
      good: "Presents clear problem and reasonable solution with adequate detail",
      fair: "Basic problem identification with simple solution but limited development",
      poor: "Unclear problem definition with unrealistic or poorly developed solution"
    }
  },
  {
    id: "digital-divide-education",
    title: "Addressing the Digital Divide in Education",
    prompt: "The digital divide—the gap between students who have access to technology and internet resources and those who don't—has become a critical issue in modern education, especially highlighted during remote learning periods. Write an essay that identifies the specific challenges this divide creates for student success and proposes a practical solution that schools, communities, or governments could implement. Your solution should address both access issues and support systems needed for effective technology use in education.",
    templateIds: ["problem-solution-structured"],
    difficulty: "hard",
    topic: "Education and Technology",
    keywords: ["digital divide", "technology access", "education equity", "remote learning", "student success"],
    rubric: {
      excellent: "Demonstrates deep understanding of complex issues with innovative, well-reasoned solutions",
      good: "Clear analysis of the problem with practical, feasible solution proposals",
      fair: "Basic understanding with adequate solution but limited consideration of complexities",
      poor: "Superficial analysis with unrealistic solutions and poor understanding of issues"
    }
  },

  // Cause and Effect Prompts
  {
    id: "social-media-behavior-change",
    title: "Social Media's Impact on Social Behavior",
    prompt: "Social media platforms have fundamentally changed how people interact, form relationships, and perceive themselves and others. Write an essay analyzing the causes behind the widespread adoption of social media and examining both the immediate and long-term effects on social behavior, communication patterns, and relationship formation. Consider both positive and negative effects, and support your analysis with specific examples and evidence.",
    templateIds: ["cause-effect-analytical"],
    difficulty: "medium",
    topic: "Social Media and Psychology",
    keywords: ["social media", "behavior change", "relationships", "communication", "psychological effects"],
    rubric: {
      excellent: "Sophisticated analysis of complex causal relationships with nuanced understanding of effects",
      good: "Clear identification of causes and effects with adequate supporting evidence",
      fair: "Basic cause-effect analysis with some evidence but limited depth",
      poor: "Weak analysis with unclear causal relationships and insufficient evidence"
    }
  },
  {
    id: "climate-change-youth-activism",
    title: "Rise of Youth Climate Activism",
    prompt: "In recent years, young people worldwide have become increasingly involved in climate activism, from school strikes to global protests to policy advocacy. Analyze what factors have caused this surge in youth environmental activism and examine the effects this movement has had on environmental policy, public awareness, and youth culture itself. Consider both the immediate impacts and potential long-term consequences of this phenomenon.",
    templateIds: ["cause-effect-analytical"],
    difficulty: "hard",
    topic: "Climate Change and Social Movements",
    keywords: ["youth activism", "climate change", "environmental movement", "policy change", "social movements"],
    rubric: {
      excellent: "Demonstrates comprehensive understanding of complex social and political factors with insightful analysis",
      good: "Clear analysis of causes and effects with good supporting evidence and examples",
      fair: "Basic understanding with adequate analysis but limited consideration of complexities",
      poor: "Superficial analysis with weak evidence and poor understanding of causal relationships"
    }
  },

  // Narrative Prompts
  {
    id: "overcoming-failure-experience",
    title: "Learning from Failure",
    prompt: "Write a narrative essay about a time when you experienced a significant failure, setback, or disappointment. Focus not just on what happened, but on how the experience changed your perspective, approach, or understanding of yourself. Your essay should include vivid details about the experience, your emotional journey through it, and the lasting impact it has had on your life. Reflect on what this experience taught you and how it continues to influence your decisions and attitudes today.",
    templateIds: ["narrative-personal-reflective"],
    difficulty: "medium",
    topic: "Personal Growth and Resilience",
    keywords: ["failure", "personal growth", "resilience", "self-discovery", "life lessons"],
    rubric: {
      excellent: "Compelling narrative with deep reflection and meaningful insights about personal growth",
      good: "Engaging story with clear reflection on lessons learned and personal development",
      fair: "Basic narrative with some reflection but limited insight or development",
      poor: "Weak storytelling with little reflection or meaningful connection to growth"
    }
  },
  {
    id: "cultural-identity-discovery",
    title: "Discovering Cultural Identity",
    prompt: "Write a narrative essay about a moment or experience when you gained a deeper understanding of your cultural identity or heritage. This might involve a family tradition, a visit to a significant place, an encounter with discrimination, or a realization about your place in a community. Focus on the specific details of the experience and reflect on how it shaped your understanding of yourself and your place in the world.",
    templateIds: ["narrative-personal-reflective"],
    difficulty: "medium",
    topic: "Cultural Identity and Belonging",
    keywords: ["cultural identity", "heritage", "belonging", "self-discovery", "community"],
    rubric: {
      excellent: "Powerful narrative that explores cultural identity with depth, insight, and universal appeal",
      good: "Engaging story with meaningful reflection on cultural identity and personal growth",
      fair: "Clear narrative with adequate reflection but limited depth or insight",
      poor: "Basic story with little reflection on cultural significance or personal impact"
    }
  },

  // Expository/Informative Prompts
  {
    id: "renewable-energy-technologies",
    title: "Modern Renewable Energy Solutions",
    prompt: "Write an informative essay explaining the current state of renewable energy technology and its role in addressing climate change and energy needs. Focus on three major types of renewable energy (such as solar, wind, hydroelectric, geothermal, or biomass), explaining how each technology works, its advantages and limitations, and current developments in the field. Conclude by discussing the future outlook for renewable energy and its potential impact on society and the environment.",
    templateIds: ["expository-informative-structured"],
    difficulty: "medium",
    topic: "Energy and Environment",
    keywords: ["renewable energy", "solar power", "wind energy", "sustainability", "climate change"],
    rubric: {
      excellent: "Comprehensive, well-organized explanation with accurate information and clear synthesis",
      good: "Clear explanation of renewable energy with adequate detail and organization",
      fair: "Basic information presented with some organization but limited depth",
      poor: "Unclear or inaccurate information with poor organization and development"
    }
  },
  {
    id: "mental-health-awareness",
    title: "Understanding Mental Health in Adolescents",
    prompt: "Write an informative essay explaining the current understanding of mental health challenges among teenagers and young adults. Discuss the most common mental health conditions affecting this age group, the factors that contribute to mental health struggles, and the resources and treatments available. Include information about how to recognize signs of mental health issues and the importance of seeking help. Your essay should be informative and supportive, aimed at increasing understanding and reducing stigma.",
    templateIds: ["expository-informative-structured"],
    difficulty: "medium",
    topic: "Mental Health and Wellness",
    keywords: ["mental health", "adolescents", "depression", "anxiety", "wellness", "treatment"],
    rubric: {
      excellent: "Sensitive, comprehensive explanation with accurate information and helpful insights",
      good: "Clear, informative discussion with adequate detail and appropriate tone",
      fair: "Basic information presented clearly but with limited depth or insight",
      poor: "Unclear or potentially harmful information with poor organization"
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