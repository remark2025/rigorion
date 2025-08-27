import React, { useEffect, useState } from 'react';

interface University {
  name: string;
  logo: string; // URL to university logo
  ranking: number;
}

const TOP_UNIVERSITIES: University[] = [
  { name: "Harvard University", logo: "https://logos-world.net/wp-content/uploads/2021/09/Harvard-Logo.png", ranking: 1 },
  { name: "Stanford University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Stanford-Logo.png", ranking: 2 },
  { name: "MIT", logo: "https://logos-world.net/wp-content/uploads/2020/06/MIT-Logo.png", ranking: 3 },
  { name: "Yale University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Yale-Logo.png", ranking: 4 },
  { name: "Princeton University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Princeton-Logo.png", ranking: 5 },
  { name: "University of Chicago", logo: "https://brand.uchicago.edu/content/brand/en/guidelines/logo/_jcr_content/par/columncontrol_copy/c1/image.img.jpg/1539282681919.jpg", ranking: 6 },
  { name: "Columbia University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Columbia-Logo.png", ranking: 7 },
  { name: "University of Pennsylvania", logo: "https://logos-world.net/wp-content/uploads/2020/06/University-of-Pennsylvania-Logo.png", ranking: 8 },
  { name: "California Institute of Technology", logo: "https://logos-world.net/wp-content/uploads/2020/06/Caltech-Logo.png", ranking: 9 },
  { name: "Duke University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Duke-Logo.png", ranking: 10 },
  { name: "Northwestern University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Northwestern-Logo.png", ranking: 11 },
  { name: "Dartmouth College", logo: "https://logos-world.net/wp-content/uploads/2020/06/Dartmouth-Logo.png", ranking: 12 },
  { name: "Brown University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Brown-Logo.png", ranking: 13 },
  { name: "Cornell University", logo: "https://logos-world.net/wp-content/uploads/2020/06/Cornell-Logo.png", ranking: 15 },
  { name: "UC Berkeley", logo: "https://logos-world.net/wp-content/uploads/2020/06/UC-Berkeley-Logo.png", ranking: 16 },
  { name: "UCLA", logo: "https://logos-world.net/wp-content/uploads/2020/06/UCLA-Logo.png", ranking: 17 },
  { name: "Carnegie Mellon", logo: "https://logos-world.net/wp-content/uploads/2020/06/Carnegie-Mellon-Logo.png", ranking: 18 },
  { name: "University of Oxford", logo: "https://logos-world.net/wp-content/uploads/2021/09/Oxford-Logo.png", ranking: 2 },
  { name: "University of Cambridge", logo: "https://logos-world.net/wp-content/uploads/2021/09/Cambridge-Logo.png", ranking: 3 },
  { name: "Imperial College London", logo: "https://logos-world.net/wp-content/uploads/2021/09/Imperial-College-London-Logo.png", ranking: 8 },
  { name: "University College London", logo: "https://logos-world.net/wp-content/uploads/2021/09/UCL-Logo.png", ranking: 9 },
  { name: "ETH Zurich", logo: "https://logos-world.net/wp-content/uploads/2021/09/ETH-Zurich-Logo.png", ranking: 11 },
  { name: "University of Toronto", logo: "https://logos-world.net/wp-content/uploads/2020/06/University-of-Toronto-Logo.png", ranking: 18 },
  { name: "University of Tokyo", logo: "https://logos-world.net/wp-content/uploads/2021/09/University-of-Tokyo-Logo.png", ranking: 23 }
];

export const UniversityLogos = () => {
  // No need for state or intervals - pure CSS animation handles the seamless loop

  return (
    <section className="relative py-4 bg-white border-t border-b border-gray-200 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center">

          {/* Animated University Logos - Horizontal Sliding */}
          <div className="relative h-16 overflow-hidden">
            {/* Gradient masks for soft edges */}
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
            
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
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform duration-200 overflow-hidden">
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
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:scale-105 transition-transform duration-200 overflow-hidden">
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