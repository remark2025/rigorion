import { PassageContent } from '../../types';

export const urbanPlanningPassage: PassageContent = {
  id: 9,
  title: "Reimagining Cities: Sustainable Urban Planning",
  imageUrl: "/resources/passages/urban-planning.jpg",
  text: `As global urbanization accelerates, with more than half the world's population now living in cities, urban planners face the unprecedented challenge of creating sustainable, livable communities that can accommodate rapid growth while minimizing environmental impact.

Traditional urban development patterns, characterized by sprawling suburbs and car-dependent infrastructure, have proven environmentally and economically unsustainable. These models contribute significantly to greenhouse gas emissions, consume vast amounts of land, and create social isolation by separating residential areas from commercial and employment centers.

In response, progressive cities worldwide are embracing principles of sustainable urban design. Copenhagen, for instance, has implemented an extensive bicycle infrastructure that encourages non-motorized transportation, reducing both emissions and traffic congestion. Meanwhile, Singapore has pioneered vertical farming techniques that allow fresh produce cultivation within the urban core, reducing food transportation costs and increasing food security.

The concept of "15-minute cities" represents another innovative approach to urban planning. This model aims to ensure that residents can access most daily necessities—work, education, healthcare, shopping, and recreation—within a 15-minute walk or bike ride from their homes. Paris has committed to implementing this vision, redesigning neighborhoods to be more self-contained and reducing reliance on long-distance commuting.

However, sustainable urban planning faces significant obstacles. Existing infrastructure represents enormous sunk costs that make wholesale redevelopment economically challenging. Additionally, zoning laws and building codes, often written decades ago, may impede innovative development approaches. Political resistance from communities concerned about change can also slow implementation of new planning models.

Furthermore, gentrification poses a serious threat to sustainable urban development. As neighborhoods become more desirable through improved planning and amenities, rising property values can displace long-term residents, particularly low-income families. This paradox highlights the need for inclusive planning approaches that consider social equity alongside environmental goals.

Successful sustainable urban planning requires integrated thinking that considers transportation, housing, employment, and environmental systems as interconnected elements rather than separate domains. It also demands meaningful community engagement to ensure that development serves existing residents rather than displacing them.

The cities that successfully navigate these challenges will serve as models for the majority of humanity that will live in urban areas by 2050. Their innovations in sustainable design, transportation, and community building may well determine whether urbanization becomes a solution to global challenges or exacerbates them.`,
  
  highlights: {
    evidence: [
      "more than half the world's population now living in cities",
      "Copenhagen has implemented an extensive bicycle infrastructure that encourages non-motorized transportation",
      "Singapore has pioneered vertical farming techniques that allow fresh produce cultivation within the urban core",
      "Paris has committed to implementing this vision, redesigning neighborhoods to be more self-contained"
    ],
    toneShifters: [
      "In response",
      "However",
      "Additionally",
      "Furthermore"
    ],
    transitions: [
      "Meanwhile",
      "However",
      "Additionally",
      "Furthermore"
    ],
    mainIdeas: [
      "Global urbanization creates challenges for sustainable city development",
      "Traditional urban sprawl is environmentally and economically unsustainable",
      "Cities like Copenhagen, Singapore, and Paris are pioneering sustainable approaches",
      "Obstacles include infrastructure costs, regulations, and gentrification concerns"
    ]
  },
  
  questions: [
    {
      id: "q1",
      text: "According to the passage, what is a primary goal of the '15-minute city' concept?",
      options: [
        "Reducing the time needed for urban construction projects",
        "Ensuring residents can access daily necessities within a short distance",
        "Limiting the number of vehicles allowed in city centers",
        "Creating neighborhoods with exactly 15 minutes of commute time"
      ],
      correct: 1,
      explanation: "The passage explains that the 15-minute city model 'aims to ensure that residents can access most daily necessities—work, education, healthcare, shopping, and recreation—within a 15-minute walk or bike ride from their homes.'"
    },
    {
      id: "q2",
      text: "The author suggests that gentrification poses a threat to sustainable urban development because it:",
      options: [
        "Increases traffic congestion in improved neighborhoods",
        "Prevents the implementation of bicycle infrastructure",
        "Can displace long-term residents due to rising property values",
        "Reduces the effectiveness of vertical farming initiatives"
      ],
      correct: 2,
      explanation: "The passage states that 'As neighborhoods become more desirable through improved planning and amenities, rising property values can displace long-term residents, particularly low-income families.'"
    }
  ]
};