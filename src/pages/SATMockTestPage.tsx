import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import SATMockTest from '@/components/practice/SATMockTest';
import { Question } from '@/types/QuestionInterface';
import { generateSampleQuestions } from '@/data/sampleQuestions';

const SATMockTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const sampleQuestions = generateSampleQuestions(98);
    setQuestions(sampleQuestions);
  }, []);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleExitTest = () => {
    setTestStarted(false);
    navigate('/practice');
  };

  if (testStarted && questions.length > 0) {
    return <SATMockTest questions={questions} onExit={handleExitTest} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/practice')} 
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900">
              SAT Digital Mock Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-gray-700">
              <p className="text-lg mb-4">
                Take a full-length SAT digital practice test to simulate the real exam experience.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Test Structure</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Reading and Writing: 64 minutes (2 modules)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Math: 70 minutes (2 modules)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      Total time: ~2 hours 14 minutes
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span>You can only access questions in the current module</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span>Timer runs automatically for each module</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span>Use the answer grid on the right to navigate and select answers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-center">
                <Button 
                  onClick={handleStartTest}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  disabled={questions.length === 0}
                >
                  {questions.length === 0 ? 'Loading Questions...' : 'Start Mock Test'}
                </Button>
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                Make sure you have a quiet environment and sufficient time to complete the test
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SATMockTestPage;