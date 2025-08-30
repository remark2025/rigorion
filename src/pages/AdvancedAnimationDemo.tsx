import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, Zap, Play, Volume2, Rocket, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// Import our new components
import { Simple3DGeometry } from '@/components/geometry/Simple3DGeometry';
import { SimpleMotionExplainer } from '@/components/animations/SimpleMotionExplainer';
import { useMathParticles } from '@/components/effects/MathParticleSystem';
import { SAT_ANIMATIONS, SAT_TRANSITIONS } from '@/utils/advancedAnimations';

const AdvancedAnimationDemo: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { triggerParticles, ParticleComponent } = useMathParticles();
  
  const [cubeConfig, setCubeConfig] = useState({
    type: 'cube' as const,
    dimensions: { width: 1.5, height: 1.5, depth: 1.5 },
    showWireframe: true,
    showVertices: false,
    showEdges: false,
    showFaces: true,
    showMeasurements: true,
    animation: 'rotate' as const
  });
  
  const [sphereConfig, setSphereConfig] = useState({
    type: 'sphere' as const,
    dimensions: { radius: 1.2, segments: 32 },
    showWireframe: false,
    showVertices: false,
    showEdges: false,
    showFaces: true,
    showMeasurements: true,
    animation: 'pulse' as const
  });

  const [demoAnimations, setDemoAnimations] = useState({
    conceptReveal: false,
    equationMorph: false,
    parameterGlow: false,
    stepComplete: false
  });

  const triggerAnimation = (animationType: keyof typeof demoAnimations) => {
    setDemoAnimations(prev => ({ ...prev, [animationType]: true }));
    setTimeout(() => {
      setDemoAnimations(prev => ({ ...prev, [animationType]: false }));
    }, 2000);
  };

  const handleParticleDemo = (type: 'success' | 'error' | 'step' | 'parameter' | 'victory') => {
    const rect = document.getElementById('particle-demo-area')?.getBoundingClientRect();
    if (rect) {
      triggerParticles(type, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b shadow-sm`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/interactive-math')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Math Demo
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  🚀 Advanced Animation Showcase
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Next-generation animations for mathematical education
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Rocket className="h-4 w-4" />
              Cutting Edge
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-6 border-2 border-indigo-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Revolutionary Animation Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-2">🎬</div>
                  <h3 className="font-semibold mb-1 text-blue-800">Motion Canvas Style</h3>
                  <p className="text-sm text-blue-600">
                    Educational step-by-step explanations with smooth transitions
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl mb-2">🔷</div>
                  <h3 className="font-semibold mb-1 text-purple-800">Three.js 3D</h3>
                  <p className="text-sm text-purple-600">
                    Interactive 3D geometric visualizations with real-time controls
                  </p>
                </div>
                
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-3xl mb-2">✨</div>
                  <h3 className="font-semibold mb-1 text-amber-800">Particle Systems</h3>
                  <p className="text-sm text-amber-600">
                    Mathematical symbols and visual effects for engagement
                  </p>
                </div>
                
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-semibold mb-1 text-emerald-800">Enhanced Framer</h3>
                  <p className="text-sm text-emerald-600">
                    Physics-based animations with advanced easing and gestures
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border border-indigo-300">
                <h3 className="font-bold text-indigo-800 mb-2">🎯 What's New & Improved:</h3>
                <ul className="text-indigo-700 text-sm space-y-1">
                  <li>• <strong>3D Interactive Geometry</strong> - Three.js powered geometric visualizations</li>
                  <li>• <strong>Motion Canvas Explanations</strong> - Step-by-step mathematical proofs</li>
                  <li>• <strong>Advanced Particle Effects</strong> - Mathematical symbols and celebration effects</li>
                  <li>• <strong>Physics-Based Animations</strong> - Spring physics and realistic motion</li>
                  <li>• <strong>Sound-Synchronized Effects</strong> - Audio-visual feedback system</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Demo Tabs */}
        <Tabs defaultValue="3d-geometry" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="3d-geometry" className="flex items-center gap-2">
              <div className="text-lg">🔷</div>
              3D Geometry
            </TabsTrigger>
            <TabsTrigger value="motion-explanations" className="flex items-center gap-2">
              <div className="text-lg">🎬</div>
              Motion Explanations
            </TabsTrigger>
            <TabsTrigger value="particle-effects" className="flex items-center gap-2">
              <div className="text-lg">✨</div>
              Particle Effects
            </TabsTrigger>
            <TabsTrigger value="advanced-animations" className="flex items-center gap-2">
              <div className="text-lg">⚡</div>
              Advanced Animations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="3d-geometry" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="text-2xl">🧊</div>
                  Interactive 3D Cube
                </h3>
                <Simple3DGeometry
                  config={cubeConfig}
                  onConfigChange={setCubeConfig}
                />
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="text-2xl">🌐</div>
                  Interactive 3D Sphere
                </h3>
                <Simple3DGeometry
                  config={sphereConfig}
                  onConfigChange={setSphereConfig}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="motion-explanations" className="mt-6">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <SimpleMotionExplainer />
              </motion.div>
              
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">🎓 Educational Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl mb-2">👁️</div>
                      <h4 className="font-semibold text-blue-800">Visual Learning</h4>
                      <p className="text-sm text-blue-600">Students see concepts unfold step-by-step</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl mb-2">🧠</div>
                      <h4 className="font-semibold text-green-800">Cognitive Retention</h4>
                      <p className="text-sm text-green-600">Animations improve memory and understanding</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl mb-2">🎯</div>
                      <h4 className="font-semibold text-purple-800">Engagement</h4>
                      <p className="text-sm text-purple-600">Interactive elements maintain attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="particle-effects" className="mt-6">
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">✨ Mathematical Particle Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  id="particle-demo-area"
                  className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-indigo-300 flex items-center justify-center mb-6"
                >
                  <div className="text-center text-gray-600">
                    <div className="text-4xl mb-2">🎆</div>
                    <p>Click buttons below to see particle effects!</p>
                  </div>
                  {ParticleComponent}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Button
                    onClick={() => handleParticleDemo('success')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    ✅ Success
                  </Button>
                  <Button
                    onClick={() => handleParticleDemo('error')}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    ❌ Error
                  </Button>
                  <Button
                    onClick={() => handleParticleDemo('step')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    📚 Step
                  </Button>
                  <Button
                    onClick={() => handleParticleDemo('parameter')}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    ⚙️ Parameter
                  </Button>
                  <Button
                    onClick={() => handleParticleDemo('victory')}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    🏆 Victory
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">🔬 Particle System Features:</h4>
                  <ul className="text-amber-700 text-sm space-y-1">
                    <li>• Mathematical symbols (∑, ∫, π, ∞) for educational context</li>
                    <li>• Physics-based movement with gravity and velocity</li>
                    <li>• Contextual colors matching our trademark design system</li>
                    <li>• Performance-optimized with requestAnimationFrame</li>
                    <li>• Synchronized with sound effects for multi-sensory feedback</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced-animations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-indigo-800">🎭 Animation Showcase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    variants={SAT_ANIMATIONS.conceptReveal}
                    initial="hidden"
                    animate={demoAnimations.conceptReveal ? "visible" : "hidden"}
                    className="p-4 bg-indigo-50 rounded-lg border border-indigo-200"
                  >
                    <h4 className="font-semibold text-indigo-800">Concept Reveal Animation</h4>
                    <p className="text-sm text-indigo-600">Smooth mathematical concept introduction</p>
                  </motion.div>

                  <motion.div
                    variants={SAT_ANIMATIONS.equationMorph}
                    initial="initial"
                    animate={demoAnimations.equationMorph ? "animate" : "initial"}
                    className="p-4 rounded-lg text-white font-mono text-center"
                  >
                    y = ax² + bx + c
                  </motion.div>

                  <motion.div
                    variants={SAT_ANIMATIONS.parameterGlow}
                    initial="rest"
                    animate={demoAnimations.parameterGlow ? "active" : "rest"}
                    className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                  >
                    <h4 className="font-semibold text-amber-800">Parameter Glow Effect</h4>
                    <p className="text-sm text-amber-600">Interactive parameter highlighting</p>
                  </motion.div>

                  <motion.div
                    variants={SAT_ANIMATIONS.stepComplete}
                    initial="hidden"
                    animate={demoAnimations.stepComplete ? "visible" : "hidden"}
                    className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="text-2xl text-green-600">✅</div>
                    <span className="ml-2 font-semibold text-green-800">Step Complete!</span>
                  </motion.div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">🎮 Interactive Demo Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => triggerAnimation('conceptReveal')}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                    disabled={demoAnimations.conceptReveal}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Concept Reveal
                  </Button>
                  
                  <Button
                    onClick={() => triggerAnimation('equationMorph')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    disabled={demoAnimations.equationMorph}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Equation Morph
                  </Button>
                  
                  <Button
                    onClick={() => triggerAnimation('parameterGlow')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={demoAnimations.parameterGlow}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parameter Glow
                  </Button>
                  
                  <Button
                    onClick={() => triggerAnimation('stepComplete')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    disabled={demoAnimations.stepComplete}
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Step Complete
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">🚀 Performance & Technical Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-semibold text-green-800">60 FPS</h4>
                    <p className="text-sm text-green-600">Hardware-accelerated smooth animations</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold text-blue-800">Type Safe</h4>
                    <p className="text-sm text-blue-600">Full TypeScript integration</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="font-semibold text-purple-800">Responsive</h4>
                    <p className="text-sm text-purple-600">Works across all devices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technical Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="mt-8 border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-800">🛠️ Technology Stack Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">React Three Fiber</h4>
                  <p className="text-xs text-blue-600">3D WebGL rendering</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-1">Framer Motion</h4>
                  <p className="text-xs text-purple-600">Physics animations</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">Web Audio API</h4>
                  <p className="text-xs text-green-600">Procedural sound</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-1">TypeScript</h4>
                  <p className="text-xs text-amber-600">Type-safe development</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedAnimationDemo;