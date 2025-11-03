import { PassageContent } from '../../types';

export const spaceRacePassage: PassageContent = {
  id: 6,
  title: "The Space Race: Competition and Cooperation",
  imageUrl: "/resources/passages/space-race.jpg",
  text: `The Space Race of the 1950s and 1960s began as a manifestation of Cold War tensions between the United States and Soviet Union, yet it ultimately demonstrated humanity's capacity for both competition and cooperation in pursuit of scientific advancement.

Initially, the Soviet Union held a commanding lead. The launch of Sputnik 1 in October 1957 shocked the American public and government, as it proved Soviet technological capabilities exceeded expectations. Moreover, Yuri Gagarin's historic orbital flight in April 1961 further cemented Soviet dominance in early space exploration. These achievements prompted President Kennedy to declare the ambitious goal of landing Americans on the moon before the decade's end.

The competition intensified as both nations invested enormous resources in their space programs. NASA's budget peaked at over 4% of the federal budget in 1966, while the Soviet space program consumed similar proportions of state resources. This rivalry drove rapid technological innovation, leading to advances in materials science, computer technology, and telecommunications that would benefit society for decades.

However, the nature of space exploration gradually shifted from pure competition to selective cooperation. The Apollo-Soyuz Test Project in 1975 marked a symbolic end to the Space Race, as American and Soviet spacecraft docked in orbit, demonstrating that former adversaries could work together in space.

Furthermore, this collaboration established precedents for international space cooperation that continue today. The International Space Station represents the culmination of this evolution, involving not only the United States and Russia but also partners from Europe, Japan, and Canada.

Ironically, what began as a competition rooted in national rivalry ultimately revealed that space exploration's greatest achievements require international cooperation. The challenges of exploring beyond Earth are so immense that they transcend political boundaries and demand humanity's collective efforts.

In retrospect, the Space Race's most lasting legacy may not be the technological achievements themselves, but rather the demonstration that scientific cooperation can overcome political divisions. As we look toward future missions to Mars and beyond, this lesson becomes increasingly relevant.`,
  
  highlights: {
    evidence: [
      "The launch of Sputnik 1 in October 1957 shocked the American public and government",
      "Yuri Gagarin's historic orbital flight in April 1961 further cemented Soviet dominance",
      "NASA's budget peaked at over 4% of the federal budget in 1966",
      "The Apollo-Soyuz Test Project in 1975 marked a symbolic end to the Space Race"
    ],
    toneShifters: [
      "However",
      "Furthermore", 
      "Ironically",
      "In retrospect"
    ],
    transitions: [
      "Initially",
      "Moreover",
      "Furthermore",
      "As we look toward future missions"
    ],
    mainIdeas: [
      "The Space Race began as Cold War competition between the US and Soviet Union",
      "Soviet early achievements prompted increased American investment in space",
      "Competition drove technological innovation with lasting societal benefits",
      "The Space Race evolved from competition to international cooperation"
    ]
  },
  
  questions: [
    {
      id: "q1",
      text: "According to the passage, what was the primary catalyst for President Kennedy's moon landing declaration?",
      options: [
        "NASA's budget increased significantly",
        "Soviet early achievements in space exploration",
        "Public demand for space exploration",
        "International pressure to cooperate in space"
      ],
      correct: 1,
      explanation: "The passage indicates that Soviet achievements like Sputnik and Gagarin's flight 'prompted President Kennedy to declare the ambitious goal of landing Americans on the moon.'"
    },
    {
      id: "q2",
      text: "The author suggests that the Space Race's most significant long-term impact was:",
      options: [
        "The technological innovations it produced",
        "The economic benefits to both nations",
        "The demonstration that scientific cooperation can overcome political divisions",
        "The establishment of NASA as a space agency"
      ],
      correct: 2,
      explanation: "The passage concludes that 'the Space Race's most lasting legacy may not be the technological achievements themselves, but rather the demonstration that scientific cooperation can overcome political divisions.'"
    }
  ]
};