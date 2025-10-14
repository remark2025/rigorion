export interface MathSkill {
  id: number;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  imageUrl: string;
  description: string;
  estimatedTime: number;
  tags: string[];
}

export const SAT_MATH_SKILLS: MathSkill[] = [
  // Algebra Category
  {
    id: 1,
    title: "Linear Equations",
    category: "Algebra",
    difficulty: "Easy",
    questionCount: 15,
    imageUrl: "/resources/sphere-3d-model-3840x2160-10993.jpg",
    description: "Solve linear equations and systems of equations",
    estimatedTime: 8,
    tags: ["algebra", "equations", "solving"]
  },
  {
    id: 2,
    title: "Quadratic Functions",
    category: "Algebra",
    difficulty: "Medium",
    questionCount: 12,
    imageUrl: "/resources/carbonwallpaper.jpg",
    description: "Work with quadratic equations, parabolas, and factoring",
    estimatedTime: 10,
    tags: ["algebra", "quadratics", "parabolas"]
  },
  {
    id: 3,
    title: "Inequalities",
    category: "Algebra",
    difficulty: "Medium",
    questionCount: 8,
    imageUrl: "/resources/wallpaper.webp",
    description: "Solve linear and quadratic inequalities",
    estimatedTime: 7,
    tags: ["algebra", "inequalities", "graphing"]
  },
  {
    id: 4,
    title: "Systems of Equations",
    category: "Algebra",
    difficulty: "Hard",
    questionCount: 10,
    imageUrl: "/resources/hero5.webp",
    description: "Solve systems using substitution and elimination",
    estimatedTime: 12,
    tags: ["algebra", "systems", "elimination"]
  },
  {
    id: 5,
    title: "Polynomials",
    category: "Algebra",
    difficulty: "Hard",
    questionCount: 9,
    imageUrl: "/resources/mywall.jpg",
    description: "Factor polynomials and work with polynomial operations",
    estimatedTime: 11,
    tags: ["algebra", "polynomials", "factoring"]
  },

  // Geometry Category
  {
    id: 6,
    title: "Area and Perimeter",
    category: "Geometry",
    difficulty: "Easy",
    questionCount: 14,
    imageUrl: "/resources/4k-white-two-skyscrapers-j25128ysdyqlmeo6.jpg",
    description: "Calculate area and perimeter of various shapes",
    estimatedTime: 6,
    tags: ["geometry", "area", "perimeter"]
  },
  {
    id: 7,
    title: "Volume and Surface Area",
    category: "Geometry",
    difficulty: "Medium",
    questionCount: 11,
    imageUrl: "/resources/white-abstract-fading-horse-os2b11l2drnjvlqz.jpg",
    description: "Work with 3D shapes and their properties",
    estimatedTime: 9,
    tags: ["geometry", "volume", "3d-shapes"]
  },
  {
    id: 8,
    title: "Circles",
    category: "Geometry",
    difficulty: "Medium",
    questionCount: 13,
    imageUrl: "/resources/corner-building-for-4k-white-background-tsx7c82luhg36ygy.jpg",
    description: "Circle properties, circumference, area, and arc length",
    estimatedTime: 8,
    tags: ["geometry", "circles", "arc"]
  },
  {
    id: 9,
    title: "Right Triangles",
    category: "Geometry",
    difficulty: "Medium",
    questionCount: 12,
    imageUrl: "/resources/whiteone.jpg.jpg",
    description: "Pythagorean theorem and trigonometric ratios",
    estimatedTime: 10,
    tags: ["geometry", "triangles", "trigonometry"]
  },
  {
    id: 10,
    title: "Coordinate Geometry",
    category: "Geometry",
    difficulty: "Hard",
    questionCount: 10,
    imageUrl: "/resources/carbonwallpaper.jpg",
    description: "Lines, slopes, and geometric relationships on coordinate plane",
    estimatedTime: 11,
    tags: ["geometry", "coordinates", "slopes"]
  },

  // Statistics Category
  {
    id: 11,
    title: "Mean, Median, Mode",
    category: "Statistics",
    difficulty: "Easy",
    questionCount: 16,
    imageUrl: "/resources/sphere-3d-model-3840x2160-10993.jpg",
    description: "Calculate measures of central tendency",
    estimatedTime: 5,
    tags: ["statistics", "mean", "median"]
  },
  {
    id: 12,
    title: "Data Interpretation",
    category: "Statistics",
    difficulty: "Medium",
    questionCount: 14,
    imageUrl: "/resources/hero5.webp",
    description: "Read and interpret graphs, charts, and tables",
    estimatedTime: 8,
    tags: ["statistics", "graphs", "interpretation"]
  },
  {
    id: 13,
    title: "Probability",
    category: "Statistics",
    difficulty: "Medium",
    questionCount: 12,
    imageUrl: "/resources/wallpaper.webp",
    description: "Calculate probability of events and combinations",
    estimatedTime: 9,
    tags: ["statistics", "probability", "combinations"]
  },
  {
    id: 14,
    title: "Scatterplots",
    category: "Statistics",
    difficulty: "Hard",
    questionCount: 8,
    imageUrl: "/resources/mywall.jpg",
    description: "Analyze correlation and linear regression",
    estimatedTime: 10,
    tags: ["statistics", "correlation", "regression"]
  },
  {
    id: 15,
    title: "Standard Deviation",
    category: "Statistics",
    difficulty: "Hard",
    questionCount: 7,
    imageUrl: "/resources/white-abstract-fading-horse-os2b11l2drnjvlqz.jpg",
    description: "Calculate and interpret standard deviation",
    estimatedTime: 12,
    tags: ["statistics", "deviation", "variance"]
  },

  // Functions Category
  {
    id: 16,
    title: "Function Notation",
    category: "Functions",
    difficulty: "Easy",
    questionCount: 13,
    imageUrl: "/resources/4k-white-two-skyscrapers-j25128ysdyqlmeo6.jpg",
    description: "Understand and evaluate function notation",
    estimatedTime: 6,
    tags: ["functions", "notation", "evaluation"]
  },
  {
    id: 17,
    title: "Linear Functions",
    category: "Functions",
    difficulty: "Medium",
    questionCount: 11,
    imageUrl: "/resources/corner-building-for-4k-white-background-tsx7c82luhg36ygy.jpg",
    description: "Graph and analyze linear functions",
    estimatedTime: 7,
    tags: ["functions", "linear", "graphing"]
  },
  {
    id: 18,
    title: "Exponential Functions",
    category: "Functions",
    difficulty: "Hard",
    questionCount: 9,
    imageUrl: "/resources/carbonwallpaper.jpg",
    description: "Work with exponential growth and decay",
    estimatedTime: 11,
    tags: ["functions", "exponential", "growth"]
  },
  {
    id: 19,
    title: "Transformations",
    category: "Functions",
    difficulty: "Hard",
    questionCount: 8,
    imageUrl: "/resources/whiteone.jpg.jpg",
    description: "Function transformations and shifts",
    estimatedTime: 10,
    tags: ["functions", "transformations", "shifts"]
  },
  {
    id: 20,
    title: "Inverse Functions",
    category: "Functions",
    difficulty: "Hard",
    questionCount: 6,
    imageUrl: "/resources/wallpaper.webp",
    description: "Find and work with inverse functions",
    estimatedTime: 13,
    tags: ["functions", "inverse", "operations"]
  }
];

export const getMathSkillsByCategory = (category: string): MathSkill[] => {
  return SAT_MATH_SKILLS.filter(skill => skill.category === category);
};

export const getMathSkillById = (id: number): MathSkill | undefined => {
  return SAT_MATH_SKILLS.find(skill => skill.id === id);
};

export const getAllMathCategories = (): string[] => {
  return [...new Set(SAT_MATH_SKILLS.map(skill => skill.category))];
};