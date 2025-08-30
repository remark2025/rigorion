import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'star' | 'circle' | 'equation' | 'number';
  content?: string;
}

interface ParticleSystemConfig {
  particleCount: number;
  emissionRate: number;
  lifespan: number;
  speed: { min: number; max: number };
  size: { min: number; max: number };
  gravity: number;
  colors: string[];
  type: 'success' | 'error' | 'step' | 'parameter' | 'victory';
}

const PARTICLE_CONFIGS: Record<string, ParticleSystemConfig> = {
  success: {
    particleCount: 20,
    emissionRate: 10,
    lifespan: 2000,
    speed: { min: 2, max: 6 },
    size: { min: 8, max: 16 },
    gravity: 0.1,
    colors: ['#10B981', '#34D399', '#6EE7B7'],
    type: 'success'
  },
  error: {
    particleCount: 15,
    emissionRate: 8,
    lifespan: 1500,
    speed: { min: 1, max: 4 },
    size: { min: 6, max: 12 },
    gravity: 0.05,
    colors: ['#EF4444', '#F87171', '#FCA5A5'],
    type: 'error'
  },
  step: {
    particleCount: 12,
    emissionRate: 6,
    lifespan: 1800,
    speed: { min: 1.5, max: 3.5 },
    size: { min: 4, max: 10 },
    gravity: 0.02,
    colors: ['#6366F1', '#818CF8', '#A5B4FC'],
    type: 'step'
  },
  parameter: {
    particleCount: 8,
    emissionRate: 4,
    lifespan: 1200,
    speed: { min: 1, max: 2 },
    size: { min: 3, max: 8 },
    gravity: 0,
    colors: ['#F59E0B', '#FBBF24', '#FCD34D'],
    type: 'parameter'
  },
  victory: {
    particleCount: 50,
    emissionRate: 25,
    lifespan: 3000,
    speed: { min: 3, max: 8 },
    size: { min: 12, max: 24 },
    gravity: 0.15,
    colors: ['#6366F1', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'],
    type: 'victory'
  }
};

// Mathematical symbols for equation particles
const MATH_SYMBOLS = ['∑', '∫', '∂', 'π', 'α', 'β', 'γ', 'δ', 'λ', '∞', '±', '≈', '≠', '≤', '≥'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface MathParticleSystemProps {
  trigger: boolean;
  type: keyof typeof PARTICLE_CONFIGS;
  position: { x: number; y: number };
  onComplete?: () => void;
  className?: string;
}

export const MathParticleSystem: React.FC<MathParticleSystemProps> = ({
  trigger,
  type,
  position,
  onComplete,
  className = ""
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const config = PARTICLE_CONFIGS[type];

  const createParticle = (emitX: number, emitY: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
    const size = config.size.min + Math.random() * (config.size.max - config.size.min);
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    
    let particleType: Particle['type'] = 'circle';
    let content = undefined;
    
    if (type === 'step' && Math.random() < 0.3) {
      particleType = 'equation';
      content = MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)];
    } else if (type === 'parameter' && Math.random() < 0.4) {
      particleType = 'number';
      content = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    } else if (type === 'victory' && Math.random() < 0.2) {
      particleType = 'star';
    } else {
      particleType = Math.random() < 0.7 ? 'circle' : 'spark';
    }

    return {
      id: Math.random().toString(36),
      x: emitX + (Math.random() - 0.5) * 20,
      y: emitY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2,
      life: config.lifespan,
      maxLife: config.lifespan,
      size,
      color,
      type: particleType,
      content
    };
  };

  const updateParticles = (deltaTime: number) => {
    setParticles(prevParticles => {
      const updatedParticles = prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx * deltaTime,
          y: particle.y + particle.vy * deltaTime,
          vy: particle.vy + config.gravity * deltaTime,
          life: particle.life - deltaTime * 16 // Assuming 60fps
        }))
        .filter(particle => particle.life > 0);

      return updatedParticles;
    });
  };

  const animate = (currentTime: number) => {
    if (!startTimeRef.current) startTimeRef.current = currentTime;
    const elapsed = currentTime - startTimeRef.current;
    const deltaTime = 16; // ~60fps

    // Emit new particles
    if (elapsed < config.lifespan && isActive) {
      const particlesToEmit = Math.floor(config.emissionRate * deltaTime / 1000);
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particlesToEmit; i++) {
        newParticles.push(createParticle(position.x, position.y));
      }
      
      setParticles(prev => [...prev, ...newParticles]);
    }

    updateParticles(deltaTime);

    if (elapsed < config.lifespan * 2) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setIsActive(false);
      setParticles([]);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      startTimeRef.current = 0;
      setParticles([]);
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trigger]);

  const renderParticle = (particle: Particle) => {
    const opacity = particle.life / particle.maxLife;
    const scale = Math.min(1, particle.life / (particle.maxLife * 0.3));

    const baseStyle = {
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      opacity,
      transform: `translate(-50%, -50%) scale(${scale})`,
      pointerEvents: 'none' as const
    };

    switch (particle.type) {
      case 'circle':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size}px ${particle.color}50`
            }}
          />
        );

      case 'spark':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              background: `linear-gradient(45deg, ${particle.color}, transparent)`,
              borderRadius: '50%',
              filter: 'blur(1px)'
            }}
          />
        );

      case 'star':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              color: particle.color,
              fontSize: particle.size,
              fontWeight: 'bold',
              textShadow: `0 0 ${particle.size/2}px ${particle.color}`
            }}
          >
            ⭐
          </div>
        );

      case 'equation':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              color: particle.color,
              fontSize: particle.size,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              textShadow: `0 0 ${particle.size/3}px ${particle.color}80`
            }}
          >
            {particle.content}
          </div>
        );

      case 'number':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              color: particle.color,
              fontSize: particle.size,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              textShadow: `0 0 ${particle.size/3}px ${particle.color}80`
            }}
          >
            {particle.content}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 1000 }}
    >
      {particles.map(renderParticle)}
    </div>
  );
};

// Hook for easy particle system integration
export const useMathParticles = () => {
  const [activeEffect, setActiveEffect] = useState<{
    type: keyof typeof PARTICLE_CONFIGS;
    position: { x: number; y: number };
  } | null>(null);

  const triggerParticles = (
    type: keyof typeof PARTICLE_CONFIGS,
    element?: HTMLElement | { x: number; y: number }
  ) => {
    let position = { x: 0, y: 0 };

    if (element && 'getBoundingClientRect' in element) {
      const rect = element.getBoundingClientRect();
      position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    } else if (element && 'x' in element && 'y' in element) {
      position = element;
    }

    setActiveEffect({ type, position });
    
    // Auto-clear after effect duration
    setTimeout(() => {
      setActiveEffect(null);
    }, PARTICLE_CONFIGS[type].lifespan * 2);
  };

  return {
    activeEffect,
    triggerParticles,
    ParticleComponent: activeEffect ? (
      <MathParticleSystem
        trigger={true}
        type={activeEffect.type}
        position={activeEffect.position}
        onComplete={() => setActiveEffect(null)}
      />
    ) : null
  };
};

export default MathParticleSystem;