import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EssayCorrection, { CorrectionMark } from './EssayCorrection';
import { FileText, Eye, Edit3 } from 'lucide-react';

interface EssayCorrectionDemoProps {
  className?: string;
}

const EssayCorrectionDemo: React.FC<EssayCorrectionDemoProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<"original" | "corrected">("original");

  // Sample essay with errors
  const sampleEssay = `Social media has revolutionized the way we communicate and share information. In today's world, platforms like Facebook, Twitter, and Instagram has become an integral part of our daily lives. However, this technological advancement comes with both positive and negative consequences that effects millions of users worldwide.

On the positive side, social media allows people to stay connected with friends and family regardless of geographical barriers. It also provide opportunities for businesses to reach wider audiences and for individuals to express their creativity and share their talents. Moreover, social media has proven to be a powerful tool for social movements and raising awareness about important issues.

Nevertheless, there are significant drawbacks to consider. Many users experience cyberbullying, privacy concerns, and the spread of misinformation. The addictive nature of these platforms can also lead to decreased productivity and mental health issues. Furthermore, the constant comparison with others lifestyles often results in feelings of inadequacy and low self-esteem.

In conclusion, while social media offers numerous benefits, it is essential that users approach these platforms mindfully. We must strive to use social media in a way that enhances our lives rather than detracting from it. Only through conscious effort and digital literacy can we maximize the positive impacts of social media while minimizing its negative effects.`;

  // Sample corrections
  const sampleCorrections: CorrectionMark[] = [
    {
      type: 'grammar',
      startIndex: 185,
      endIndex: 188,
      originalText: 'has',
      correctedText: 'have',
      explanation: 'Subject-verb agreement error. "Platforms" is plural, so it requires the plural verb "have".',
      grammarRule: 'Subject-Verb Agreement'
    },
    {
      type: 'word_choice',
      startIndex: 350,
      endIndex: 357,
      originalText: 'effects',
      correctedText: 'affects',
      explanation: '"Effects" is a noun, while "affects" is a verb. Here we need the verb form.',
      grammarRule: 'Effect vs. Affect Usage'
    },
    {
      type: 'grammar',
      startIndex: 545,
      endIndex: 552,
      originalText: 'provide',
      correctedText: 'provides',
      explanation: 'The subject "it" is singular, so the verb should be "provides".',
      grammarRule: 'Subject-Verb Agreement'
    },
    {
      type: 'word_choice',
      startIndex: 1205,
      endIndex: 1215,
      originalText: 'lifestyles',
      correctedText: "others' lifestyles",
      explanation: 'Need to show possession - "others\' lifestyles" indicates the lifestyles belonging to other people.',
      grammarRule: 'Possessive Apostrophe'
    },
    {
      type: 'pronoun_reference',
      startIndex: 1565,
      endIndex: 1567,
      originalText: 'it',
      correctedText: 'them',
      explanation: '"It" refers to a singular noun, but "social media" or "platforms" (plural) is the intended antecedent.',
      grammarRule: 'Pronoun-Antecedent Agreement'
    } as CorrectionMark
  ];

  const overallFeedback = {
    strengths: [
      "Clear thesis statement and logical essay structure",
      "Good use of transitional phrases like 'Nevertheless' and 'Furthermore'",
      "Balanced discussion of both positive and negative aspects",
      "Relevant examples and specific platform mentions"
    ],
    weaknesses: [
      "Several subject-verb agreement errors throughout",
      "Confusion between 'effect' and 'affect'",
      "Inconsistent pronoun usage",
      "Missing apostrophe in possessive construction"
    ],
    suggestions: [
      "Review subject-verb agreement rules, especially with compound subjects",
      "Practice distinguishing between 'effect' (noun) and 'affect' (verb)",
      "Ensure pronouns clearly refer to their antecedents",
      "Proofread carefully for possessive apostrophes",
      "Consider adding more specific examples to strengthen arguments"
    ],
    score: 78
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SAT Writing Essay - Teacher Correction System Demo
          </CardTitle>
          <p className="text-gray-600">
            This demonstrates how essay corrections would appear in the practice page solution tab.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "original" | "corrected")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Original Essay
              </TabsTrigger>
              <TabsTrigger value="corrected" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Teacher Corrections
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="original" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Student's Original Essay</CardTitle>
                  <p className="text-sm text-gray-600">
                    Prompt: Discuss the impact of social media on modern society, considering both positive and negative aspects.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-6 border rounded-lg">
                      <div className="whitespace-pre-wrap leading-relaxed text-base">
                        {sampleEssay}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 bg-white p-4 rounded-lg border">
                    <div className="flex justify-between">
                      <span>Word Count: {sampleEssay.split(' ').length} words</span>
                      <span>Estimated Grade: B-</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="corrected" className="mt-6">
              <EssayCorrection
                originalEssay={sampleEssay}
                corrections={sampleCorrections}
                overallFeedback={overallFeedback}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Integration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <strong>For Practice Page Integration:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-700">
              <li>Add this component to the "solution" tab when an essay question is answered</li>
              <li>Pass the student's essay text and AI-generated corrections</li>
              <li>The corrections can be generated using an AI service or pre-defined correction rules</li>
              <li>Include overall feedback with strengths, weaknesses, and suggestions</li>
            </ul>
          </div>
          
          <div>
            <strong>Features Implemented:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-700">
              <li>✅ Strikethrough for original incorrect text</li>
              <li>✅ Highlighted correct replacements</li>
              <li>✅ Grammar rule explanations in brackets</li>
              <li>✅ Color-coded correction types (grammar, word choice, etc.)</li>
              <li>✅ Hover tooltips with detailed explanations</li>
              <li>✅ Teacher-style overall feedback with strengths and weaknesses</li>
              <li>✅ Correction statistics and legend</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EssayCorrectionDemo;