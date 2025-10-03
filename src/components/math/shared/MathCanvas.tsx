import React, { useRef, useEffect, ForwardedRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface MathCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  children?: React.ReactNode;
}

const MathCanvas = React.forwardRef<HTMLCanvasElement, MathCanvasProps>(
  ({ width = 800, height = 500, className = '', onCanvasReady, children }, ref) => {
    const { isDarkMode } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Configure high DPI support
      const devicePixelRatio = window.devicePixelRatio || 1;
      if (devicePixelRatio > 1) {
        canvas.width = canvas.offsetWidth * devicePixelRatio;
        canvas.height = canvas.offsetHeight * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = canvas.offsetHeight + 'px';
      }
      
      // Set default styling
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (onCanvasReady) {
        onCanvasReady(canvas, ctx);
      }
    }, [onCanvasReady]);
    
    return (
      <div className={`relative ${className}`}>
        <canvas
          ref={(node) => {
            canvasRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={`w-full rounded-lg cursor-crosshair border-2 transition-colors ${
            isDarkMode 
              ? 'bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 border-gray-600' 
              : 'bg-gradient-to-b from-orange-50 via-white to-orange-50 border-orange-200'
          }`}
          style={{ height: `${height}px` }}
        />
        {children}
      </div>
    );
  }
);

MathCanvas.displayName = 'MathCanvas';

export default MathCanvas;