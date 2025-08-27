import React, { useState, useCallback, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Play, Pause, RotateCcw } from 'lucide-react';

interface MathParameter {
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description?: string;
}

interface GraphConfig {
  type: 'quadratic' | 'linear' | 'exponential' | 'absolute' | 'polynomial';
  xRange: [number, number];
  yRange: [number, number];
  showGrid: boolean;
  showAxis: boolean;
  title: string;
}

interface InteractiveGraphProps {
  equation: string;
  parameters: MathParameter[];
  config: GraphConfig;
  onParameterChange?: (params: Record<string, number>) => void;
  className?: string;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  equation,
  parameters: initialParameters,
  config,
  onParameterChange,
  className
}) => {
  const [parameters, setParameters] = useState<Record<string, number>>(
    initialParameters.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {})
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Generate graph data based on parameters
  const generateGraphData = useCallback(() => {
    const xValues: number[] = [];
    const yValues: number[] = [];
    const [xMin, xMax] = config.xRange;
    const step = (xMax - xMin) / 200;

    for (let x = xMin; x <= xMax; x += step) {
      xValues.push(x);
      let y: number;

      switch (config.type) {
        case 'quadratic':
          // y = ax² + bx + c
          y = parameters.a * x * x + parameters.b * x + parameters.c;
          break;
        case 'linear':
          // y = mx + b
          y = parameters.m * x + parameters.b;
          break;
        case 'exponential':
          // y = a * b^x
          y = parameters.a * Math.pow(parameters.b, x);
          break;
        case 'absolute':
          // y = a|x - h| + k
          y = parameters.a * Math.abs(x - (parameters.h || 0)) + (parameters.k || 0);
          break;
        case 'polynomial':
          // y = ax³ + bx² + cx + d
          y = (parameters.a || 0) * Math.pow(x, 3) + (parameters.b || 0) * Math.pow(x, 2) + (parameters.c || 0) * x + (parameters.d || 0);
          break;
        default:
          y = x;
      }
      yValues.push(y);
    }

    return { x: xValues, y: yValues };
  }, [parameters, config]);

  // Generate additional visual elements (vertex, intercepts, etc.)
  const generateVisualElements = useCallback(() => {
    const elements: any[] = [];

    if (config.type === 'quadratic') {
      const { a, b, c } = parameters;
      
      // Vertex point
      const vertexX = -b / (2 * a);
      const vertexY = a * vertexX * vertexX + b * vertexX + c;
      
      elements.push({
        x: [vertexX],
        y: [vertexY],
        mode: 'markers',
        marker: {
          color: 'red',
          size: 12,
          symbol: 'circle'
        },
        name: `Vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
        hovertemplate: 'Vertex<br>x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>'
      });

      // Y-intercept
      elements.push({
        x: [0],
        y: [c],
        mode: 'markers',
        marker: {
          color: 'green',
          size: 10,
          symbol: 'circle'
        },
        name: `Y-intercept (0, ${c})`,
        hovertemplate: 'Y-intercept<br>x: %{x}<br>y: %{y}<extra></extra>'
      });

      // X-intercepts (if they exist)
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        elements.push({
          x: discriminant === 0 ? [x1] : [x1, x2],
          y: discriminant === 0 ? [0] : [0, 0],
          mode: 'markers',
          marker: {
            color: 'blue',
            size: 10,
            symbol: 'circle'
          },
          name: discriminant === 0 ? `X-intercept (${x1.toFixed(2)}, 0)` : 'X-intercepts',
          hovertemplate: 'X-intercept<br>x: %{x:.2f}<br>y: %{y}<extra></extra>'
        });
      }
    }

    return elements;
  }, [parameters, config.type]);

  const handleParameterChange = (paramName: string, newValue: number) => {
    const updatedParams = { ...parameters, [paramName]: newValue };
    setParameters(updatedParams);
    onParameterChange?.(updatedParams);
  };

  const resetParameters = () => {
    const resetParams = initialParameters.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {});
    setParameters(resetParams);
    onParameterChange?.(resetParams);
  };

  const startAnimation = () => {
    setIsAnimating(true);
    // Example animation: modify parameter 'a' over time
    const param = initialParameters[0]; // Use first parameter for animation
    if (!param) return;

    let value = param.min;
    const interval = setInterval(() => {
      value += (param.max - param.min) / 100 * animationSpeed;
      if (value > param.max) value = param.min;
      
      handleParameterChange(param.name, value);
    }, 100);

    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
    }, 10000);
  };

  const graphData = generateGraphData();
  const visualElements = generateVisualElements();

  const plotData = [
    {
      x: graphData.x,
      y: graphData.y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: '#3B82F6',
        width: 3
      },
      name: equation,
      hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>'
    },
    ...visualElements
  ];

  const layout = {
    title: {
      text: config.title,
      font: { size: 18 }
    },
    xaxis: {
      title: 'x',
      range: config.xRange,
      zeroline: config.showAxis,
      showgrid: config.showGrid,
      gridcolor: '#E5E7EB'
    },
    yaxis: {
      title: 'y', 
      range: config.yRange,
      zeroline: config.showAxis,
      showgrid: config.showGrid,
      gridcolor: '#E5E7EB'
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98
    },
    margin: { t: 50, r: 20, b: 50, l: 50 }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Interactive Graph: {equation}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetParameters}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={startAnimation}
              disabled={isAnimating}
              className="flex items-center gap-1"
            >
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isAnimating ? 'Animating...' : 'Animate'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interactive Graph */}
        <div className="w-full h-96 border border-gray-200 rounded-lg">
          <Plot
            data={plotData}
            layout={layout}
            config={{
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>

        {/* Parameter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialParameters.map((param) => (
            <div key={param.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={param.name} className="text-sm font-medium">
                  {param.label}
                </Label>
                <Input
                  id={param.name}
                  type="number"
                  value={parameters[param.name]?.toFixed(2) || param.value}
                  onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || param.value)}
                  className="w-20 h-8 text-center"
                  step={param.step}
                  min={param.min}
                  max={param.max}
                />
              </div>
              
              <Slider
                value={[parameters[param.name] || param.value]}
                onValueChange={(values) => handleParameterChange(param.name, values[0])}
                min={param.min}
                max={param.max}
                step={param.step}
                className="w-full"
              />
              
              {param.description && (
                <p className="text-xs text-gray-500">{param.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Current Equation Display */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Current Equation:</p>
          <p className="text-lg font-mono text-blue-900">
            {config.type === 'quadratic' && 
              `y = ${parameters.a?.toFixed(2) || 1}x² + ${parameters.b?.toFixed(2) || 0}x + ${parameters.c?.toFixed(2) || 0}`}
            {config.type === 'linear' && 
              `y = ${parameters.m?.toFixed(2) || 1}x + ${parameters.b?.toFixed(2) || 0}`}
            {config.type === 'exponential' && 
              `y = ${parameters.a?.toFixed(2) || 1} × ${parameters.b?.toFixed(2) || 2}^x`}
            {config.type === 'absolute' && 
              `y = ${parameters.a?.toFixed(2) || 1}|x - ${parameters.h?.toFixed(2) || 0}| + ${parameters.k?.toFixed(2) || 0}`}
            {config.type === 'polynomial' && 
              `y = ${parameters.a?.toFixed(2) || 1}x³ + ${parameters.b?.toFixed(2) || 0}x² + ${parameters.c?.toFixed(2) || 0}x + ${parameters.d?.toFixed(2) || 0}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveGraph;