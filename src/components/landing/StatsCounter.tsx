
import React from 'react';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, Award, CheckCircle } from 'lucide-react';

type StatType = {
  id: string;
  value: number;
  label: string;
  suffix?: string;
  icon: React.ReactNode;
};

const STATS: StatType[] = [
  {
    id: "students",
    value: 5000,
    suffix: "+",
    label: "Active Students",
    icon: <Users className="w-8 h-8 text-gray-400" />
  },
  {
    id: "questions",
    value: 5000,
    suffix: "+",
    label: "Practice Questions",
    icon: <FileText className="w-8 h-8 text-gray-400" />
  },
  {
    id: "solved",
    value: 250000,
    suffix: "+",
    label: "Problems Solved",
    icon: <CheckCircle className="w-8 h-8 text-gray-400" />
  },
  {
    id: "average",
    value: 1420,
    label: "Average SAT Score",
    icon: <TrendingUp className="w-8 h-8 text-gray-400" />
  },
  {
    id: "success",
    value: 98,
    suffix: "%",
    label: "Success Rate",
    icon: <Award className="w-8 h-8 text-gray-400" />
  }
];

export const StatsCounter = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    students: 0,
    questions: 0,
    solved: 0,
    average: 0,
    success: 0
  });
  
  useEffect(() => {
    if (isInView) {
      let interval: NodeJS.Timeout;
      
      interval = setInterval(() => {
        setCounts(prevCounts => {
          const newCounts = { ...prevCounts };
          let allCompleted = true;
          
          STATS.forEach(stat => {
            if (newCounts[stat.id] < stat.value) {
              // Calculate increment based on the size of the number for smooth animation
              let increment;
              if (stat.value >= 100000) {
                increment = Math.ceil(stat.value / 100); // Larger increments for big numbers
              } else if (stat.value >= 1000) {
                increment = Math.ceil(stat.value / 80);
              } else {
                increment = Math.max(1, Math.ceil(stat.value / 50));
              }
              newCounts[stat.id] = Math.min(stat.value, newCounts[stat.id] + increment);
              allCompleted = false;
            }
          });
          
          if (allCompleted) {
            clearInterval(interval);
          }
          
          return newCounts;
        });
      }, 50);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [isInView]);

  return (
    <>
      {/* Section Separator */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-gray-600"></div>
            <div className="px-6">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-600 via-gray-600 to-transparent"></div>
          </div>
        </div>
      </section>

      <section 
        ref={ref}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">
              <span className="italic font-script" style={{ 
                fontFamily: 'Dancing Script, cursive',
                background: 'linear-gradient(145deg, #2D2D2D, #FF6B35)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Academic Arc by the Numbers
              </span>
            </h2>
            <p className="text-gray-600">Join thousands of successful students worldwide</p>
          </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {STATS.map((stat) => (
            <div key={stat.id} className="text-center group">
              <div className="bg-white border-2 border-gray-900 rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center p-6 transition-all duration-300 group-hover:border-orange-500 group-hover:scale-105 shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mb-3 group-hover:bg-gray-100 transition-all duration-300">
                  <div className="text-gray-400 group-hover:text-gray-500">
                    {React.cloneElement(stat.icon as React.ReactElement, {
                      className: "w-6 h-6 text-gray-400 group-hover:text-gray-500"
                    })}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1" style={{
                  background: 'linear-gradient(145deg, #2D2D2D, #FF6B35)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {counts[stat.id].toLocaleString()}{stat.suffix || ''}
                </div>
                <p className="text-xs text-gray-400 font-medium text-center leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};
