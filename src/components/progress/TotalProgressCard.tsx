import { Card } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface ProgressData {
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unattempted_count: number;
  total_progress_percent?: number;
}

interface TotalProgressCardProps {
  totalQuestions?: number;
  correctQuestions?: number;
  incorrectQuestions?: number;
  unattemptedQuestions?: number;
  progressData?: ProgressData;
  alwaysVisible?: boolean;
}

export const TotalProgressCard = ({
  totalQuestions: propsTotalQuestions,
  correctQuestions: propsCorrectQuestions,
  incorrectQuestions: propsIncorrectQuestions,
  unattemptedQuestions: propsUnattemptedQuestions,
  progressData: propsProgressData,
  alwaysVisible = true
}: TotalProgressCardProps) => {
  const { isDarkMode } = useTheme();
  const [localProgress, setLocalProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rippleEffects, setRippleEffects] = useState<Array<{
    id: number;
    active: boolean;
  }>>([{
    id: 1,
    active: false
  }, {
    id: 2,
    active: false
  }, {
    id: 3,
    active: false
  }, {
    id: 4,
    active: false
  }, {
    id: 5,
    active: false
  }]);

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const res = await fetch(`${supabaseUrl}/functions/v1/get-user-progress`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data) {
          setLocalProgress({
            total_questions: data.total_questions || 0,
            correct_count: data.correct_count || 0,
            incorrect_count: data.incorrect_count || 0,
            unattempted_count: data.unattempted_count || 0
          });
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();

    // Enhanced multi-wave ripple effect with light grey and light blue colors
    const rippleInterval = setInterval(() => {
      // Start ripples in sequence with slight delay between each
      setRippleEffects(prev => {
        const newEffects = [...prev];
        const nextIndex = newEffects.findIndex(e => !e.active);
        if (nextIndex !== -1) {
          newEffects[nextIndex].active = true;

          // Reset this ripple after animation completes
          setTimeout(() => {
            setRippleEffects(current => {
              const resetEffects = [...current];
              resetEffects[nextIndex].active = false;
              return resetEffects;
            });
          }, 1800);
        }
        return newEffects;
      });
    }, 600);
    return () => clearInterval(rippleInterval);
  }, []);

  // Update display data logic to prioritize secure data from props
  const displayData = propsProgressData || {
    total_questions: propsTotalQuestions || localProgress?.total_questions || 130,
    correct_count: propsCorrectQuestions || localProgress?.correct_count || 53,
    incorrect_count: propsIncorrectQuestions || localProgress?.incorrect_count || 21,
    unattempted_count: propsUnattemptedQuestions || localProgress?.unattempted_count || 56
  };
  const {
    total_questions: totalQuestionsValue,
    correct_count: correctQuestionsValue,
    incorrect_count: incorrectQuestionsValue,
    unattempted_count: unattemptedQuestionsValue
  } = displayData;
  const totalProgress = Math.round((correctQuestionsValue + incorrectQuestionsValue) / totalQuestionsValue * 100);
  const correctPercentage = Math.round(correctQuestionsValue / totalQuestionsValue * 100);
  const incorrectPercentage = Math.round(incorrectQuestionsValue / totalQuestionsValue * 100);
  const unattemptedPercentage = Math.round(unattemptedQuestionsValue / totalQuestionsValue * 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const correctOffset = circumference * (1 - correctQuestionsValue / totalQuestionsValue);
  const incorrectOffset = circumference * (1 - incorrectQuestionsValue / totalQuestionsValue);
  const unattemptedOffset = circumference * (1 - unattemptedQuestionsValue / totalQuestionsValue);

  // Colors for the ripple effects - updated to light grey and light blue only
  const rippleColors = isDarkMode 
    ? [
      'rgba(34, 197, 94, 0.1)', // Green with low opacity
      'rgba(34, 197, 94, 0.08)',
      'rgba(34, 197, 94, 0.06)',
      'rgba(34, 197, 94, 0.04)',
      'rgba(34, 197, 94, 0.02)'
    ] 
    : [
      'rgba(200, 200, 201, 0.3)', // Light Grey
      'rgba(211, 228, 253, 0.35)', // Light Blue
      'rgba(200, 200, 201, 0.25)', // Light Grey (slightly different opacity)
      'rgba(211, 228, 253, 0.3)', // Light Blue (slightly different opacity)
      'rgba(200, 200, 201, 0.2)' // Light Grey (another opacity)
    ];
  
  return (
    <Card className={`p-6 col-span-1 hover:shadow-sm transition-all duration-300 rounded-xl border h-[480px] ${
      isDarkMode ? 'bg-gray-900 border-green-500/30 text-green-400' : 'bg-white border-gray-50'
    }`}>
      <h3 className={`text-lg font-semibold mb-6 text-center ${
        isDarkMode ? 'text-green-400' : 'text-gray-800'
      }`}>Total Progress</h3>
      
      {/* Center the circular progress */}
      <div className="flex flex-col items-center">
        {/* Fixed circular progress container */}
        <div className="relative flex items-center justify-center mb-8 w-[260px] h-[260px]">
          {/* Multiple ripple effects - thinner waves */}
          {rippleEffects.map((effect, idx) => (
            <motion.div 
              key={effect.id} 
              className="absolute inset-0 rounded-full" 
              initial={{
                boxShadow: '0 0 0 0px rgba(0,0,0,0)'
              }} 
              animate={effect.active ? {
                boxShadow: [
                  `0 0 0 0px ${rippleColors[idx % rippleColors.length]}`, 
                  `0 0 0 3px ${rippleColors[idx % rippleColors.length].replace(/[^,]+\)/, '0.25)')}`, 
                  `0 0 0 6px ${rippleColors[idx % rippleColors.length].replace(/[^,]+\)/, '0.15)')}`, 
                  `0 0 0 12px ${rippleColors[idx % rippleColors.length].replace(/[^,]+\)/, '0.08)')}`, 
                  `0 0 0 18px ${rippleColors[idx % rippleColors.length].replace(/[^,]+\)/, '0.03)')}`, 
                  `0 0 0 24px ${rippleColors[idx % rippleColors.length].replace(/[^,]+\)/, '0)')}`
                ]
              } : {}} 
              transition={{
                duration: 2,
                ease: 'linear',
                times: [0, 0.2, 0.4, 0.6, 0.8, 1]
              }} 
            />
          ))}
          
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke={isDarkMode ? "#1f2937" : "#f1f5f9"} 
              strokeWidth="2" 
            />
            
            {/* Progress segments with specific colors */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke={isDarkMode ? "#22c55e" : "#22c55e"} 
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={correctOffset} 
              strokeLinecap="round" 
              initial={{
                strokeDashoffset: circumference
              }} 
              animate={{
                strokeDashoffset: correctOffset
              }} 
              transition={{
                duration: 1,
                ease: "easeInOut"
              }} 
            />
            <motion.circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke={isDarkMode ? "#ef4444" : "#ef4444"} 
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={incorrectOffset} 
              strokeLinecap="round" 
              initial={{
                strokeDashoffset: circumference
              }} 
              animate={{
                strokeDashoffset: incorrectOffset
              }} 
              transition={{
                duration: 1,
                ease: "easeInOut",
                delay: 0.2
              }} 
            />
            <motion.circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke={isDarkMode ? "#f97316" : "#f97316"} 
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={unattemptedOffset} 
              strokeLinecap="round" 
              initial={{
                strokeDashoffset: circumference
              }} 
              animate={{
                strokeDashoffset: unattemptedOffset
              }} 
              transition={{
                duration: 1,
                ease: "easeInOut",
                delay: 0.4
              }} 
            />
          </svg>
          
          {/* Centered text */}
          <motion.div 
            className="flex flex-col items-center justify-center text-center z-10" 
            initial={{
              scale: 0.9,
              opacity: 0
            }} 
            animate={{
              scale: 1,
              opacity: 1
            }} 
            transition={{
              duration: 0.5
            }}
          >
            <span className={`text-5xl font-bold ${
              isDarkMode ? 'text-green-400' : 'text-gray-800'
            }`}>
              {totalProgress}%
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-green-400' : 'text-gray-700'
              }`}>
                {correctQuestionsValue + incorrectQuestionsValue}
              </span>
              <span className={`text-sm ${
                isDarkMode ? 'text-green-400/50' : 'text-gray-400'
              }`}>/</span>
              <span className={`text-sm ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>{totalQuestionsValue}</span>
            </div>
            <span className={`text-xs ${
              isDarkMode ? 'text-green-400/70' : 'text-gray-500'
            } mt-1`}>completed</span>
          </motion.div>
        </div>

        {/* Centered progress breakdown */}
        <div className="w-full space-y-4">
          {/* Progress breakdown centered */}
          <div className="flex justify-center">
            <div className="space-y-3">
              <div className="flex items-center justify-between min-w-[200px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-gray-600'
                  }`}>Correct</span>
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-emerald-600'
                }`}>
                  {correctQuestionsValue} ({correctPercentage}%)
                </span>
              </div>
              <div className="flex items-center justify-between min-w-[200px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-gray-600'
                  }`}>Incorrect</span>
                </div>
                <span className={`text-sm font-medium text-red-600`}>
                  {incorrectQuestionsValue} ({incorrectPercentage}%)
                </span>
              </div>
              <div className="flex items-center justify-between min-w-[200px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-gray-600'
                  }`}>Unattempted</span>
                </div>
                <span className={`text-sm font-medium text-orange-600`}>
                  {unattemptedQuestionsValue} ({unattemptedPercentage}%)
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Stats centered */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <span className={`text-sm ${
                  isDarkMode ? 'text-green-400' : 'text-gray-600'
                }`}>Avg Score:</span>
                <div className={`text-sm font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-gray-800'
                }`}>92%</div>
              </div>
              <div>
                <span className={`text-sm ${
                  isDarkMode ? 'text-green-400' : 'text-gray-600'
                }`}>Success Rate:</span>
                <div className={`text-sm font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-gray-800'
                }`}>85%</div>
              </div>
              <div>
                <span className={`text-sm ${
                  isDarkMode ? 'text-green-400' : 'text-gray-600'
                }`}>Accuracy:</span>
                <div className={`text-sm font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-gray-800'
                }`}>88%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
