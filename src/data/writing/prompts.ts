export interface SATWritingPrompt {
  id: string;
  category: string;
  title: string;
  passage?: string;
  question: string;
  timeLimit: number;
  expectedLength: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export const SAT_WRITING_CATEGORIES = [
  { id: 'argumentative', label: 'Argumentative Essays', icon: '⚖️' },
  { id: 'analytical', label: 'Analytical Essays', icon: '🔍' },
  { id: 'narrative', label: 'Narrative Essays', icon: '📖' },
  { id: 'expository', label: 'Expository Essays', icon: '📝' },
  { id: 'persuasive', label: 'Persuasive Essays', icon: '💭' }
];

export const SAT_WRITING_PROMPTS: SATWritingPrompt[] = [
  // Argumentative Essays
  {
    id: 'arg-social-media',
    category: 'argumentative',
    title: 'Social Media and Mental Health',
    passage: `Social media has fundamentally changed how people communicate and share information. While these platforms offer unprecedented connectivity, they also present significant challenges to mental health, particularly among teenagers.

Research conducted by various universities has shown that excessive social media use correlates with increased rates of anxiety and depression in young people. The constant comparison with others' carefully curated posts can lead to feelings of inadequacy and low self-worth.

However, social media also provides valuable benefits. It allows people to maintain relationships across long distances, access educational content, and find communities of support for various interests and challenges.`,
    question: 'Write a well-organized essay in which you develop a position on whether the benefits of social media outweigh its potential harm to mental health. Use appropriate evidence and examples to support your argument.',
    timeLimit: 50,
    expectedLength: '400-600 words',
    difficulty: 'Medium',
    tags: ['technology', 'health', 'society']
  },
  {
    id: 'arg-climate-action',
    category: 'argumentative',
    title: 'Climate Change and Individual Responsibility',
    passage: `Climate change represents one of the most pressing challenges of the 21st century. While governments and corporations play crucial roles in addressing environmental issues, there is ongoing debate about the extent to which individual actions can make a meaningful difference.

Some argue that personal choices like reducing energy consumption, using public transportation, and making sustainable purchasing decisions collectively create significant impact. Others contend that systemic changes in policy and industry practices are far more important than individual behavior modifications.

Recent studies suggest that while individual actions alone cannot solve climate change, they can contribute to broader cultural shifts that influence policy and corporate behavior.`,
    question: 'Write an essay arguing whether individual actions or systemic changes are more important in addressing climate change. Support your position with logical reasoning and relevant examples.',
    timeLimit: 50,
    expectedLength: '400-600 words',
    difficulty: 'Hard',
    tags: ['environment', 'responsibility', 'policy']
  },
  {
    id: 'arg-education-technology',
    category: 'argumentative',
    title: 'Technology in Education',
    passage: `The integration of technology in education has accelerated dramatically, especially following the global shift to remote learning. Digital tools offer unprecedented access to information and interactive learning experiences.

Proponents argue that technology enhances engagement, personalizes learning, and prepares students for a digital future. Critics worry about screen time, reduced face-to-face interaction, and the digital divide that may disadvantage some students.

Research shows mixed results, with some studies indicating improved outcomes in certain subjects while others suggest potential negative effects on attention span and social skills.`,
    question: 'Develop an argument about whether the benefits of educational technology outweigh its potential drawbacks. Use specific examples and evidence to support your position.',
    timeLimit: 50,
    expectedLength: '400-600 words',
    difficulty: 'Medium',
    tags: ['education', 'technology', 'learning']
  },

  // Analytical Essays
  {
    id: 'ana-literature-themes',
    category: 'analytical',
    title: 'Analyzing Literary Themes',
    passage: `In Harper Lee's "To Kill a Mockingbird," the symbol of the mockingbird appears multiple times throughout the narrative. Atticus tells his children that it's a sin to kill a mockingbird because they do nothing but sing beautiful songs for people to enjoy.

This symbol extends to several characters in the novel, particularly Tom Robinson and Boo Radley, who are innocent individuals harmed by the prejudices and assumptions of others. The mockingbird represents the destruction of innocence and the consequences of moral blindness in society.

The author uses this recurring symbol to explore themes of justice, morality, and the loss of innocence in a complex social environment.`,
    question: 'Analyze how Harper Lee uses the mockingbird symbol to develop the novel\'s central themes. Discuss specific examples and explain their significance to the overall meaning of the work.',
    timeLimit: 45,
    expectedLength: '350-500 words',
    difficulty: 'Hard',
    tags: ['literature', 'symbolism', 'analysis']
  },
  {
    id: 'ana-historical-impact',
    category: 'analytical',
    title: 'Historical Event Analysis',
    passage: `The Industrial Revolution fundamentally transformed society, economy, and daily life between the late 18th and early 19th centuries. This period saw unprecedented technological advancement, urbanization, and changes in labor practices.

While the Industrial Revolution brought about increased productivity, improved transportation, and eventual rises in living standards, it also created significant social problems including poor working conditions, child labor, and environmental degradation.

The effects of industrialization continue to influence modern society, from our economic systems to our relationship with technology and the environment.`,
    question: 'Analyze the long-term impact of the Industrial Revolution on modern society. Consider both positive and negative consequences and explain how these effects are still visible today.',
    timeLimit: 45,
    expectedLength: '350-500 words',
    difficulty: 'Medium',
    tags: ['history', 'society', 'economics']
  },

  // Narrative Essays
  {
    id: 'nar-personal-growth',
    category: 'narrative',
    title: 'A Moment of Personal Growth',
    question: 'Write a narrative essay about a specific moment or experience that led to significant personal growth or a change in your perspective. Include vivid details and reflect on the importance of this experience in shaping who you are today.',
    timeLimit: 40,
    expectedLength: '350-500 words',
    difficulty: 'Easy',
    tags: ['personal', 'growth', 'reflection']
  },
  {
    id: 'nar-overcoming-challenge',
    category: 'narrative',
    title: 'Overcoming a Challenge',
    question: 'Describe a time when you faced a significant challenge or obstacle. Narrate the experience, including your thoughts, feelings, and actions. Explain what you learned from this experience and how it has influenced your approach to future challenges.',
    timeLimit: 40,
    expectedLength: '350-500 words',
    difficulty: 'Easy',
    tags: ['challenge', 'perseverance', 'learning']
  },

  // Expository Essays
  {
    id: 'exp-career-exploration',
    category: 'expository',
    title: 'Career Path Exploration',
    question: 'Choose a career that interests you and explain the education, skills, and personal qualities required for success in this field. Discuss the challenges and rewards of this career path and explain why it appeals to you.',
    timeLimit: 45,
    expectedLength: '400-550 words',
    difficulty: 'Medium',
    tags: ['career', 'education', 'planning']
  },
  {
    id: 'exp-cultural-tradition',
    category: 'expository',
    title: 'Cultural Traditions and Values',
    question: 'Explain a cultural tradition, custom, or value that is important in your family or community. Describe its origins, how it is practiced, and why it remains significant. Discuss how this tradition has influenced your own values and beliefs.',
    timeLimit: 45,
    expectedLength: '400-550 words',
    difficulty: 'Medium',
    tags: ['culture', 'tradition', 'values']
  },

  // Persuasive Essays
  {
    id: 'per-school-policy',
    category: 'persuasive',
    title: 'School Policy Proposal',
    question: 'Identify a policy or rule in your school that you believe should be changed. Write a persuasive essay proposing the change, explaining why the current policy is problematic, and providing compelling reasons why your proposed change would be beneficial.',
    timeLimit: 45,
    expectedLength: '400-550 words',
    difficulty: 'Medium',
    tags: ['school', 'policy', 'change']
  },
  {
    id: 'per-community-service',
    category: 'persuasive',
    title: 'Community Service Requirements',
    question: 'Write a persuasive essay arguing whether high schools should require students to complete community service hours for graduation. Present a clear position and support it with logical arguments, evidence, and examples.',
    timeLimit: 45,
    expectedLength: '400-550 words',
    difficulty: 'Medium',
    tags: ['community', 'service', 'education']
  }
];

export const getPromptsByCategory = (categoryId: string): SATWritingPrompt[] => {
  return SAT_WRITING_PROMPTS.filter(prompt => prompt.category === categoryId);
};

export const getPromptById = (promptId: string): SATWritingPrompt | undefined => {
  return SAT_WRITING_PROMPTS.find(prompt => prompt.id === promptId);
};

export const getAllCategories = () => {
  return SAT_WRITING_CATEGORIES;
};