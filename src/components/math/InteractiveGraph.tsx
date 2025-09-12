import React, { useState, useCallback, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Play, Pause, RotateCcw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { COMPONENT_THEMES, PROFESSIONAL_COLORS } from '@/utils/professionalColors';

// Professional Color Scheme - Deep Intelligence Theme
const PROFESSIONAL_THEME = {
  primary: PROFESSIONAL_COLORS.keyStaff.blue,        // Deep blue - main curve
  secondary: PROFESSIONAL_COLORS.keyStaff.deepBlue,  // Deeper blue - secondary elements
  accent: PROFESSIONAL_COLORS.keyStaff.orange,       // Strategic orange - key points
  success: PROFESSIONAL_COLORS.accents.forestGreen,  // Deep green - intercepts
  warning: PROFESSIONAL_COLORS.keyStaff.deepOrange,  // Deep orange - vertex/special points
  error: PROFESSIONAL_COLORS.keyStaff.red,           // Red - critical points
  background: {
    surface: PROFESSIONAL_COLORS.background.surface,
    deep: PROFESSIONAL_COLORS.background.primary,
    medium: PROFESSIONAL_COLORS.background.secondary
  },
  text: {
    primary: PROFESSIONAL_COLORS.text.primary,
    secondary: PROFESSIONAL_COLORS.text.secondary,
    muted: PROFESSIONAL_COLORS.text.muted
  }
};

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
  const [showLegend, setShowLegend] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

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
        mode: 'markers+text',
        marker: {
          color: '#dc2626',
          size: 16,
          symbol: 'circle',
          line: {
            color: '#dc2626',
            width: 2
          }
        },
        text: ['V'],
        textposition: 'middle center',
        textfont: {
          color: '#000000',
          size: 10,
          family: 'Inter, sans-serif',
          weight: 'bold'
        },
        name: `Vertex (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`,
        hovertemplate: '<b>Vertex Point</b><br>' +
                       'x: %{x:.3f}<br>' +
                       'y: %{y:.3f}<br>' +
                       '<i>Turning point of parabola</i><extra></extra>',
        hoverlabel: {
          bgcolor: 'white',
          bordercolor: '#dc2626',
          font: { color: '#dc2626', size: 14 }
        }
      });

      // Y-intercept
      elements.push({
        x: [0],
        y: [c],
        mode: 'markers+text',
        marker: {
          color: '#16a34a',
          size: 14,
          symbol: 'circle',
          line: {
            color: '#16a34a',
            width: 2
          }
        },
        text: ['Y'],
        textposition: 'middle center',
        textfont: {
          color: '#000000',
          size: 9,
          family: 'Inter, sans-serif',
          weight: 'bold'
        },
        name: `Y-intercept (0, ${c.toFixed(2)})`,
        hovertemplate: '<b>Y-Intercept</b><br>' +
                       'x: %{x}<br>' +
                       'y: %{y:.3f}<br>' +
                       '<i>Where curve crosses y-axis</i><extra></extra>',
        hoverlabel: {
          bgcolor: 'white',
          bordercolor: '#16a34a',
          font: { color: '#16a34a', size: 14 }
        }
      });

      // X-intercepts (if they exist)
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        elements.push({
          x: discriminant === 0 ? [x1] : [x1, x2],
          y: discriminant === 0 ? [0] : [0, 0],
          mode: 'markers+text',
          marker: {
            color: '#2563eb',
            size: 14,
            symbol: 'circle',
            line: {
              color: '#2563eb',
              width: 2
            }
          },
          text: discriminant === 0 ? ['X'] : ['X₁', 'X₂'],
          textposition: 'middle center',
          textfont: {
            color: '#000000',
            size: 9,
            family: 'Inter, sans-serif',
            weight: 'bold'
          },
          name: discriminant === 0 ? 
            `X-intercept (${x1.toFixed(2)}, 0)` : 
            `X-intercepts (${x1.toFixed(2)}, 0) & (${x2.toFixed(2)}, 0)`,
          hovertemplate: '<b>X-Intercept</b><br>' +
                         'x: %{x:.3f}<br>' +
                         'y: %{y}<br>' +
                         '<i>Where curve crosses x-axis</i><extra></extra>',
          hoverlabel: {
            bgcolor: 'white',
            bordercolor: '#2563eb',
            font: { color: '#2563eb', size: 14 }
          }
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
    if (isAnimating) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const param = initialParameters[0];
    if (!param) return;

    let value = param.min;
    let cycles = 0;
    const maxCycles = 2; // Complete 2 full cycles
    
    animationRef.current = setInterval(() => {
      value += (param.max - param.min) / 100 * animationSpeed;
      if (value > param.max) {
        value = param.min;
        cycles++;
        if (cycles >= maxCycles) {
          if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
          }
          setIsAnimating(false);
          return;
        }
      }
      
      handleParameterChange(param.name, value);
    }, 50); // Faster animation - 50ms intervals
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const graphData = generateGraphData();
  const visualElements = generateVisualElements();

  // Enhanced plot data with trademark styling
  const plotData = [
    {
      x: graphData.x,
      y: graphData.y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: '#22c55e',
        width: 4,
        shape: 'spline',
        smoothing: 0.3
      },
      name: equation,
      hovertemplate: '<b>%{fullData.name}</b><br>' +
                     'x: %{x:.3f}<br>' +
                     'y: %{y:.3f}<br>' +
                     '<extra></extra>',
      hoverlabel: {
        bgcolor: PROFESSIONAL_THEME.primary,
        bordercolor: 'white',
        font: { color: 'white', size: 14 }
      }
    },
    ...visualElements
  ];

  // Enhanced layout with trademark styling
  const layout = {
    title: {
      text: `Note: ${config.title}`,
      font: { 
        size: 14, 
        color: '#000000',
        family: 'Inter, Arial, sans-serif'
      },
      x: 0.02,
      y: 1.02,
      xanchor: 'left',
      yanchor: 'bottom'
    },
    xaxis: {
      title: {
        text: 'x-axis',
        font: { color: '#000000', size: 14, family: 'Inter, sans-serif' }
      },
      range: config.xRange,
      zeroline: config.showAxis,
      zerolinecolor: '#000000',
      zerolinewidth: 2,
      showgrid: config.showGrid,
      gridcolor: 'rgba(0, 0, 0, 0.1)',
      gridwidth: 1,
      tickcolor: '#000000',
      tickfont: { color: '#000000', family: 'Inter, sans-serif' }
    },
    yaxis: {
      title: {
        text: 'y-axis',
        font: { color: '#000000', size: 14, family: 'Inter, sans-serif' }
      },
      range: config.yRange,
      zeroline: config.showAxis,
      zerolinecolor: '#000000',
      zerolinewidth: 2,
      showgrid: config.showGrid,
      gridcolor: 'rgba(0, 0, 0, 0.1)',
      gridwidth: 1,
      tickcolor: '#000000',
      tickfont: { color: '#000000', family: 'Inter, sans-serif' }
    },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    showlegend: false,
    margin: { t: 60, r: 30, b: 60, l: 60 },
    hovermode: 'closest',
    dragmode: 'pan'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card 
        className="w-full overflow-hidden"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(229, 231, 235, 0.3) 9px, rgba(229, 231, 235, 0.3) 10px), white'
        }}
      >
      <CardContent className="p-0">
        {/* Side-by-side layout: Graph on left, Controls on right */}
        <div className="flex gap-4">
          {/* Graph Area - Left Side */}
          <motion.div 
            className="flex-1 h-[600px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Plot
              data={plotData}
              layout={layout}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                toImageButtonOptions: {
                  format: 'png',
                  filename: 'sat_math_graph',
                  height: 500,
                  width: 700,
                  scale: 2
                }
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </motion.div>

          {/* Control Panel - Right Side */}
          <motion.div 
            className="w-80 p-4 space-y-4"
            style={{ background: 'rgba(255, 255, 255, 0.95)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Reset and Animate buttons at top */}
            <div className="flex gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={resetParameters}
                className="flex items-center gap-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 h-8 px-3 text-sm"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startAnimation}
                disabled={isAnimating}
                className="flex items-center gap-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 h-8 px-3 text-sm"
              >
                {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isAnimating ? 'Playing...' : 'Animate'}
              </Button>
            </div>

            {/* Graph Legend - Above Interactive Controls */}
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
                className="flex items-center gap-2 w-full justify-between bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-3 text-sm"
              >
                <span>Graph Legend</span>
                {showLegend ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              
              {showLegend && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Function curve - mathematical relationship</span>
                  </div>
                  
                  {config.type === 'quadratic' && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600 flex items-center justify-center">
                          <span className="text-black text-[8px] font-bold">V</span>
                        </div>
                        <span className="text-gray-700">Vertex - turning point of parabola</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-600 flex items-center justify-center">
                          <span className="text-black text-[8px] font-bold">Y</span>
                        </div>
                        <span className="text-gray-700">Y-intercept - where curve crosses y-axis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-black text-[8px] font-bold">X</span>
                        </div>
                        <span className="text-gray-700">X-intercepts - where curve crosses x-axis</span>
                      </div>
                    </>
                  )}

                  {(config.type === 'linear' || config.type === 'exponential' || config.type === 'absolute' || config.type === 'polynomial') && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600 flex items-center justify-center">
                        <span className="text-black text-[8px] font-bold">Y</span>
                      </div>
                      <span className="text-gray-700">Y-intercept - where curve crosses y-axis</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <h4 className="font-semibold text-gray-700 mb-4">Interactive Controls</h4>
            {initialParameters.map((param, index) => (
              <motion.div 
                key={param.name} 
                className="space-y-2 p-3 bg-white border border-gray-100 rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* First Line: Label and Value */}
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor={param.name} 
                    className="text-sm font-semibold text-gray-700"
                  >
                    {param.label}
                  </Label>
                  <Input
                    id={param.name}
                    type="number"
                    value={parameters[param.name]?.toFixed(3) || param.value}
                    onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || param.value)}
                    className="w-20 h-8 text-center font-mono text-sm bg-gray-100 border-gray-300 text-black focus:border-gray-600 focus:ring-1 focus:ring-gray-600 focus:bg-gray-50"
                    step={param.step}
                    min={param.min}
                    max={param.max}
                  />
                </div>
                
                {/* Second Line: Slider and Description */}
                <div className="space-y-1">
                  <div className="px-2 py-3">
                    <Slider
                    value={[parameters[param.name] || param.value]}
                    onValueChange={(values) => handleParameterChange(param.name, values[0])}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    className="w-full [&>span[role=slider]]:bg-black [&>span[role=slider]]:border-black [&>span[role=slider]]:w-5 [&>span[role=slider]]:h-5 [&>span[role=slider]]:hover:bg-gray-800 [&_[data-orientation=horizontal]]:bg-gray-300 [&_[data-orientation=horizontal]]:h-2 [&_span.bg-primary]:!bg-green-600 [&_span.bg-primary]:h-2"
                    />
                  </div>
                  {param.description && (
                    <p className="text-xs text-gray-600">
                      {param.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </CardContent>
    </Card>
    </motion.div>
  );
};

export default InteractiveGraph;