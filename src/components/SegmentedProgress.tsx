
import React from 'react';
import { cn } from "@/lib/utils";

interface SegmentedProgressProps {
  progress: number;
  showLabel?: boolean;
  className?: string;
  total?: number;
  completed?: number;
}

const SegmentedProgress = ({
  progress,
  showLabel = true,
  className,
  total = 130,
  completed = 74
}: SegmentedProgressProps) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Calculate percentages for the color bars below
  const correctPercentage = 41;
  const incorrectPercentage = 16;
  const unattemptedPercentage = 43;
  
  return (
    <div className={cn("relative transition-all duration-300", className)}>
      {/* Simple circle progress with stroke */}
      <div className="relative w-full aspect-square">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#eeeeee" 
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          {normalizedProgress > 0 && (
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="black"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${normalizedProgress * 2.83} 283`}
              strokeDashoffset="70.75" // Offset to start at the top (283 * 0.25)
              transform="rotate(-90 50 50)"
            />
          )}
        </svg>
        
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-purple-600">
              {normalizedProgress}%
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm font-medium text-purple-600">{completed}</span>
              <span className="text-sm text-slate-400">/</span>
              <span className="text-sm text-slate-600">{total}</span>
            </div>
            <span className="text-xs text-slate-500 mt-1">
              completed
            </span>
          </div>
        )}
      </div>
      
      {/* Color bars at the bottom */}
      <div className="mt-4">
        <div className="flex h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-400" 
            style={{ width: `${correctPercentage}%` }}
          />
          <div 
            className="bg-red-400" 
            style={{ width: `${incorrectPercentage}%` }}
          />
          <div 
            className="bg-amber-400" 
            style={{ width: `${unattemptedPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs mt-2 text-slate-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span>{correctPercentage}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span>{incorrectPercentage}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span>{unattemptedPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentedProgress;
