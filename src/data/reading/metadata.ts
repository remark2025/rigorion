import { PassageMetadata } from './types';

export const PASSAGE_METADATA: PassageMetadata[] = [
  {
    id: 1,
    title: "Climate Change and Global Action",
    category: "Science",
    difficulty: "Medium",
    questionCount: 3,
    imageUrl: "/resources/passages/climate-change.jpg",
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
    imageUrl: "/resources/sphere-3d-model-3840x2160-10993.jpg",
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
    imageUrl: "/resources/carbonwallpaper.jpg",
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
    imageUrl: "/resources/hero5.webp",
    description: "How American authors have portrayed the pursuit of success and happiness",
    estimatedTime: 9,
    tags: ["American literature", "themes", "social commentary"]
  },
  {
    id: 5,
    title: "The Quantum Computing Revolution",
    category: "Science",
    difficulty: "Hard",
    questionCount: 2,
    imageUrl: "/resources/passages/quantum-computing.jpg",
    description: "Understanding quantum bits and the future of computational technology",
    estimatedTime: 12,
    tags: ["quantum computing", "technology", "superposition"]
  },
  {
    id: 6,
    title: "The Space Race: Competition and Cooperation",
    category: "History",
    difficulty: "Medium",
    questionCount: 2,
    imageUrl: "/resources/passages/space-race.jpg",
    description: "How Cold War rivalry led to unprecedented space exploration achievements",
    estimatedTime: 10,
    tags: ["space exploration", "Cold War", "cooperation"]
  },
  {
    id: 7,
    title: "The Garden of Lost Dreams",
    category: "Literature",
    difficulty: "Medium",
    questionCount: 2,
    imageUrl: "/resources/passages/coming-of-age.jpg",
    description: "A coming-of-age story about growth, change, and accepting imperfection",
    estimatedTime: 9,
    tags: ["coming of age", "metaphor", "personal growth"]
  },
  {
    id: 8,
    title: "Artificial Intelligence: Promise and Peril",
    category: "Technology",
    difficulty: "Hard",
    questionCount: 2,
    imageUrl: "/resources/passages/ai-technology.jpg",
    description: "Exploring AI's benefits and risks across healthcare, jobs, and society",
    estimatedTime: 11,
    tags: ["artificial intelligence", "automation", "ethics"]
  },
  {
    id: 9,
    title: "Reimagining Cities: Sustainable Urban Planning",
    category: "Social Science",
    difficulty: "Medium",
    questionCount: 2,
    imageUrl: "/resources/passages/urban-planning.jpg",
    description: "How cities are adapting to create sustainable, livable communities",
    estimatedTime: 10,
    tags: ["urban planning", "sustainability", "15-minute cities"]
  },
  {
    id: 10,
    title: "Shakespeare's Modern Influence",
    category: "Literature",
    difficulty: "Medium",
    questionCount: 3,
    imageUrl: "/resources/whiteone.jpg.jpg",
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
    imageUrl: "/resources/sphere-3d-model-3840x2160-10993.jpg",
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
    imageUrl: "/resources/wallpaper.webp",
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
    imageUrl: "/resources/carbonwallpaper.jpg",
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