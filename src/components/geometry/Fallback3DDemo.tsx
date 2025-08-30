import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Play, Pause, Volume2, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { mathSounds } from '@/utils/mathSounds';

interface FallbackGeometryConfig {
  type: 'cube' | 'sphere';
  dimensions: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
  };
  showWireframe: boolean;
  animation: 'rotate' | 'bounce' | 'pulse' | 'none';
}

// 2D Canvas-based 3D visualization fallback
const Canvas3DFallback: React.FC<{
  config: FallbackGeometryConfig;
  isAnimating: boolean;
}> = ({ config, isAnimating }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef({ x: 0.3, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set up gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#F8FAFC');
      gradient.addColorStop(1, '#E2E8F0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (config.type === 'cube') {
        drawIsometric3DCube(ctx, centerX, centerY, config, rotationRef.current);
      } else if (config.type === 'sphere') {
        drawIsometric3DSphere(ctx, centerX, centerY, config, rotationRef.current);
      }

      // Update rotation for animation
      if (isAnimating) {
        switch (config.animation) {
          case 'rotate':
            rotationRef.current.y += 0.02;
            rotationRef.current.x += 0.01;
            break;
          case 'pulse':
            // Handled in drawing functions
            break;
        }
      }
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config, isAnimating]);

  const drawIsometric3DCube = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, config: FallbackGeometryConfig, rotation: { x: number; y: number }) => {
    const { width = 1, height = 1, depth = 1 } = config.dimensions;
    const scale = 60;
    const w = width * scale;
    const h = height * scale;
    const d = depth * scale;

    // Pulse animation
    let pulseScale = 1;
    if (config.animation === 'pulse' && isAnimating) {
      pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
    }

    const scaledW = w * pulseScale;
    const scaledH = h * pulseScale;
    const scaledD = d * pulseScale;

    // Isometric projection points
    const points = {
      // Front face
      a: [centerX - scaledW/2, centerY + scaledH/2],
      b: [centerX + scaledW/2, centerY + scaledH/2],
      c: [centerX + scaledW/2, centerY - scaledH/2],
      d: [centerX - scaledW/2, centerY - scaledH/2],
      // Back face (with depth)
      e: [centerX - scaledW/2 + scaledD/3, centerY + scaledH/2 - scaledD/3],
      f: [centerX + scaledW/2 + scaledD/3, centerY + scaledH/2 - scaledD/3],
      g: [centerX + scaledW/2 + scaledD/3, centerY - scaledH/2 - scaledD/3],
      h: [centerX - scaledW/2 + scaledD/3, centerY - scaledH/2 - scaledD/3]
    };

    // Draw faces with gradient
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;

    // Front face (lightest)
    ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.beginPath();
    ctx.moveTo(points.a[0], points.a[1]);
    ctx.lineTo(points.b[0], points.b[1]);
    ctx.lineTo(points.c[0], points.c[1]);
    ctx.lineTo(points.d[0], points.d[1]);
    ctx.closePath();
    ctx.fill();
    if (config.showWireframe) ctx.stroke();

    // Top face (medium)
    ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.beginPath();
    ctx.moveTo(points.d[0], points.d[1]);
    ctx.lineTo(points.c[0], points.c[1]);
    ctx.lineTo(points.g[0], points.g[1]);
    ctx.lineTo(points.h[0], points.h[1]);
    ctx.closePath();
    ctx.fill();
    if (config.showWireframe) ctx.stroke();

    // Right face (darkest)
    ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.beginPath();
    ctx.moveTo(points.b[0], points.b[1]);
    ctx.lineTo(points.f[0], points.f[1]);
    ctx.lineTo(points.g[0], points.g[1]);
    ctx.lineTo(points.c[0], points.c[1]);
    ctx.closePath();
    ctx.fill();
    if (config.showWireframe) ctx.stroke();

    // Add dimension labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px monospace';
    ctx.fillText(`w: ${width.toFixed(1)}`, centerX + scaledW/2 + 10, centerY);
    ctx.fillText(`h: ${height.toFixed(1)}`, centerX - 30, centerY - scaledH/2);
    ctx.fillText(`d: ${depth.toFixed(1)}`, centerX + scaledW/2 + scaledD/3 + 10, centerY - scaledH/2 - scaledD/3);
  };

  const drawIsometric3DSphere = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, config: FallbackGeometryConfig, rotation: { x: number; y: number }) => {
    const { radius = 1 } = config.dimensions;
    const scale = 60;
    const r = radius * scale;

    // Pulse animation
    let pulseScale = 1;
    if (config.animation === 'pulse' && isAnimating) {
      pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
    }

    const scaledR = r * pulseScale;

    // Main sphere with gradient
    const gradient = ctx.createRadialGradient(
      centerX - scaledR/3, centerY - scaledR/3, 0,
      centerX, centerY, scaledR
    );
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scaledR, 0, 2 * Math.PI);
    ctx.fill();

    if (config.showWireframe) {
      // Draw wireframe circles
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
      ctx.lineWidth = 2;
      
      // Main circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, scaledR, 0, 2 * Math.PI);
      ctx.stroke();

      // Horizontal circles
      for (let i = -1; i <= 1; i++) {
        const y = centerY + i * scaledR * 0.6;
        const ellipseR = Math.sqrt(Math.max(0, scaledR * scaledR - (i * scaledR * 0.6) * (i * scaledR * 0.6)));
        ctx.beginPath();
        ctx.ellipse(centerX, y, ellipseR, ellipseR * 0.3, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Vertical circles
      for (let i = -1; i <= 1; i++) {
        const offset = i * scaledR * 0.6;
        ctx.beginPath();
        ctx.ellipse(centerX + offset, centerY, Math.abs(offset * 0.3), scaledR, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // Radius line
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + scaledR, centerY);
    ctx.stroke();

    // Add dimension label
    ctx.fillStyle = '#374151';
    ctx.font = '12px monospace';
    ctx.fillText(`r: ${radius.toFixed(1)}`, centerX + scaledR/2 - 15, centerY - 10);
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="w-full h-full border rounded-lg shadow-inner"
      style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)' }}
    />
  );
};

interface Fallback3DDemoProps {
  config: FallbackGeometryConfig;
  onConfigChange?: (config: FallbackGeometryConfig) => void;
  className?: string;
}

export const Fallback3DDemo: React.FC<Fallback3DDemoProps> = ({
  config,
  onConfigChange,
  className = ""
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleDimensionChange = async (dimension: string, value: number) => {
    if (soundEnabled) {
      await mathSounds.playParameterChange();
    }
    
    const newConfig = {
      ...config,
      dimensions: { ...config.dimensions, [dimension]: value }
    };
    onConfigChange?.(newConfig);
  };

  const resetView = async () => {
    if (soundEnabled) {
      await mathSounds.playReset();
    }
  };

  const toggleAnimation = async () => {
    if (soundEnabled) {
      await mathSounds.playSuccess();
    }
    setIsAnimating(!isAnimating);
  };

  // Calculate volume and surface area
  const getVolumeAndSurface = () => {
    const { type, dimensions } = config;
    let volume = 0;
    let surfaceArea = 0;
    
    switch (type) {
      case 'cube':
        const { width = 1, height = 1, depth = 1 } = dimensions;
        volume = width * height * depth;
        surfaceArea = 2 * (width * height + height * depth + depth * width);
        break;
      case 'sphere':
        const { radius = 1 } = dimensions;
        volume = (4/3) * Math.PI * Math.pow(radius, 3);
        surfaceArea = 4 * Math.PI * Math.pow(radius, 2);
        break;
    }
    
    return { volume, surfaceArea };
  };

  const { volume, surfaceArea } = getVolumeAndSurface();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card className="border-2 shadow-xl" style={{ borderColor: '#6366F1' }}>
        <CardHeader 
          className="border-b-2 p-6"
          style={{
            borderColor: '#6366F1',
            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)'
          }}
        >
          <CardTitle className="flex items-center justify-between text-white">
            <motion.div className="flex items-center gap-3">
              <Zap className="h-6 w-6" />
              <span className="text-xl font-bold">🔷 3D Geometry Visualizer</span>
            </motion.div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Volume2 className="h-4 w-4" />
                {soundEnabled ? 'On' : 'Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAnimation}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAnimating ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* WebGL Compatibility Notice */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                🎨 Canvas-Powered 3D Visualization - Optimized for maximum compatibility!
              </span>
            </div>
          </div>

          {/* 3D Viewport */}
          <div className="h-96 border-2 rounded-xl overflow-hidden shadow-lg" style={{ borderColor: '#6366F1' }}>
            <Canvas3DFallback config={config} isAnimating={isAnimating} />
          </div>

          {/* Interactive Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#6366F1' }}>
                <Sparkles className="h-5 w-5" />
                📐 Dimensions
              </h3>
              
              {config.type === 'cube' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Width: {config.dimensions.width?.toFixed(1)}</label>
                    <Slider
                      value={[config.dimensions.width || 1]}
                      onValueChange={([value]) => handleDimensionChange('width', value)}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Height: {config.dimensions.height?.toFixed(1)}</label>
                    <Slider
                      value={[config.dimensions.height || 1]}
                      onValueChange={([value]) => handleDimensionChange('height', value)}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Depth: {config.dimensions.depth?.toFixed(1)}</label>
                    <Slider
                      value={[config.dimensions.depth || 1]}
                      onValueChange={([value]) => handleDimensionChange('depth', value)}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {config.type === 'sphere' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Radius: {config.dimensions.radius?.toFixed(1)}</label>
                  <Slider
                    value={[config.dimensions.radius || 1]}
                    onValueChange={([value]) => handleDimensionChange('radius', value)}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#6366F1' }}>
                <Sparkles className="h-5 w-5" />
                📊 Measurements
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg border-2" style={{ borderColor: '#6366F1' }}>
                  <div className="font-bold text-lg" style={{ color: '#6366F1' }}>{volume.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Volume</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border-2" style={{ borderColor: '#8B5CF6' }}>
                  <div className="font-bold text-lg" style={{ color: '#8B5CF6' }}>{surfaceArea.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Surface Area</div>
                </div>
              </div>
              
              {/* Visual options */}
              <div className="space-y-2">
                <h4 className="font-semibold">Visual Options</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    className={`cursor-pointer transition-colors ${
                      config.showWireframe ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => onConfigChange?.({ ...config, showWireframe: !config.showWireframe })}
                  >
                    Wireframe {config.showWireframe ? '✓' : '○'}
                  </Badge>
                </div>
              </div>

              {/* Animation Controls */}
              <div className="space-y-2">
                <h4 className="font-semibold">Animation Type</h4>
                <div className="flex flex-wrap gap-2">
                  {['rotate', 'pulse', 'none'].map((animType) => (
                    <Badge
                      key={animType}
                      className={`cursor-pointer transition-colors capitalize ${
                        config.animation === animType 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-300 text-gray-700'
                      }`}
                      onClick={() => onConfigChange?.({ ...config, animation: animType as any })}
                    >
                      {animType}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Fallback3DDemo;