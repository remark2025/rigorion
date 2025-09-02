import React, { useEffect, useState } from 'react';

interface University {
  name: string;
  logo: string; // URL to university logo
  ranking: number;
}

const TOP_UNIVERSITIES: University[] = [
  { name: "Logo 1", logo: "/resources/62796f8f53c8a73e766a78eb.png", ranking: 1 },
  { name: "Logo 2", logo: "/resources/6279702453c8a73e766a78ef.png", ranking: 2 },
  { name: "Logo 3", logo: "/resources/62796e3153c8a73e766a78e0.png", ranking: 3 },
  { name: "Logo 4", logo: "/resources/6279708b53c8a73e766a78f2.png", ranking: 4 },
  { name: "Logo 5", logo: "/resources/627970eb53c8a73e766a78f4.png", ranking: 5 },
  { name: "Logo 6", logo: "/resources/62796e6c53c8a73e766a78e2.png", ranking: 6 },
  { name: "Logo 7", logo: "/resources/62796f3253c8a73e766a78e8.png", ranking: 7 },
  { name: "Logo 8", logo: "/resources/62796e8453c8a73e766a78e3.png", ranking: 8 },
  { name: "Logo 9", logo: "/resources/62796eaf53c8a73e766a78e4.png", ranking: 9 }
];

export const UniversityLogos = () => {

  return (
    <section className="relative py-4 overflow-hidden">
      {/* Charcoal and Silver Overlay - matching Hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/60 via-gray-600/40 to-gray-300/30"></div>
      
      <div className="container mx-auto px-6 relative z-20">
        <div className="text-center">

          {/* Animated University Logos - Horizontal Sliding */}
          <div className="relative h-16 overflow-hidden">
            {/* Enhanced gradient masks for soft edges that blend with background */}
            <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-gray-800/60 via-gray-600/40 to-transparent z-30 pointer-events-none"></div>
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-800/60 via-gray-600/40 to-transparent z-30 pointer-events-none"></div>
            
            {/* Sliding container */}
            <div 
              className="flex items-center absolute top-0 h-full animate-scroll"
              style={{
                width: `${TOP_UNIVERSITIES.length * 2 * 140}px`, // Double for seamless loop, adjusted for smaller logos
                left: '0px'
              }}
            >
              {/* First set */}
              {TOP_UNIVERSITIES.map((university, index) => (
                <div
                  key={`${university.name}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center mx-8"
                  style={{ width: '100px' }}
                >
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-orange-200 hover:scale-105 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 overflow-hidden">
                    <img 
                      src={university.logo} 
                      alt={university.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xs font-bold text-gray-600">${university.name.split(' ')[0].substring(0, 3).toUpperCase()}</span>`;
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {TOP_UNIVERSITIES.map((university, index) => (
                <div
                  key={`${university.name}-duplicate-${index}`}
                  className="flex-shrink-0 flex items-center justify-center mx-8"
                  style={{ width: '100px' }}
                >
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-orange-200 hover:scale-105 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 overflow-hidden">
                    <img 
                      src={university.logo} 
                      alt={university.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xs font-bold text-gray-600">${university.name.split(' ')[0].substring(0, 3).toUpperCase()}</span>`;
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Custom CSS for smooth animations */}
      <style>{`
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        /* Pause animation on hover */
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};