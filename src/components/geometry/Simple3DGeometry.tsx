import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Play, Pause, Volume2, Zap, Sparkles } from 'lucide-react';
import { mathSounds } from '@/utils/mathSounds';

// Extend Three.js objects for React Three Fiber
extend({ OrbitControls });

// Trademark colors for 3D materials
const GEOMETRY_COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6', 
  accent: '#F59E0B',
  success: '#10B981',
  surface: '#E0E7FF',
  wireframe: '#C7D2FE'
};

interface GeometryConfig {
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

// Simple 3D Cube Component
const SimpleCube: React.FC<{
  dimensions: { width: number; height: number; depth: number };
  showWireframe: boolean;
  animation: string;
}> = ({ dimensions, showWireframe, animation }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireframeRef = useRef<THREE.LineSegments>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    switch (animation) {
      case 'rotate':
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.x += 0.005;
        if (wireframeRef.current) {
          wireframeRef.current.rotation.y += 0.01;
          wireframeRef.current.rotation.x += 0.005;
        }
        break;
      case 'bounce':
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
        break;
      case 'pulse':
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
        break;
    }
  });

  return (
    <group>
      {/* Main solid cube */}
      <mesh ref={meshRef}>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshPhongMaterial 
          color={GEOMETRY_COLORS.primary}
          transparent
          opacity={0.8}
          shininess={100}
        />
      </mesh>
      
      {/* Wireframe overlay */}
      {showWireframe && (
        <lineSegments ref={wireframeRef}>
          <edgesGeometry args={[new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth)]} />
          <lineBasicMaterial color={GEOMETRY_COLORS.wireframe} linewidth={2} />
        </lineSegments>
      )}
      
      {/* Measurement labels */}
      <Html position={[dimensions.width/2 + 0.3, 0, 0]}>
        <div className="bg-white px-2 py-1 rounded shadow-lg text-xs font-mono border">
          w: {dimensions.width.toFixed(1)}
        </div>
      </Html>
      <Html position={[0, dimensions.height/2 + 0.3, 0]}>
        <div className="bg-white px-2 py-1 rounded shadow-lg text-xs font-mono border">
          h: {dimensions.height.toFixed(1)}
        </div>
      </Html>
      <Html position={[0, 0, dimensions.depth/2 + 0.3]}>
        <div className="bg-white px-2 py-1 rounded shadow-lg text-xs font-mono border">
          d: {dimensions.depth.toFixed(1)}
        </div>
      </Html>
    </group>
  );
};

// Simple 3D Sphere Component  
const SimpleSphere: React.FC<{
  radius: number;
  showWireframe: boolean;
  animation: string;
}> = ({ radius, showWireframe, animation }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    switch (animation) {
      case 'rotate':
        meshRef.current.rotation.y += 0.01;
        break;
      case 'pulse':
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
        meshRef.current.scale.setScalar(scale);
        break;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshPhongMaterial 
          color={GEOMETRY_COLORS.secondary}
          transparent
          opacity={0.8}
          shininess={100}
        />
      </mesh>
      
      {showWireframe && (
        <lineSegments>
          <wireframeGeometry args={[new THREE.SphereGeometry(radius, 16, 16)]} />
          <lineBasicMaterial color={GEOMETRY_COLORS.wireframe} />
        </lineSegments>
      )}
      
      {/* Radius indicator */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, radius, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={GEOMETRY_COLORS.accent} linewidth={3} />
      </line>
      
      <Html position={[radius/2, 0.3, 0]}>
        <div className="bg-white px-2 py-1 rounded shadow-lg text-xs font-mono border">
          r: {radius.toFixed(1)}
        </div>
      </Html>
    </group>
  );
};

// Main Simple 3D Geometry Component
interface Simple3DGeometryProps {
  config: GeometryConfig;
  onConfigChange?: (config: GeometryConfig) => void;
  className?: string;
}

export const Simple3DGeometry: React.FC<Simple3DGeometryProps> = ({
  config,
  onConfigChange,
  className = ""
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const renderShape = () => {
    try {
      switch (config.type) {
        case 'cube':
          return (
            <SimpleCube
              dimensions={{
                width: config.dimensions.width || 1,
                height: config.dimensions.height || 1,
                depth: config.dimensions.depth || 1
              }}
              showWireframe={config.showWireframe}
              animation={isAnimating ? config.animation : 'none'}
            />
          );
        case 'sphere':
          return (
            <SimpleSphere
              radius={config.dimensions.radius || 1}
              showWireframe={config.showWireframe}
              animation={isAnimating ? config.animation : 'none'}
            />
          );
        default:
          return null;
      }
    } catch (err) {
      setError('Error rendering 3D shape');
      return null;
    }
  };

  if (error) {
    return (
      <Card className="border-2 border-red-200">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 text-lg mb-2">⚠️ 3D Rendering Error</div>
          <p className="text-red-500 text-sm">
            The 3D geometry system is currently experiencing compatibility issues. 
            The 2D mathematical visualizations are still fully functional!
          </p>
          <Button 
            onClick={() => setError(null)} 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

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
              <span className="text-xl font-bold">🔷 3D Geometry Explorer</span>
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
          {/* 3D Viewport */}
          <div className="h-96 border-2 rounded-xl overflow-hidden shadow-lg" style={{ borderColor: '#6366F1' }}>
            <Suspense 
              fallback={
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-indigo-600 animate-spin" />
                    <p className="text-indigo-700">Loading 3D geometry...</p>
                  </div>
                </div>
              }
            >
              <Canvas camera={{ position: [3, 3, 3], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                
                {renderShape()}
                
                <OrbitControls 
                  enableDamping
                  dampingFactor={0.05}
                  minDistance={2}
                  maxDistance={10}
                />
                
                {/* Grid helper */}
                <gridHelper args={[10, 10]} />
              </Canvas>
            </Suspense>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Simple3DGeometry;