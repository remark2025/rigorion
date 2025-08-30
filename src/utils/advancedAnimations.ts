import { Variants, Transition } from 'framer-motion';

// Advanced animation presets for SAT Math
export const SAT_ANIMATIONS = {
  // Mathematical concept revelation
  conceptReveal: {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      filter: 'blur(10px)'
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        mass: 0.8,
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  },

  // Equation transformation
  equationMorph: {
    initial: { 
      rotateX: 0, 
      scale: 1,
      background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
    },
    animate: { 
      rotateX: [0, -90, 0],
      scale: [1, 1.05, 1],
      background: [
        'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
        'linear-gradient(90deg, #10B981 0%, #F59E0B 100%)',
        'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
      ],
      transition: {
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1],
        times: [0, 0.5, 1]
      }
    }
  },

  // Parameter slider glow effect
  parameterGlow: {
    rest: { 
      boxShadow: '0 0 0 0px rgba(99, 102, 241, 0)',
      scale: 1
    },
    active: { 
      boxShadow: [
        '0 0 0 0px rgba(99, 102, 241, 0)',
        '0 0 0 8px rgba(99, 102, 241, 0.3)',
        '0 0 0 16px rgba(99, 102, 241, 0.1)',
        '0 0 0 8px rgba(99, 102, 241, 0.3)'
      ],
      scale: [1, 1.02, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    }
  },

  // Graph point pulse
  graphPointPulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },

  // Step completion celebration
  stepComplete: {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 400,
        duration: 0.8
      }
    }
  },

  // Mathematical proof reveal
  proofReveal: {
    hidden: { 
      clipPath: 'inset(0 100% 0 0)',
      opacity: 0 
    },
    visible: { 
      clipPath: 'inset(0 0% 0 0)',
      opacity: 1,
      transition: {
        clipPath: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.4, delay: 0.3 }
      }
    }
  },

  // Interactive hover effects
  interactiveHover: {
    rest: { 
      scale: 1, 
      rotateY: 0,
      filter: 'brightness(1)'
    },
    hover: { 
      scale: 1.05, 
      rotateY: 5,
      filter: 'brightness(1.1)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        type: 'spring',
        stiffness: 600,
        damping: 20
      }
    }
  },

  // Particle burst effect
  particleBurst: {
    hidden: {
      scale: 0,
      opacity: 0,
      x: 0,
      y: 0
    },
    visible: (i: number) => ({
      scale: [0, 1, 0.5],
      opacity: [0, 1, 0],
      x: Math.cos(i * 0.628) * 50, // 2π/10 for 10 particles
      y: Math.sin(i * 0.628) * 50,
      transition: {
        duration: 1.5,
        ease: 'easeOut',
        delay: i * 0.05
      }
    })
  }
};

// Complex transition presets
export const SAT_TRANSITIONS = {
  bouncy: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
    mass: 0.8
  },
  
  smooth: {
    type: 'tween' as const,
    ease: [0.4, 0, 0.2, 1],
    duration: 0.6
  },
  
  elastic: {
    type: 'spring' as const,
    damping: 12,
    stiffness: 200,
    mass: 1.2
  },
  
  mathematical: {
    type: 'tween' as const,
    ease: [0.25, 0.46, 0.45, 0.94], // Custom bezier for math concepts
    duration: 0.8
  }
};

// Advanced gesture configurations
export const SAT_GESTURES = {
  parameterDrag: {
    dragConstraints: { left: 0, right: 300 },
    dragElastic: 0.1,
    dragMomentum: false,
    whileDrag: { scale: 1.05, cursor: 'grabbing' }
  },
  
  graphPan: {
    drag: true,
    dragConstraints: { left: -100, right: 100, top: -100, bottom: 100 },
    dragElastic: 0.2,
    onDragEnd: (event: any, info: any) => {
      // Snap back to center if dragged too far
      if (Math.abs(info.offset.x) > 150 || Math.abs(info.offset.y) > 150) {
        return { x: 0, y: 0 };
      }
    }
  }
};

// Animation orchestration helpers
export const createStaggeredAnimation = (
  children: number,
  baseDelay: number = 0.1
): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: baseDelay,
      staggerChildren: 0.1,
      when: 'beforeChildren'
    }
  }
});

export const createMathematicalTransition = (
  duration: number = 0.8,
  ease: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' = 'easeInOut'
): Transition => ({
  type: 'tween',
  duration,
  ease: ease === 'linear' ? 'linear' : [0.25, 0.46, 0.45, 0.94]
});