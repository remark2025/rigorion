import React, { useState, useCallback, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Trademark Color Scheme - SAT Math Signature
const TRADEMARK_COLORS = {
  primary: '#6366F1',      // Vibrant indigo - main curve
  secondary: '#8B5CF6',    // Purple - secondary elements
  accent: '#F59E0B',       // Amber - key points
  success: '#10B981',      // Emerald - intercepts
  warning: '#F97316',      // Orange - vertex/special points
  error: '#EF4444',        // Red - critical points
  gradient: {
    start: '#6366F1',
    middle: '#8B5CF6',
    end: '#EC4899'
  },
  background: {
    light: 'rgba(99, 102, 241, 0.05)',
    medium: 'rgba(99, 102, 241, 0.1)',
    dark: 'rgba(99, 102, 241, 0.15)'
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
          color: TRADEMARK_COLORS.warning,
          size: 16,
          symbol: 'diamond',
          line: {
            color: 'white',
            width: 3
          }
        },
        text: ['V'],
        textposition: 'middle center',
        textfont: {
          color: 'white',
          size: 10,
          family: 'Arial, sans-serif'
        },
        name: `🔶 Vertex (${vertexX.toFixed(3)}, ${vertexY.toFixed(3)})`,
        hovertemplate: '<b>🔶 Vertex Point</b><br>' +
                       'x: %{x:.3f}<br>' +
                       'y: %{y:.3f}<br>' +
                       '<i>Turning point of parabola</i><extra></extra>',
        hoverlabel: {
          bgcolor: TRADEMARK_COLORS.warning,
          bordercolor: 'white',
          font: { color: 'white', size: 14 }
        }
      });

      // Y-intercept
      elements.push({
        x: [0],
        y: [c],
        mode: 'markers+text',
        marker: {
          color: TRADEMARK_COLORS.success,
          size: 14,
          symbol: 'circle',
          line: {
            color: 'white',
            width: 2
          }
        },
        text: ['Y'],
        textposition: 'middle center',
        textfont: {
          color: 'white',
          size: 9,
          family: 'Arial, sans-serif'
        },
        name: `🟢 Y-intercept (0, ${c.toFixed(3)})`,
        hovertemplate: '<b>🟢 Y-Intercept</b><br>' +
                       'x: %{x}<br>' +
                       'y: %{y:.3f}<br>' +
                       '<i>Where curve crosses y-axis</i><extra></extra>',
        hoverlabel: {
          bgcolor: TRADEMARK_COLORS.success,
          bordercolor: 'white',
          font: { color: 'white', size: 14 }
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
            color: TRADEMARK_COLORS.secondary,
            size: 14,
            symbol: 'square',
            line: {
              color: 'white',
              width: 2
            }
          },
          text: discriminant === 0 ? ['X'] : ['X₁', 'X₂'],
          textposition: 'middle center',
          textfont: {
            color: 'white',
            size: 9,
            family: 'Arial, sans-serif'
          },
          name: discriminant === 0 ? 
            `🟪 X-intercept (${x1.toFixed(3)}, 0)` : 
            `🟪 X-intercepts (${x1.toFixed(3)}, 0) & (${x2.toFixed(3)}, 0)`,
          hovertemplate: '<b>🟪 X-Intercept</b><br>' +
                         'x: %{x:.3f}<br>' +
                         'y: %{y}<br>' +
                         '<i>Where curve crosses x-axis</i><extra></extra>',
          hoverlabel: {
            bgcolor: TRADEMARK_COLORS.secondary,
            bordercolor: 'white',
            font: { color: 'white', size: 14 }
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

  // Enhanced plot data with trademark styling
  const plotData = [
    {
      x: graphData.x,
      y: graphData.y,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: TRADEMARK_COLORS.primary,
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
        bgcolor: TRADEMARK_COLORS.primary,
        bordercolor: 'white',
        font: { color: 'white', size: 14 }
      }
    },
    ...visualElements
  ];

  // Enhanced layout with trademark styling
  const layout = {
    title: {
      text: `🎨 ${config.title}`,
      font: { 
        size: 20, 
        color: TRADEMARK_COLORS.primary,
        family: 'Inter, Arial, sans-serif'
      },
      x: 0.5,
      xanchor: 'center'
    },
    xaxis: {
      title: {
        text: 'x-axis',
        font: { color: TRADEMARK_COLORS.primary, size: 14 }
      },
      range: config.xRange,
      zeroline: config.showAxis,
      zerolinecolor: TRADEMARK_COLORS.primary,
      zerolinewidth: 2,
      showgrid: config.showGrid,
      gridcolor: 'rgba(99, 102, 241, 0.2)',
      gridwidth: 1,
      tickcolor: TRADEMARK_COLORS.primary,
      tickfont: { color: TRADEMARK_COLORS.primary }
    },
    yaxis: {
      title: {
        text: 'y-axis',
        font: { color: TRADEMARK_COLORS.primary, size: 14 }
      },
      range: config.yRange,
      zeroline: config.showAxis,
      zerolinecolor: TRADEMARK_COLORS.primary,
      zerolinewidth: 2,
      showgrid: config.showGrid,
      gridcolor: 'rgba(99, 102, 241, 0.2)',
      gridwidth: 1,
      tickcolor: TRADEMARK_COLORS.primary,
      tickfont: { color: TRADEMARK_COLORS.primary }
    },
    plot_bgcolor: TRADEMARK_COLORS.background.light,
    paper_bgcolor: 'rgba(255, 255, 255, 0.95)',
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: TRADEMARK_COLORS.primary,
      borderwidth: 1,
      font: {
        color: TRADEMARK_COLORS.primary,
        size: 12
      }
    },
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
        className="w-full border-2 shadow-xl overflow-hidden"
        style={{
          borderColor: TRADEMARK_COLORS.primary,
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(99, 102, 241, 0.02) 100%)`
        }}
      >
        <CardHeader 
          className="border-b-2 p-6"
          style={{
            borderColor: TRADEMARK_COLORS.primary,
            background: `linear-gradient(90deg, ${TRADEMARK_COLORS.gradient.start} 0%, ${TRADEMARK_COLORS.gradient.middle} 50%, ${TRADEMARK_COLORS.gradient.end} 100%)`
          }}
        >
          <CardTitle className="flex items-center justify-between text-white">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="h-6 w-6" />
              <span className="text-xl font-bold">
                🎨 Interactive Graph: {equation}
              </span>
            </motion.div>
            <motion.div 
              className="flex gap-3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={resetParameters}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startAnimation}
                disabled={isAnimating}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAnimating ? 'Animating...' : 'Animate'}
              </Button>
            </motion.div>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Interactive Graph with Trademark Styling */}
        <motion.div 
          className="w-full h-96 border-2 rounded-xl shadow-lg overflow-hidden"
          style={{
            borderColor: TRADEMARK_COLORS.primary,
            background: `linear-gradient(135deg, ${TRADEMARK_COLORS.background.light} 0%, ${TRADEMARK_COLORS.background.medium} 100%)`
          }}
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

        {/* Enhanced Parameter Controls */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {initialParameters.map((param, index) => (
            <motion.div 
              key={param.name} 
              className="space-y-3 p-4 rounded-lg border-2 shadow-sm"
              style={{
                borderColor: TRADEMARK_COLORS.secondary,
                background: `linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)`
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor={param.name} 
                  className="text-sm font-semibold flex items-center gap-2"
                  style={{ color: TRADEMARK_COLORS.primary }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: TRADEMARK_COLORS.accent }} />
                  {param.label}
                </Label>
                <Input
                  id={param.name}
                  type="number"
                  value={parameters[param.name]?.toFixed(3) || param.value}
                  onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || param.value)}
                  className="w-24 h-8 text-center font-mono font-semibold border-2"
                  style={{
                    borderColor: TRADEMARK_COLORS.accent,
                    backgroundColor: 'rgba(245, 158, 11, 0.1)'
                  }}
                  step={param.step}
                  min={param.min}
                  max={param.max}
                />
              </div>
              
              <div className="relative">
                <Slider
                  value={[parameters[param.name] || param.value]}
                  onValueChange={(values) => handleParameterChange(param.name, values[0])}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: TRADEMARK_COLORS.secondary }}>
                  <span>{param.min}</span>
                  <span>{param.max}</span>
                </div>
              </div>
              
              {param.description && (
                <p className="text-xs italic" style={{ color: TRADEMARK_COLORS.secondary }}>
                  {param.description}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Current Equation Display */}
        <motion.div 
          className="mt-6 p-5 rounded-xl border-2 shadow-md"
          style={{
            borderColor: TRADEMARK_COLORS.accent,
            background: `linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)`
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5" style={{ color: TRADEMARK_COLORS.accent }} />
            <p className="text-lg font-bold" style={{ color: TRADEMARK_COLORS.primary }}>
              Live Equation:
            </p>
          </div>
          <motion.p 
            className="text-2xl font-mono font-bold p-3 rounded-lg text-center"
            style={{
              color: TRADEMARK_COLORS.primary,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: `2px solid ${TRADEMARK_COLORS.primary}`
            }}
            key={JSON.stringify(parameters)} // Re-animate when parameters change
            initial={{ scale: 0.95, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {config.type === 'quadratic' && 
              `y = ${parameters.a?.toFixed(3) || 1}x² ${parameters.b >= 0 ? '+' : ''}${parameters.b?.toFixed(3) || 0}x ${parameters.c >= 0 ? '+' : ''}${parameters.c?.toFixed(3) || 0}`}
            {config.type === 'linear' && 
              `y = ${parameters.m?.toFixed(3) || 1}x ${parameters.b >= 0 ? '+' : ''}${parameters.b?.toFixed(3) || 0}`}
            {config.type === 'exponential' && 
              `y = ${parameters.a?.toFixed(3) || 1} × ${parameters.b?.toFixed(3) || 2}^x`}
            {config.type === 'absolute' && 
              `y = ${parameters.a?.toFixed(3) || 1}|x ${parameters.h >= 0 ? '-' : '+'}${Math.abs(parameters.h?.toFixed(3)) || 0}| ${parameters.k >= 0 ? '+' : ''}${parameters.k?.toFixed(3) || 0}`}
            {config.type === 'polynomial' && 
              `y = ${parameters.a?.toFixed(3) || 1}x³ ${parameters.b >= 0 ? '+' : ''}${parameters.b?.toFixed(3) || 0}x² ${parameters.c >= 0 ? '+' : ''}${parameters.c?.toFixed(3) || 0}x ${parameters.d >= 0 ? '+' : ''}${parameters.d?.toFixed(3) || 0}`}
          </motion.p>
        </motion.div>
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default InteractiveGraph;