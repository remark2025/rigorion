import { PassageMetadata } from './types';

export const PASSAGE_METADATA: PassageMetadata[] = [
  {
    id: 1,
    title: "Climate Change and Global Action",
    category: "Science",
    difficulty: "Medium",
    questionCount: 3,
    imageUrl: "/resources/passages/climate-change.webp",
    description: "Exploring the scientific evidence and global response to climate change",
    estimatedTime: 8,
    tags: ["environment", "global warming", "policy"]
  },
  {
    id: 2,
    title: "The Impact of Social Media",
    category: "Social Science",
    difficulty: "Easy",
    questionCount: 3,
    imageUrl: "/resources/passages/social-media.webp",
    description: "Analyzing how social platforms shape modern communication and society",
    estimatedTime: 6,
    tags: ["technology", "communication", "society"]
  },
  {
    id: 3,
    title: "Evolution of Artificial Intelligence",
    category: "Technology",
    difficulty: "Hard",
    questionCount: 3,
    imageUrl: "/resources/passages/artificial-intelligence.webp",
    description: "From early computing to modern AI and its implications for the future",
    estimatedTime: 10,
    tags: ["AI", "machine learning", "future technology"]
  },
  {
    id: 4,
    title: "The American Dream in Literature",
    category: "Literature",
    difficulty: "Medium",
    questionCount: 4,
    imageUrl: "/resources/passages/american-dream.webp",
    description: "How American authors have portrayed the pursuit of success and happiness",
    estimatedTime: 9,
    tags: ["American literature", "themes", "social commentary"]
  },
  {
    id: 5,
    title: "Democracy and Civic Engagement",
    category: "History",
    difficulty: "Medium",
    questionCount: 4,
    imageUrl: "/resources/passages/democracy.webp",
    description: "The evolution of democratic institutions and citizen participation",
    estimatedTime: 9,
    tags: ["government", "political participation", "civic duty"]
  },
  {
    id: 6,
    title: "Renewable Energy Solutions",
    category: "Science",
    difficulty: "Easy",
    questionCount: 3,
    imageUrl: "/resources/passages/renewable-energy.webp",
    description: "Solar, wind, and other sustainable energy technologies",
    estimatedTime: 7,
    tags: ["sustainability", "green technology", "environment"]
  },
  {
    id: 7,
    title: "The Psychology of Memory",
    category: "Social Science",
    difficulty: "Hard",
    questionCount: 4,
    imageUrl: "/resources/passages/memory-psychology.webp",
    description: "How human memory works and why we forget",
    estimatedTime: 11,
    tags: ["cognitive science", "neuroscience", "learning"]
  },
  {
    id: 8,
    title: "Ancient Roman Architecture",
    category: "History",
    difficulty: "Medium",
    questionCount: 3,
    imageUrl: "/resources/passages/roman-architecture.webp",
    description: "Engineering marvels that influenced Western architectural traditions",
    estimatedTime: 8,
    tags: ["architecture", "engineering", "ancient civilizations"]
  },
  {
    id: 9,
    title: "Genetic Engineering Ethics",
    category: "Science",
    difficulty: "Hard",
    questionCount: 4,
    imageUrl: "/resources/passages/genetic-engineering.webp",
    description: "The moral and practical implications of modifying human DNA",
    estimatedTime: 12,
    tags: ["bioethics", "genetics", "medical technology"]
  },
  {
    id: 10,
    title: "Shakespeare's Modern Influence",
    category: "Literature",
    difficulty: "Medium",
    questionCount: 3,
    imageUrl: "/resources/passages/shakespeare.webp",
    description: "How the Bard's works continue to shape contemporary culture",
    estimatedTime: 8,
    tags: ["Shakespeare", "cultural influence", "drama"]
  },
  {
    id: 11,
    title: "Digital Privacy and Surveillance",
    category: "Technology",
    difficulty: "Medium",
    questionCount: 3,
    imageUrl: "/resources/passages/digital-privacy.webp",
    description: "Balancing security needs with personal privacy in the digital age",
    estimatedTime: 9,
    tags: ["privacy", "surveillance", "digital rights"]
  },
  {
    id: 12,
    title: "The Renaissance Art Movement",
    category: "History",
    difficulty: "Easy",
    questionCount: 3,
    imageUrl: "/resources/passages/renaissance-art.webp",
    description: "Artistic innovation and cultural transformation in Renaissance Europe",
    estimatedTime: 7,
    tags: ["art history", "Renaissance", "cultural movements"]
  },
  {
    id: 13,
    title: "Behavioral Economics Principles",
    category: "Social Science",
    difficulty: "Hard",
    questionCount: 3,
    imageUrl: "/resources/passages/behavioral-economics.webp",
    description: "Why people don't always make rational economic decisions",
    estimatedTime: 10,
    tags: ["economics", "psychology", "decision making"]
  }
];

export const getPassagesByCategory = (category: string): PassageMetadata[] => {
  return PASSAGE_METADATA.filter(passage => passage.category === category);
};

export const getPassageById = (id: number): PassageMetadata | undefined => {
  return PASSAGE_METADATA.find(passage => passage.id === id);
};

export const getAllCategories = (): string[] => {
  return [...new Set(PASSAGE_METADATA.map(passage => passage.category))];
};