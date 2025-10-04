import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, BookOpen, Zap } from 'lucide-react';
import InteractiveMathContainer from './InteractiveMathContainer';
import MathCanvas from './shared/MathCanvas';
import ControlPanel from './shared/ControlPanel';
import SolutionPanel from './shared/SolutionPanel';
import { useTheme } from '@/contexts/ThemeContext';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  v0x: number;
  v0y: number;
}

interface TrailPoint {
  x: number;
  y: number;
}

const ProjectileMotion: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [velocity, setVelocity] = useState(50);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.8);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [time, setTime] = useState(0);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  
  const animationIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Statistics
  const [stats, setStats] = useState({
    maxHeight: 0,
    totalRange: 0,
    flightTime: 0,
    impactSpeed: 0,
    currentHeight: 0,
    currentDistance: 0,
    currentSpeed: 0
  });

  const scale = 3;
  const tankX = 50;
  const tankY = 450; // Fixed tank position

  const calculateTrajectoryValues = useCallback(() => {
    const angleRad = (angle * Math.PI) / 180;
    const v0x = velocity * Math.cos(angleRad);
    const v0y = velocity * Math.sin(angleRad);
    
    const maxHeight = (v0y * v0y) / (2 * gravity);
    const flightTime = (2 * v0y) / gravity;
    const range = v0x * flightTime;
    const impactSpeed = Math.sqrt(v0x * v0x + v0y * v0y);
    
    return { v0x, v0y, maxHeight, flightTime, range, impactSpeed, angleRad };
  }, [velocity, angle, gravity]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Draw thin black grid lines on white background
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Labels
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 12px Arial';
    
    // Distance markers
    for (let x = tankX; x < canvas.width; x += 100) {
      const meters = Math.round((x - tankX) / scale);
      ctx.fillText(`${meters}m`, x - 10, tankY + 35);
    }
    
    // Height markers
    for (let y = tankY - 100; y > 0; y -= 100) {
      const meters = Math.round((tankY - y) / scale);
      ctx.fillText(`${meters}m`, 10, y + 5);
    }
  }, [tankY, scale, tankX]);

  const drawTank = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(tankX, tankY);
    
    // Tank body
    ctx.fillStyle = isDarkMode ? '#374151' : '#6b7280';
    ctx.fillRect(-20, -15, 40, 30);
    
    // Cannon
    const angleRad = (angle * Math.PI) / 180;
    ctx.strokeStyle = isDarkMode ? '#1f2937' : '#374151';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angleRad) * 35, -Math.sin(angleRad) * 35);
    ctx.stroke();
    
    // Wheels
    ctx.fillStyle = isDarkMode ? '#111827' : '#1f2937';
    for (let i = -15; i <= 15; i += 10) {
      ctx.beginPath();
      ctx.arc(i, 20, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Angle arc
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 25, -angleRad, 0);
    ctx.stroke();
    
    // Angle label
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${angle}°`, 30, -10);
    
    ctx.restore();
  }, [angle, isDarkMode, tankX, tankY]);

  const drawPredictedPath = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (isAnimating) return;
    
    const { v0x, v0y, maxHeight, range } = calculateTrajectoryValues();
    
    // Draw predicted trajectory
    ctx.strokeStyle = isDarkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    let firstPoint = true;
    for (let t = 0; t < 20; t += 0.1) {
      const x = tankX + v0x * t * scale;
      const y = tankY - (v0y * t - 0.5 * gravity * t * t) * scale;
      
      if (y > canvas.height) break;
      
      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw max height indicator
    const maxHeightY = tankY - maxHeight * scale;
    const tPeak = v0y / gravity;
    const maxHeightX = tankX + v0x * tPeak * scale;
    
    if (maxHeightY > 0) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(tankX, maxHeightY);
      ctx.lineTo(maxHeightX, maxHeightY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`H_max = ${maxHeight.toFixed(1)}m`, maxHeightX + 10, maxHeightY);
    }
    
    // Draw range indicator
    const rangeX = tankX + range * scale;
    if (rangeX < canvas.width) {
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tankX, tankY + 10);
      ctx.lineTo(rangeX, tankY + 10);
      ctx.stroke();
      
      // Arrow
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(rangeX, tankY + 10);
      ctx.lineTo(rangeX - 10, tankY + 5);
      ctx.lineTo(rangeX - 10, tankY + 15);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`Range = ${range.toFixed(1)}m`, (tankX + rangeX) / 2 - 30, tankY + 30);
    }
  }, [isAnimating, calculateTrajectoryValues, isDarkMode, tankX, tankY, scale, gravity]);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid(ctx, canvas);
    drawTank(ctx);
    
    if (!isAnimating) {
      drawPredictedPath(ctx, canvas);
      return;
    }
    
    // Draw trail
    if (trail.length > 1) {
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < trail.length; i++) {
        if (i === 0) {
          ctx.moveTo(trail[i].x, trail[i].y);
        } else {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
      }
      ctx.stroke();
    }
    
    // Draw projectile
    if (projectile) {
      ctx.fillStyle = '#ea580c';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ea580c';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw velocity vector
      const vx = projectile.vx * scale * 0.5;
      const vy = -projectile.vy * scale * 0.5;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(projectile.x + vx, projectile.y + vy);
      ctx.stroke();
      
      // Velocity vector arrow
      const arrowAngle = Math.atan2(vy, vx);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(projectile.x + vx, projectile.y + vy);
      ctx.lineTo(
        projectile.x + vx - 10 * Math.cos(arrowAngle - Math.PI / 6),
        projectile.y + vy - 10 * Math.sin(arrowAngle - Math.PI / 6)
      );
      ctx.lineTo(
        projectile.x + vx - 10 * Math.cos(arrowAngle + Math.PI / 6),
        projectile.y + vy - 10 * Math.sin(arrowAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      
      // Position labels
      const actualHeight = Math.max(0, (tankY - projectile.y) / scale);
      const actualDistance = (projectile.x - tankX) / scale;
      
      ctx.fillStyle = isDarkMode ? '#fff' : '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`x = ${actualDistance.toFixed(1)}m`, projectile.x + 15, projectile.y - 15);
      ctx.fillText(`y = ${actualHeight.toFixed(1)}m`, projectile.x + 15, projectile.y + 5);
      ctx.fillText(`t = ${time.toFixed(2)}s`, projectile.x + 15, projectile.y + 25);
    }
  }, [drawGrid, drawTank, drawPredictedPath, isAnimating, trail, projectile, time, isDarkMode, tankX, tankY, scale]);

  const onCanvasReady = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    canvasRef.current = canvas;
    ctxRef.current = ctx;
    
    drawFrame(ctx, canvas);
  }, [drawFrame]);

  const animate = useCallback(() => {
    if (!ctxRef.current || !canvasRef.current || !projectile) return;
    
    const dt = 0.05;
    const newTime = time + dt;
    
    const newProjectile = {
      ...projectile,
      x: projectile.x + projectile.vx * scale * dt,
      y: projectile.y - projectile.vy * scale * dt,
      vy: projectile.vy - gravity * dt
    };
    
    const newTrail = [...trail, { x: newProjectile.x, y: newProjectile.y }];
    
    setProjectile(newProjectile);
    setTrail(newTrail);
    setTime(newTime);
    
    // Update current stats
    const actualHeight = Math.max(0, (tankY - newProjectile.y) / scale);
    const actualDistance = (newProjectile.x - tankX) / scale;
    const speed = Math.sqrt(newProjectile.vx * newProjectile.vx + newProjectile.vy * newProjectile.vy);
    
    setStats(prev => ({
      ...prev,
      currentHeight: actualHeight,
      currentDistance: actualDistance,
      currentSpeed: speed
    }));
    
    drawFrame(ctxRef.current, canvasRef.current);
    
    // Check if projectile hit ground
    if (newProjectile.y >= tankY && newTime > 0.1) {
      setIsAnimating(false);
      
      // Calculate final stats
      const { maxHeight, flightTime, range, impactSpeed } = calculateTrajectoryValues();
      setStats(prev => ({
        ...prev,
        maxHeight,
        totalRange: range,
        flightTime,
        impactSpeed
      }));
      
      return;
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [projectile, time, trail, drawFrame, gravity, scale, tankY, tankX, calculateTrajectoryValues]);

  const fire = () => {
    if (isAnimating) return;
    
    const { v0x, v0y } = calculateTrajectoryValues();
    
    setProjectile({
      x: tankX,
      y: tankY,
      vx: v0x,
      vy: v0y,
      v0x,
      v0y
    });
    
    setTrail([]);
    setTime(0);
    setIsAnimating(true);
  };

  const reset = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    setIsAnimating(false);
    setProjectile(null);
    setTrail([]);
    setTime(0);
    
    setStats({
      maxHeight: 0,
      totalRange: 0,
      flightTime: 0,
      impactSpeed: 0,
      currentHeight: 0,
      currentDistance: 0,
      currentSpeed: 0
    });
    
    if (ctxRef.current && canvasRef.current) {
      drawFrame(ctxRef.current, canvasRef.current);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      animationIdRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isAnimating, animate]);

  useEffect(() => {
    if (ctxRef.current && canvasRef.current) {
      drawFrame(ctxRef.current, canvasRef.current);
    }
  }, [velocity, angle, gravity, drawFrame]);

  const sliders = [
    {
      label: "Initial Velocity",
      value: velocity,
      min: 10,
      max: 100,
      step: 1,
      unit: " m/s",
      onChange: setVelocity
    },
    {
      label: "Launch Angle",
      value: angle,
      min: 0,
      max: 90,
      step: 1,
      unit: "°",
      onChange: setAngle
    },
    {
      label: "Gravity",
      value: gravity,
      min: 1,
      max: 20,
      step: 0.1,
      unit: " m/s²",
      onChange: setGravity
    }
  ];

  const actions = [
    {
      label: isAnimating ? "Pause" : "🔥 Fire!",
      onClick: isAnimating ? () => setIsAnimating(false) : fire,
      variant: "primary" as const,
      icon: isAnimating ? <Pause className="w-4 h-4" /> : <Zap className="w-4 h-4" />
    },
    {
      label: "🔄 Reset",
      onClick: reset,
      variant: "secondary" as const,
      icon: <RotateCcw className="w-4 h-4" />
    },
    {
      label: "📖 Show Solution",
      onClick: () => setShowSolution(!showSolution),
      variant: "success" as const,
      icon: <BookOpen className="w-4 h-4" />
    }
  ];

  const displayStats = [
    { label: "Max Height", value: stats.maxHeight.toFixed(1), unit: " m" },
    { label: "Total Range", value: stats.totalRange.toFixed(1), unit: " m" },
    { label: "Flight Time", value: stats.flightTime.toFixed(1), unit: " s" },
    { label: "Impact Speed", value: stats.impactSpeed.toFixed(1), unit: " m/s" },
    { label: "Current Height", value: stats.currentHeight.toFixed(1), unit: " m" },
    { label: "Current Distance", value: stats.currentDistance.toFixed(1), unit: " m" }
  ];

  const legend = [
    { color: '#ea580c', label: 'Projectile Path' },
    { color: '#f97316', label: 'Velocity Vector' },
    { color: isDarkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.6)', label: 'Predicted Trajectory' },
    { color: '#ea580c', label: 'Grid & Measurements' }
  ];

  const solutionSteps = [
    {
      title: "Break Down Initial Velocity",
      description: "First, we decompose the initial velocity into horizontal and vertical components using trigonometry.",
      formula: "v₀ₓ = v₀ × cos(θ)\nv₀ᵧ = v₀ × sin(θ)",
      calculation: `v₀ₓ = ${velocity} × cos(${angle}°) = ${(velocity * Math.cos(angle * Math.PI / 180)).toFixed(2)} m/s\nv₀ᵧ = ${velocity} × sin(${angle}°) = ${(velocity * Math.sin(angle * Math.PI / 180)).toFixed(2)} m/s`,
      result: `Horizontal: ${(velocity * Math.cos(angle * Math.PI / 180)).toFixed(2)} m/s, Vertical: ${(velocity * Math.sin(angle * Math.PI / 180)).toFixed(2)} m/s`
    },
    {
      title: "Calculate Maximum Height",
      description: "The maximum height occurs when the vertical velocity becomes zero.",
      formula: "H_max = (v₀ᵧ)² / (2g)",
      calculation: `H_max = (${(velocity * Math.sin(angle * Math.PI / 180)).toFixed(2)})² / (2 × ${gravity}) = ${calculateTrajectoryValues().maxHeight.toFixed(2)} m`,
      result: `Maximum height: ${calculateTrajectoryValues().maxHeight.toFixed(2)} m`
    },
    {
      title: "Calculate Flight Time",
      description: "For a projectile launched and landing at the same height:",
      formula: "t_total = (2 × v₀ᵧ) / g",
      calculation: `t_total = (2 × ${(velocity * Math.sin(angle * Math.PI / 180)).toFixed(2)}) / ${gravity} = ${calculateTrajectoryValues().flightTime.toFixed(2)} s`,
      result: `Total flight time: ${calculateTrajectoryValues().flightTime.toFixed(2)} s`
    },
    {
      title: "Calculate Range",
      description: "The horizontal distance traveled during flight time:",
      formula: "R = v₀ₓ × t_total",
      calculation: `R = ${(velocity * Math.cos(angle * Math.PI / 180)).toFixed(2)} × ${calculateTrajectoryValues().flightTime.toFixed(2)} = ${calculateTrajectoryValues().range.toFixed(2)} m`,
      result: `Total range: ${calculateTrajectoryValues().range.toFixed(2)} m`,
      insights: [
        "The trajectory is always a parabola (ignoring air resistance)",
        "Maximum range occurs at 45° angle (when landing at same height)",
        "Horizontal velocity remains constant throughout flight",
        "Vertical velocity changes due to gravity",
        "Time up = Time down (for symmetric trajectory)"
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-50'
    } overflow-x-hidden`}>
      {/* Glassmorphism Header */}
      <header className="text-center py-8 mb-8">
        <div className={`mx-auto max-w-4xl backdrop-blur-sm rounded-2xl p-8 border shadow-2xl ${
          isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-orange-200'
        }`}>
          <h1 className={`text-5xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent'
          }`}>
            🚀 Projectile Motion Visualizer
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Master Physics & Math Through Interactive Visualization
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Canvas Section */}
          <div className="lg:col-span-3">
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-2xl relative ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-orange-200'
            }`}>
              <MathCanvas
                ref={canvasRef}
                height={500}
                onCanvasReady={onCanvasReady}
                className="shadow-inner"
              >
                {/* Enhanced Info overlay with glassmorphism */}
                <div className={`absolute top-6 left-6 backdrop-blur-lg rounded-xl p-4 border shadow-lg ${
                  isDarkMode ? 'bg-gray-800/95 border-gray-600' : 'bg-white/95 border-orange-300'
                }`}>
                  <div className={`text-sm space-y-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <strong>Time:</strong> <span className="text-orange-600 font-mono">{time.toFixed(2)} s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <strong>Height:</strong> <span className="text-orange-600 font-mono">{stats.currentHeight.toFixed(1)} m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                      <strong>Distance:</strong> <span className="text-orange-600 font-mono">{stats.currentDistance.toFixed(1)} m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <strong>Speed:</strong> <span className="text-orange-600 font-mono">{stats.currentSpeed.toFixed(1)} m/s</span>
                    </div>
                  </div>
                </div>
              </MathCanvas>
            </div>
          </div>

          {/* Enhanced Controls Section */}
          <div className="lg:col-span-1">
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-2xl max-h-[500px] overflow-y-auto ${
              isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-orange-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                ⚙️ Controls
              </h2>
              
              {/* Enhanced Sliders */}
              {sliders.map((slider, index) => (
                <div key={index} className="mb-6">
                  <label className={`block mb-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {slider.label}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={slider.value}
                      onChange={(e) => slider.onChange(parseFloat(e.target.value))}
                      className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                        isDarkMode ? 'bg-gray-700' : 'bg-orange-100'
                      }`}
                      style={{
                        background: `linear-gradient(to right, #ea580c 0%, #ea580c ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, ${isDarkMode ? '#374151' : '#fed7aa'} ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, ${isDarkMode ? '#374151' : '#fed7aa'} 100%)`
                      }}
                    />
                    <div className={`min-w-[80px] text-center px-3 py-1 rounded-lg font-bold ${
                      isDarkMode ? 'bg-orange-900/30 text-orange-400 border border-orange-600' : 'bg-orange-50 text-orange-800 border border-orange-300'
                    }`}>
                      {slider.value}{slider.unit}
                    </div>
                  </div>
                </div>
              ))}

              {/* Enhanced Action Buttons */}
              <div className="space-y-3 mb-6">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`w-full px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      action.variant === 'primary' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/40' 
                        : action.variant === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/40'
                        : isDarkMode
                        ? 'bg-gray-700 text-white border-2 border-gray-600 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 border-2 border-gray-300 hover:bg-gray-200'
                    } ${action.disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Enhanced Statistics Grid */}
              <div className="grid grid-cols-1 gap-3">
                {displayStats.slice(0, 4).map((stat, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {stat.value}{stat.unit}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Legend */}
              <div className={`mt-6 p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-orange-50 border-orange-200'
              }`}>
                <h4 className={`text-sm font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Legend
                </h4>
                {legend.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <div
                      className="w-5 h-5 rounded border"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Solution Panel */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showSolution ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`backdrop-blur-sm rounded-2xl p-8 border shadow-2xl ${
            isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-orange-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-8 text-center ${
              isDarkMode ? 'text-white' : 'bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent'
            }`}>
              📐 Step-by-Step Solution
            </h2>
            
            {solutionSteps.map((step, index) => (
              <div key={index} className={`mb-6 p-6 rounded-xl border-l-4 border-orange-500 ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-orange-50'
              }`}>
                <h3 className="text-lg font-semibold mb-3 text-orange-600">
                  Step {index + 1}: {step.title}
                </h3>
                
                <p className={`mb-4 leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {step.description}
                </p>
                
                {step.formula && (
                  <div className={`p-4 rounded-lg font-mono text-lg border mb-4 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-200' 
                      : 'bg-white border-orange-200 text-gray-900'
                  }`}>
                    {step.formula}
                  </div>
                )}
                
                {step.calculation && (
                  <div className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="font-semibold text-orange-600 mb-2">Calculation:</p>
                    <p className="font-mono bg-orange-100 dark:bg-orange-900/30 p-3 rounded border">
                      {step.calculation}
                    </p>
                  </div>
                )}
                
                {step.result && (
                  <div className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="font-semibold text-orange-600 mb-2">Result:</p>
                    <p className="font-bold text-lg text-orange-600">{step.result}</p>
                  </div>
                )}
                
                {step.insights && step.insights.length > 0 && (
                  <div className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="font-semibold text-orange-600 mb-2">💡 Key Insights:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {step.insights.map((insight, i) => (
                        <li key={i} className="leading-relaxed">{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            
            <div className={`mt-8 p-6 rounded-xl border ${
              isDarkMode 
                ? 'bg-orange-900/20 border-orange-600' 
                : 'bg-orange-50 border-orange-300'
            }`}>
              <h3 className="text-lg font-semibold mb-3 text-orange-600 flex items-center gap-2">
                🎯 Mathematical Mastery
              </h3>
              <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>• <strong>Understanding:</strong> Visualize the relationship between variables</p>
                <p>• <strong>Application:</strong> Apply formulas to solve real-world problems</p>
                <p>• <strong>Analysis:</strong> Interpret results and their physical meaning</p>
                <p>• <strong>Connection:</strong> Link mathematical concepts to practical scenarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for enhanced styling */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.5);
          border: 2px solid white;
          transition: all 0.3s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(234, 88, 12, 0.7);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.5);
          border: 2px solid white;
          transition: all 0.3s ease;
        }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ProjectileMotion;