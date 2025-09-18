-- Sample Reading Passages with Proper Schema
-- This adds realistic SAT reading content with perspectives, simplified view, and idea tracer

-- 1. Insert Sample Reading Passages
INSERT INTO public.reading_passages (passage_id, title, source, genre, difficulty_level, word_count, passage_text)
VALUES

-- Literature Passage 1
('PASSAGE-001', 
 'The Ephemeral Nature of Wealth', 
 'From "The Great Gatsby" by F. Scott Fitzgerald (1925)', 
 'literature', 
 'medium', 
 156,
 'In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars. At high tide in the afternoon I watched his guests diving from the tower of his raft, or taking the sun on the hot sand of his beach while his two motor-boats slit the waters of the Sound, drawing aquaplanes. On week-ends his Rolls-Royce became an omnibus, bearing parties to and from the city between nine in the morning and long past midnight, while his station wagon scampered like a brisk yellow bug to meet all trains. And on Mondays eight servants, including an extra gardener, toiled to repair the ravages of the night before.'),

-- Historical Document 1  
('PASSAGE-002',
 'Vision of Equality',
 'From "I Have a Dream" speech by Dr. Martin Luther King Jr. (1963)',
 'history',
 'medium',
 134,
 'I have a dream that one day this nation will rise up and live out the true meaning of its creed: We hold these truths to be self-evident, that all men are created equal. I have a dream that one day on the red hills of Georgia, the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood. I have a dream that one day even the state of Mississippi, a state sweltering with the heat of injustice, sweltering with the heat of oppression, will be transformed into an oasis of freedom and justice.'),

-- Science Passage 1
('PASSAGE-003',
 'Brain Development and Decision Making',
 'From "The Adolescent Brain" by scientific research journal (2019)',
 'science',
 'difficult',
 178,
 'Recent neuroscientific research has revealed that the human brain undergoes significant developmental changes well into the mid-twenties, particularly in the prefrontal cortex, the region responsible for executive functions such as decision-making, impulse control, and long-term planning. This protracted maturation process has profound implications for how we understand adolescent behavior and legal responsibility. The myelination of neural pathways, which increases processing speed and efficiency, continues throughout early adulthood. Furthermore, the limbic system, which governs emotional responses and reward-seeking behavior, develops more rapidly than the prefrontal cortex, creating a neurobiological imbalance that may explain why young people often engage in risky behaviors despite understanding the potential consequences.');

-- 2. Add Perspectives for Each Passage

-- PASSAGE-001 Perspectives (Gatsby)
INSERT INTO public.passage_perspectives (passage_id, perspective_type, perspective_title, perspective_content, key_quotes, analysis_points)
VALUES
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-001'),
  'author_perspective',
  'Fitzgerald''s Social Commentary',
  'Fitzgerald uses the moth metaphor to convey the ephemeral, destructive nature of the wealthy social scene. The imagery creates a sense of beauty shadowed by fragility and inevitable destruction. The contrast between natural elements (stars, moths) and artificial luxury (champagne, motor-boats) highlights the tension between authentic beauty and manufactured glamour.',
  ARRAY['men and girls came and went like moths', 'whisperings and the champagne and the stars', 'toiled to repair the ravages'],
  ARRAY['Moths suggest attraction to light but also fragility', 'Natural vs artificial imagery creates tension', 'Cycle of destruction and repair indicates excess']
),
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-001'),
  'literary_analysis',
  'Symbolism and Theme',
  'The passage employs cyclical imagery to represent the endless, meaningless repetition of wealthy excess. The "ravages of the night before" that must be repaired each Monday suggest a Sisyphean cycle of destruction and restoration. The transportation imagery (Rolls-Royce as omnibus, station wagon as yellow bug) transforms luxury into mere utility, suggesting the dehumanizing effect of wealth.',
  ARRAY['Rolls-Royce became an omnibus', 'yellow bug', 'ravages of the night before'],
  ARRAY['Cyclical imagery shows meaningless repetition', 'Transportation metaphors reduce luxury to utility', 'Dehumanization through mechanical imagery']
),
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-001'),
  'historical_context',
  'Jazz Age Excess',
  'Written during Prohibition (1920-1933), this passage captures the underground party culture of the wealthy elite who could circumvent legal restrictions. The casual mention of champagne and elaborate social gatherings reflects the ability of the upper class to maintain their lifestyle despite legal prohibitions. The eight servants represent the vast economic inequality of the period.',
  ARRAY['champagne and the stars', 'eight servants', 'parties to and from the city'],
  ARRAY['Prohibition context makes champagne significant', 'Servant economy shows wealth disparity', 'Urban-suburban party culture of the 1920s']
);

-- PASSAGE-002 Perspectives (MLK Speech)
INSERT INTO public.passage_perspectives (passage_id, perspective_type, perspective_title, perspective_content, key_quotes, analysis_points)
VALUES
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-002'),
  'rhetorical_analysis',
  'Strategic Use of American Ideals',
  'King strategically grounds his vision in fundamental American principles by quoting the Declaration of Independence. This rhetorical choice frames civil rights not as a challenge to American values, but as their fulfillment. The geographic specificity (Georgia, Mississippi) makes abstract ideals concrete and relatable.',
  ARRAY['true meaning of its creed', 'all men are created equal', 'red hills of Georgia'],
  ARRAY['Quotes founding documents to establish legitimacy', 'Geographic specificity makes vision tangible', 'Appeals to shared American values']
),
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-002'),
  'historical_context',
  'Civil Rights Movement Strategy',
  'Delivered during the March on Washington, this speech represented a strategic shift from protest to moral appeal. The reference to "sons of former slaves and former slave owners" acknowledges historical trauma while envisioning reconciliation. Mississippi, known for violent resistance to civil rights, becomes a symbol of the most challenging transformation.',
  ARRAY['sons of former slaves and the sons of former slave owners', 'state of Mississippi', 'oasis of freedom and justice'],
  ARRAY['Acknowledges historical trauma while promoting healing', 'Mississippi represents the greatest challenge', 'Vision of transformation, not just integration']
),
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-002'),
  'thematic_interpretation',
  'Dreams and American Promise',
  'The "dream" framework connects to the American Dream mythology while expanding its scope to include racial justice. The repetitive structure creates a building intensity, transforming personal vision into universal aspiration. The imagery progresses from personal relationships (table of brotherhood) to societal transformation (oasis).',
  ARRAY['I have a dream', 'table of brotherhood', 'oasis of freedom and justice'],
  ARRAY['Connects to American Dream mythology', 'Personal to universal progression', 'Metaphors move from intimate to societal']
);

-- PASSAGE-003 Perspectives (Brain Science)
INSERT INTO public.passage_perspectives (passage_id, perspective_type, perspective_title, perspective_content, key_quotes, analysis_points)
VALUES
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-003'),
  'author_perspective',
  'Scientific Methodology and Implications',
  'The passage presents neuroscientific findings with clear attention to their broader social implications. The authors carefully explain the biological mechanisms (myelination, prefrontal cortex development) before drawing conclusions about behavior and policy. The writing suggests advocacy for reconsidering how society treats young adults.',
  ARRAY['protracted maturation process', 'profound implications', 'neurobiological imbalance'],
  ARRAY['Biological evidence supports social policy discussion', 'Technical terms explained for broader audience', 'Clear cause-and-effect relationships established']
),
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-003'),
  'cultural_significance',
  'Redefining Adolescence and Responsibility',
  'This research challenges traditional notions of when adulthood begins, with implications for education, criminal justice, and social policy. The finding that brain development continues into the mid-twenties suggests current age-based legal distinctions may be scientifically outdated. The research supports more nuanced approaches to youth development and accountability.',
  ARRAY['well into the mid-twenties', 'legal responsibility', 'understanding the potential consequences'],
  ARRAY['Challenges traditional age-based legal frameworks', 'Supports developmental approaches to justice', 'Explains adolescent risk-taking behavior scientifically']
),
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-003'),
  'thematic_interpretation',
  'Science and Society Interface',
  'The passage exemplifies how scientific research can inform social understanding and policy. The careful progression from biological mechanisms to behavioral implications to social applications demonstrates the bridge between empirical research and practical application. It raises questions about how scientific findings should influence legal and educational systems.',
  ARRAY['neuroscientific research', 'implications for how we understand', 'may explain why'],
  ARRAY['Science informs social policy', 'Research has practical applications', 'Empirical evidence challenges assumptions']
);

-- 3. Add Simplified Views

INSERT INTO public.passage_simplified_view (passage_id, simplified_text, key_terms, main_ideas, structure_outline, reading_tips)
VALUES

-- Simplified view for Gatsby passage
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-001'),
  'At Gatsby''s house, people came and went like moths drawn to light. During the day, guests enjoyed his pool and beach while boats moved across the water. On weekends, his fancy car took groups of people back and forth to the city from morning until very late at night. His smaller car met every train. Every Monday, eight workers had to clean up and fix everything that was damaged from the weekend parties.',
  '{"ephemeral": "lasting only briefly", "omnibus": "a bus", "scampered": "moved quickly", "ravages": "damage or destruction", "toiled": "worked very hard"}'::jsonb,
  ARRAY['Gatsby throws elaborate parties', 'Many people attend but don''t really belong', 'The parties create mess and damage', 'Servants work to clean up after the wealthy'],
  'Paragraph structure: Opens with moth imagery establishing the transient nature of the social scene, moves to daytime activities showing luxury, describes transportation showing scale, ends with cleanup showing consequences.',
  ARRAY['Focus on the moth metaphor - what does it suggest about the people?', 'Notice the contrast between luxury and the work required to maintain it', 'Pay attention to imagery that makes wealth seem both attractive and destructive']
),

