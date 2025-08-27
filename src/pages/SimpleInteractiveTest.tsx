import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InteractiveGraph from '@/components/math/InteractiveGraph';

const SimpleInteractiveTest: React.FC = () => {
  const [testState, setTestState] = useState('ready');

  const simpleGraphConfig = {
    type: 'quadratic' as const,
    xRange: [-5, 5] as [number, number],
    yRange: [-10, 10] as [number, number],
    showGrid: true,
    showAxis: true,
    title: 'Simple Test Graph'
  };

  const simpleParameters = [
    {
      name: 'a',
      label: 'a',
      value: 1,
      min: -3,
      max: 3,
      step: 0.1,
      description: 'Test parameter a'
    },
    {
      name: 'b',
      label: 'b', 
      value: 0,
      min: -5,
      max: 5,
      step: 0.1,
      description: 'Test parameter b'
    },
    {
      name: 'c',
      label: 'c',
      value: 0,
      min: -5,
      max: 5,
      step: 0.1,
      description: 'Test parameter c'
    }
  ];

  console.log('🧪 SimpleInteractiveTest rendered');
  console.log('🧪 Graph config:', simpleGraphConfig);
  console.log('🧪 Parameters:', simpleParameters);

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🧪 Simple Interactive Graph Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p><strong>Test Status:</strong> {testState}</p>
            <p><strong>Graph Config Type:</strong> {simpleGraphConfig.type}</p>
            <p><strong>Parameters Count:</strong> {simpleParameters.length}</p>
          </div>
          
          <div className="border-2 border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Interactive Graph Component:</h3>
            <InteractiveGraph
              equation="y = ax² + bx + c"
              parameters={simpleParameters}
              config={simpleGraphConfig}
              onParameterChange={(params) => {
                console.log('🧪 Parameters changed:', params);
                setTestState('parameters changed');
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleInteractiveTest;