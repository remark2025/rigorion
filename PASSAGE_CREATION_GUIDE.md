# SAT Reading Passage Creation Guide

## 📁 Architecture Overview

```
src/data/reading/
├── types.ts                 # TypeScript interfaces
├── categories.ts            # Category definitions
├── metadata.ts              # Passage metadata (cards display)
├── passages/
│   ├── index.ts            # Main passage registry
│   ├── science/
│   │   ├── climate-change.ts
│   │   └── [new-science-passage].ts
│   ├── history/
│   │   └── [history-passages].ts
│   ├── literature/
│   │   └── [literature-passages].ts
│   ├── social-science/
│   │   └── [social-science-passages].ts
│   └── technology/
│       └── digital-privacy.ts
└── index.ts                # Main exports

src/services/
└── readingService.ts       # Business logic & caching

src/utils/
└── passageGenerator.ts     # Templates & validation
```

## 🚀 How to Add a New Passage

### Step 1: Create Image
1. Add image to: `/public/resources/passages/[passage-name].webp`
2. Use descriptive filename: `renewable-energy.webp`
3. Recommended size: 800x600px, WebP format

### Step 2: Create Passage File
```typescript
// src/data/reading/passages/science/renewable-energy.ts
import { PassageContent } from '../../types';

export const renewableEnergyPassage: PassageContent = {
  id: 14,
  title: "Renewable Energy Solutions",
  text: `Your passage text here...`,
  highlights: {
    evidence: ["Specific facts with data"],
    toneShifters: ["However", "Nevertheless"],
    transitions: ["Furthermore", "Moreover"],
    difficult: {
      "photovoltaic": "Converting light into electricity",
      "intermittent": "Occurring at irregular intervals"
    }
  },
  questions: [
    // 3-4 questions with different types
  ]
};
```

### Step 3: Add to Metadata
```typescript
// src/data/reading/metadata.ts
{
  id: 14,
  title: "Renewable Energy Solutions",
  category: "Science",
  difficulty: "Easy",
  questionCount: 3,
  imageUrl: "/resources/passages/renewable-energy.webp",
  description: "Exploring sustainable energy technologies",
  estimatedTime: 7,
  tags: ["sustainability", "technology", "environment"]
}
```

### Step 4: Register Passage
```typescript
// src/data/reading/passages/index.ts
import { renewableEnergyPassage } from './science/renewable-energy';

const PASSAGE_REGISTRY: Record<number, PassageContent> = {
  // existing passages...
  14: renewableEnergyPassage,
};
```

## 📝 Writing Guidelines

### Passage Structure
- **Length**: 300-500 words (SAT standard)
- **Paragraphs**: 4-6 paragraphs
- **Reading Level**: Appropriate for high school students
- **Topics**: Academic, informative, objective

### Required Elements
1. **Evidence**: Statistics, research findings, expert quotes
2. **Transitions**: Clear paragraph connections
3. **Tone Shifters**: Words that change argument direction
4. **Vocabulary**: 3-5 challenging words with definitions

### Question Types (3-4 per passage)
- **Main Idea**: Central theme or purpose
- **Inference**: What can be concluded
- **Evidence**: Supporting facts and data
- **Tone**: Author's attitude
- **Vocabulary**: Word meanings in context
- **Purpose**: Why the author wrote this

## 🎯 Quality Checklist

### Content Quality
- [ ] Engaging, informative topic
- [ ] Clear thesis and supporting arguments
- [ ] Appropriate academic vocabulary
- [ ] Logical paragraph structure
- [ ] Factual accuracy

### Technical Requirements
- [ ] Unique ID number
- [ ] Proper TypeScript types
- [ ] 3-4 well-crafted questions
- [ ] Meaningful hints for each question
- [ ] Highlighted elements identified
- [ ] Image in correct directory

### Testing
- [ ] Passage loads correctly
- [ ] All highlights work
- [ ] Questions display properly
- [ ] Answers and hints are accurate
- [ ] Image displays correctly

## 🔧 Development Tools

### Template Generator
```typescript
import { createPassageTemplate } from '@/utils/passageGenerator';

const { metadata, content } = createPassageTemplate(
  15, 
  "Your Passage Title", 
  "Science", 
  "Medium"
);
```

### Validation
```typescript
import { validatePassage } from '@/utils/passageGenerator';

const errors = validatePassage(metadata, content);
if (errors.length > 0) {
  console.log("Fix these issues:", errors);
}
```

## 📊 Current Statistics

- **Total Passages**: 13
- **Categories**: 5 (Science, History, Literature, Social Science, Technology)
- **Difficulties**: Easy (4), Medium (6), Hard (3)

## 🎨 Image Guidelines

### Technical Specs
- **Format**: WebP (preferred) or JPG
- **Size**: 800x600px minimum
- **Quality**: High resolution, clear details
- **Style**: Professional, relevant to topic

### Content Guidelines
- Directly related to passage topic
- Educational/academic aesthetic
- Avoid copyrighted material
- Use stock photos or original images

## 🚀 Ready for Production

The architecture is now **100% ready** for:
- ✅ Easy passage addition
- ✅ Individual images per passage
- ✅ Type safety with TypeScript
- ✅ Caching and performance
- ✅ Search and filtering
- ✅ Validation tools
- ✅ Scalable file structure

Add new passages following this guide, and the system will automatically include them in the reading interface!