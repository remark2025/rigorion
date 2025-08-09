
import React from 'react';
import { Check, X } from 'lucide-react';

type FeatureType = {
  name: string;
  competitors: {
    academicarc: boolean;
    scoresmart: boolean;
    magoosh: boolean;
    edisonos: boolean;
    testinnovators: boolean;
    princetonreview: boolean;
  };
};

const FEATURES: FeatureType[] = [
  {
    name: "5000+ Practice Questions",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: false,
      edisonos: false,
      testinnovators: false,
      princetonreview: true
    }
  },
  {
    name: "AI-Powered Writing Examiner",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: false,
      edisonos: false,
      testinnovators: false,
      princetonreview: false
    }
  },
  {
    name: "5 Different Practice Modes",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: true,
      edisonos: false,
      testinnovators: false,
      princetonreview: false
    }
  },
  {
    name: "Military-Grade Security",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: false,
      edisonos: false,
      testinnovators: false,
      princetonreview: false
    }
  },
  {
    name: "Advanced Analytics Dashboard",
    competitors: {
      academicarc: true,
      scoresmart: true,
      magoosh: true,
      edisonos: false,
      testinnovators: true,
      princetonreview: false
    }
  },
  {
    name: "Global Leaderboard System",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: false,
      edisonos: true,
      testinnovators: false,
      princetonreview: false
    }
  },
  {
    name: "12 Full-Length Mock Tests",
    competitors: {
      academicarc: true,
      scoresmart: true,
      magoosh: true,
      edisonos: true,
      testinnovators: true,
      princetonreview: true
    }
  },
  {
    name: "Offline Practice Capability",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: false,
      edisonos: false,
      testinnovators: false,
      princetonreview: false
    }
  },
  {
    name: "Real-Time Performance Insights",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: true,
      edisonos: false,
      testinnovators: true,
      princetonreview: false
    }
  },
  {
    name: "Personalized Study Plans",
    competitors: {
      academicarc: true,
      scoresmart: true,
      magoosh: true,
      edisonos: false,
      testinnovators: false,
      princetonreview: true
    }
  },
  {
    name: "Advanced Customization Options",
    competitors: {
      academicarc: true,
      scoresmart: false,
      magoosh: false,
      edisonos: false,
      testinnovators: false,
      princetonreview: false
    }
  }
];

const COMPETITORS = [
  { id: "academicarc", name: "Academic Arc", color: "#3B82F6" },
  { id: "scoresmart", name: "ScoreSmart", color: "#38B04A" },
  { id: "magoosh", name: "Magoosh", color: "#046C76" },
  { id: "edisonos", name: "Edisonos", color: "#D93232" },
  { id: "testinnovators", name: "TestInnovators", color: "#FFA734" },
  { id: "princetonreview", name: "Princeton Review", color: "#0072BB" }
];

export const ComparisonTable = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-14">
          <span className="italic font-script text-black" style={{ fontFamily: 'Dancing Script, cursive' }}>
            Product Comparison Chart
          </span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left font-medium text-gray-500 border-b"></th>
                {COMPETITORS.map((competitor) => (
                  <th 
                    key={competitor.id}
                    className="p-4 text-center font-bold text-white border-b"
                    style={{ backgroundColor: competitor.color }}
                  >
                    {competitor.name}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {FEATURES.map((feature, idx) => (
                <tr 
                  key={feature.name}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="p-4 text-gray-700 italic">{feature.name}</td>
                  {COMPETITORS.map((competitor) => {
                    const hasFeature = feature.competitors[competitor.id as keyof typeof feature.competitors];
                    
                    return (
                      <td 
                        key={`${feature.name}-${competitor.id}`} 
                        className="p-4 text-center"
                      >
                        {hasFeature ? (
                          <Check size={18} className="mx-auto" style={{ color: competitor.color }} />
                        ) : (
                          <X size={18} className="mx-auto text-gray-300" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