-- Simplified view for MLK passage  
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-002'),
  'King dreams of a time when America will truly live up to its founding promise that all people are created equal. He imagines a day when in Georgia, the children of former slaves and former slave owners will sit together as friends. He dreams that even Mississippi, a state known for unfair treatment of Black people, will become a place of freedom and justice.',
  '{"creed": "a set of beliefs", "self-evident": "obviously true", "sweltering": "extremely hot", "oppression": "harsh treatment", "oasis": "a peaceful place in a harsh environment"}'::jsonb,
  ARRAY['America should live up to its founding ideals', 'Former enemies can become friends', 'Even the most resistant places can change', 'Justice and freedom are possible everywhere'],
  'Structure: Uses "I have a dream" repetition to build intensity, moves from national ideals to specific geographic examples, progresses from reconciliation to transformation.',
  ARRAY['Notice how King uses American founding documents to support his argument', 'Pay attention to the specific places he mentions and why', 'Track how the imagery becomes more intense with each example']
),

-- Simplified view for brain science passage
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-003'),
  'Scientists have discovered that the human brain keeps developing until people are in their mid-twenties. The part of the brain that controls decision-making and self-control develops more slowly than the part that controls emotions and seeks rewards. This explains why young people sometimes make risky choices even when they know better. This research affects how we think about teenagers and young adults in legal situations.',
  '{"neuroscientific": "related to brain science", "prefrontal cortex": "brain area for decision-making", "executive functions": "high-level thinking skills", "myelination": "process that speeds up brain signals", "limbic system": "brain area for emotions"}'::jsonb,
  ARRAY['Brain development continues into the twenties', 'Different brain parts develop at different speeds', 'This explains risky teenage behavior', 'Legal systems should consider brain development'],
  'Structure: States main finding, explains brain mechanisms, discusses behavioral implications, concludes with legal and social applications.',
  ARRAY['Focus on the main finding first: brains develop until mid-twenties', 'Understand the two brain systems and their different development rates', 'Connect the science to real-world applications in law and policy']
);

-- 4. Add Idea Tracers

INSERT INTO public.passage_idea_tracer (passage_id, concept_map, theme_progression, argument_structure, evidence_tracking)
VALUES

-- Idea tracer for Gatsby passage
(
  (SELECT id FROM public.reading_passages WHERE passage_id = 'PASSAGE-001'),
  '{
    "central_concept": "Wealth and Social Excess",
    "related_concepts": [
      {"concept": "Transience", "connection": "Moths metaphor shows temporary nature"},
      {"concept": "Natural vs Artificial", "connection": "Stars vs champagne contrast"},
      {"concept": "Cyclical Destruction", "connection": "Weekly party and cleanup cycle"},
      {"concept": "Dehumanization", "connection": "People and objects both described mechanically"}
    ],
    "visual_connections": [
      "Moths → Light → Attraction → Destruction",
      "Luxury → Excess → Damage → Repair",
      "Natural → Artificial → Mechanical → Inhuman"
    ]
  }'::jsonb,
  '{
    "progression": [
      {"section": "Opening image", "theme": "Transient beauty", "development": "Establishes moth metaphor for fragile social connections"},
      {"section": "Daytime activities", "theme": "Luxury and leisure", "development": "Shows scale and expense of Gatsby lifestyle"},
      {"section": "Transportation details", "theme": "Mechanical efficiency", "development": "Reduces luxury to utility, suggests dehumanization"},
      {"section": "Cleanup aftermath", "theme": "Hidden cost", "development": "Reveals the human labor required to maintain illusion"}
    ]
  }'::jsonb,
  '{
    "claim": "Wealthy excess is ultimately hollow and destructive",
    "evidence_progression": [
      "Moths metaphor suggests fragility beneath apparent beauty",
      "Scale of activities shows excess beyond normal human needs",
      "Mechanical descriptions dehumanize both guests and objects",
      "Cleanup requirement reveals hidden costs and damage"
    ],
    "logical_structure": "Metaphor → Examples → Implications → Consequences"
  }'::jsonb,
  '{
    "textual_evidence": [
      {"quote": "like moths among the whisperings", "supports": "Fragility theme", "type": "metaphor"},
      {"quote": "Rolls-Royce became an omnibus", "supports": "Dehumanization theme", "type": "imagery"},
      {"quote": "toiled to repair the ravages", "supports": "Hidden cost theme", "type": "concrete detail"}
    ],
    "pattern_evidence": [
      {"pattern": "Natural imagery (moths, stars, gardens)", "supports": "Authentic beauty exists"},
      {"pattern": "Mechanical imagery (omnibus, yellow bug, motor-boats)", "supports": "Wealth creates artificiality"},
      {"pattern": "Cyclical structure (weekend parties, Monday cleanup)", "supports": "Meaningless repetition"}
    ]
  }'::jsonb
);

-- Success message
SELECT 'Sample reading passages with complete structure added successfully!' as result;