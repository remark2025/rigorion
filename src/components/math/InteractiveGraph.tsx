import React, { useState, useCallback, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
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
          color: PROFESSIONAL_THEME.warning,
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
          bgcolor: PROFESSIONAL_THEME.warning,
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
          color: PROFESSIONAL_THEME.success,
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
          bgcolor: PROFESSIONAL_THEME.success,
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
            color: PROFESSIONAL_THEME.secondary,
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
            bgcolor: PROFESSIONAL_THEME.secondary,
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
    if (isAnimating) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const param = initialParameters[0];
    if (!param) return;

    let value = param.min;
    const interval = setInterval(() => {
      if (!isAnimating) {
        clearInterval(interval);
        return;
      }
      
      value += (param.max - param.min) / 100 * animationSpeed;
      if (value > param.max) {
        value = param.min;
      }
      
      handleParameterChange(param.name, value);
    }, 100);

    // Store interval reference for cleanup
    setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
    }, 5000); // Reduced to 5 seconds
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
        color: PROFESSIONAL_THEME.primary,
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
      text: `🎨 ${config.title}`,
      font: { 
        size: 20, 
        color: PROFESSIONAL_THEME.primary,
        family: 'Inter, Arial, sans-serif'
      },
      x: 0.5,
      xanchor: 'center'
    },
    xaxis: {
      title: {
        text: 'x-axis',
        font: { color: PROFESSIONAL_THEME.primary, size: 14 }
      },
      range: config.xRange,
      zeroline: config.showAxis,
      zerolinecolor: PROFESSIONAL_THEME.primary,
      zerolinewidth: 2,
      showgrid: config.showGrid,
      gridcolor: 'rgba(99, 102, 241, 0.2)',
      gridwidth: 1,
      tickcolor: PROFESSIONAL_THEME.primary,
      tickfont: { color: PROFESSIONAL_THEME.primary }
    },
    yaxis: {
      title: {
        text: 'y-axis',
        font: { color: PROFESSIONAL_THEME.primary, size: 14 }
      },
      range: config.yRange,
      zeroline: config.showAxis,
      zerolinecolor: PROFESSIONAL_THEME.primary,
      zerolinewidth: 2,
      showgrid: config.showGrid,
      gridcolor: 'rgba(99, 102, 241, 0.2)',
      gridwidth: 1,
      tickcolor: PROFESSIONAL_THEME.primary,
      tickfont: { color: PROFESSIONAL_THEME.primary }
    },
    plot_bgcolor: PROFESSIONAL_THEME.background.light,
    paper_bgcolor: 'rgba(255, 255, 255, 0.95)',
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: PROFESSIONAL_THEME.primary,
      borderwidth: 1,
      font: {
        color: PROFESSIONAL_THEME.primary,
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
        className="w-full border shadow-2xl overflow-hidden"
        style={{
          borderColor: PROFESSIONAL_COLORS.accents.steel,
          background: PROFESSIONAL_THEME.background.surface,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)'
        }}
      >
        <CardHeader 
          className="border-b p-2"
          style={{
            borderColor: PROFESSIONAL_COLORS.accents.steel,
            background: `linear-gradient(90deg, ${PROFESSIONAL_THEME.background.deep} 0%, ${PROFESSIONAL_THEME.background.medium} 100%)`
          }}
        >
          <CardTitle className="flex items-center justify-between text-sm" style={{ color: PROFESSIONAL_COLORS.highlights.white }}>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">
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
              </span>
            </motion.div>
            <motion.div 
              className="flex gap-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={resetParameters}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300 h-6 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startAnimation}
                disabled={isAnimating}
                className="flex items-center gap-1 bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 h-6 px-2 text-xs"
              >
                {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isAnimating ? 'Playing...' : 'Animate'}
              </Button>
            </motion.div>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Interactive Graph with Trademark Styling */}
        <motion.div 
          className="w-full h-96 border rounded-xl shadow-2xl overflow-hidden"
          style={{
            borderColor: PROFESSIONAL_COLORS.accents.steel,
            background: PROFESSIONAL_THEME.background.surface,
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
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

        {/* Compact Coefficient Controls - 2 Lines */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {initialParameters.map((param, index) => (
            <motion.div 
              key={param.name} 
              className="space-y-2 p-3 rounded bg-gray-50 border"
              style={{ borderColor: '#E5E7EB' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {/* First Line: Label and Value */}
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor={param.name} 
                  className="text-sm font-semibold"
                  style={{ color: '#374151' }}
                >
                  {param.label}
                </Label>
                <Input
                  id={param.name}
                  type="number"
                  value={parameters[param.name]?.toFixed(3) || param.value}
                  onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || param.value)}
                  className="w-16 h-6 text-center font-mono text-sm border"
                  style={{
                    borderColor: '#D1D5DB',
                    backgroundColor: 'white',
                    color: '#111827'
                  }}
                  step={param.step}
                  min={param.min}
                  max={param.max}
                />
              </div>
              
              {/* Second Line: Slider and Description */}
              <div className="space-y-1">
                <Slider
                  value={[parameters[param.name] || param.value]}
                  onValueChange={(values) => handleParameterChange(param.name, values[0])}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  className="w-full"
                />
                {param.description && (
                  <p className="text-xs text-gray-600">
                    {param.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </CardContent>
    </Card>
    </motion.div>
  );
};

export default InteractiveGraph;