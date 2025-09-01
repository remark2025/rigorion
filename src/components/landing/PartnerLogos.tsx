import { useState, useRef, useEffect, TouchEvent } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from "@/hooks/use-mobile";
type PromotionalItem = {
  id: string;
  title: string;
  brand: string;
  description: string;
  tags: string[];
  imageUrl: string;
  link: string;
  isFeatured?: boolean;
};
const PROMOTIONAL_ITEMS: PromotionalItem[] = [{
  id: "sat-math",
  title: "SAT Math",
  brand: "Academic Arc",
  description: "Master mathematical concepts with comprehensive practice problems, detailed explanations, and strategic problem-solving techniques for optimal SAT Math scores.",
  tags: ["Algebra & Functions", "Geometry", "Statistics", "Advanced Topics"],
  imageUrl: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&h=300&fit=crop",
  link: "/sat-math",
  isFeatured: true
}, {
  id: "sat-reading",
  title: "SAT Reading",
  brand: "Academic Arc",
  description: "Enhance reading comprehension skills with diverse passages, critical analysis techniques, and strategic approaches to tackle any SAT Reading section.",
  tags: ["Literature Analysis", "Social Studies", "Science Passages", "Critical Reading"],
  imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
  link: "/sat-reading"
}, {
  id: "sat-writing",
  title: "SAT Writing",
  brand: "Academic Arc",
  description: "Perfect your writing skills with comprehensive grammar rules, essay techniques, language usage patterns, and rhetoric strategies for SAT success.",
  tags: ["Grammar Rules", "Essay Writing", "Language Usage", "Rhetoric"],
  imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
  link: "/sat-writing"
}, {
  id: "sat-full-tests",
  title: "12 SAT Full Tests",
  brand: "Academic Arc",
  description: "Complete practice tests with realistic timing, detailed scoring analytics, performance insights, and personalized improvement recommendations.",
  tags: ["Full-Length Tests", "Detailed Analytics", "Time Management", "Score Prediction"],
  imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
  link: "/sat-full-tests"
}];
export const PartnerLogos = () => {
  const [activeProject, setActiveProject] = useState(0);
  const projectsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const minSwipeDistance = 50;
  useEffect(() => {
    if (isInView && !isHovering) {
      const interval = setInterval(() => {
        setActiveProject(prev => (prev + 1) % PROMOTIONAL_ITEMS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsInView(true);
      } else {
        setIsInView(false);
      }
    }, {
      threshold: 0.1
    });
    if (projectsRef.current) {
      observer.observe(projectsRef.current);
    }
    return () => observer.disconnect();
  }, []);
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setActiveProject(prev => (prev + 1) % PROMOTIONAL_ITEMS.length);
    } else if (isRightSwipe) {
      setActiveProject(prev => (prev - 1 + PROMOTIONAL_ITEMS.length) % PROMOTIONAL_ITEMS.length);
    }
  };
  const getCardAnimationClass = (index: number) => {
    if (index === activeProject) return "scale-100 opacity-100 z-20";
    if (index === (activeProject + 1) % PROMOTIONAL_ITEMS.length) return "translate-x-[60%] scale-95 opacity-60 z-10";
    if (index === (activeProject - 1 + PROMOTIONAL_ITEMS.length) % PROMOTIONAL_ITEMS.length) return "translate-x-[-60%] scale-95 opacity-60 z-10";
    return "scale-90 opacity-0";
  };
  
  const getCardBorderClass = (index: number) => {
    if (index === activeProject) return "border-2 border-orange-400 shadow-orange-400/30";
    return "border border-gray-600";
  };
  return <section id="products" ref={projectsRef} className="py-[50px] w-full h-[600px] overflow-hidden relative bg-gray-900">
      {/* Glass effect overlay - matching Header */}
      <div className="absolute inset-0" style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(192, 192, 192, 0.2)',
        boxShadow: '0 8px 32px rgba(45, 45, 45, 0.3)'
      }}></div>
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className={`text-center mb-10 max-w-3xl mx-auto transition-all duration-1200 ease-out ${isInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}>
          <h2 className="text-3xl font-bold mb-3">
            <span className="italic font-script text-orange-400" style={{ fontFamily: 'Dancing Script, cursive' }}>
              Academic Arc transforms SAT uncertainty into inevitability.
            </span>
          </h2>
          <p className="text-gray-300 text-lg">
            Strategic preparation with personalized analytics and proven results.
          </p>
          {isMobile && <div className="flex items-center justify-center mt-4 animate-pulse-slow">
              <div className="flex items-center text-orange-400">
                <ChevronLeft size={16} />
                <p className="text-sm mx-1">Swipe to navigate</p>
                <ChevronRight size={16} />
              </div>
            </div>}
        </div>
        
        <div className="flex">
          {/* Text Column - Only visible on desktop */}
          {!isMobile && <div className="w-1/4 pr-8 hidden lg:block">
              <div className={`transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-20px]'}`}>
                <h3 className="text-2xl font-bold mb-4 text-gray-100">{PROMOTIONAL_ITEMS[activeProject].title}</h3>
                <p className="text-gray-300 mb-6">{PROMOTIONAL_ITEMS[activeProject].description}</p>
                <div className="flex flex-col space-y-2 mb-6">
                  {PROMOTIONAL_ITEMS[activeProject].tags.map((tag, idx) => <span key={idx} className="text-sm text-gray-300">• {tag}</span>)}
                </div>
                <Link to={PROMOTIONAL_ITEMS[activeProject].link} className="text-orange-400 inline-flex items-center font-medium hover:underline group">
                  <span>Explore {PROMOTIONAL_ITEMS[activeProject].title}</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>}
          
          {/* Carousel */}
          <div className={`relative ${!isMobile ? 'w-3/4' : 'w-full'} h-[500px] overflow-hidden`} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} ref={carouselRef}>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              {PROMOTIONAL_ITEMS.map((item, index) => <div key={item.id} className={`absolute top-0 w-full max-w-2xl transform transition-all duration-500 ${getCardAnimationClass(index)}`} style={{
              transitionDelay: `${index * 50}ms`
            }}>
                  <Card className={`overflow-hidden h-[460px] rounded-xl shadow-lg hover:shadow-xl flex flex-col bg-gray-800 ${getCardBorderClass(index % PROMOTIONAL_ITEMS.length)}`} style={{boxShadow: index % PROMOTIONAL_ITEMS.length === activeProject ? '0 0 30px rgba(255, 107, 53, 0.4), 0 0 60px rgba(255, 140, 66, 0.2)' : undefined}}>
                    <div className="relative bg-black flex items-center justify-center overflow-hidden" style={{
                  height: '90%',
                  backgroundImage: `url(${item.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                      <div className="absolute inset-0 bg-black/60"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center p-6">
                        <h3 className="text-3xl italic font-script text-white mb-3" style={{ fontFamily: 'Dancing Script, cursive' }}>{item.title.toUpperCase()}</h3>
                        <div className="w-16 h-1 bg-white mb-3"></div>
                        <p className="text-white text-lg font-medium text-center">{item.brand}</p>
                      </div>
                    </div>
                    
                    <CardContent className="p-3 flex items-center justify-center" style={{ height: '10%' }}>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {item.tags.slice(0, 2).map((tag, idx) => <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-200 rounded-full text-xs font-medium">
                            {tag}
                          </span>)}
                      </div>
                    </CardContent>
                  </Card>
                </div>)}
            </div>
            
            {!isMobile && <>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 z-30 shadow-md transition-all duration-300 hover:scale-110" onClick={() => setActiveProject(prev => (prev - 1 + PROMOTIONAL_ITEMS.length) % PROMOTIONAL_ITEMS.length)} aria-label="Previous product">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600 z-30 shadow-md transition-all duration-300 hover:scale-110" onClick={() => setActiveProject(prev => (prev + 1) % PROMOTIONAL_ITEMS.length)} aria-label="Next product">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>}
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-3 z-30">
              {PROMOTIONAL_ITEMS.map((_, idx) => <button key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${activeProject === idx ? 'bg-orange-500 w-6' : 'bg-gray-400 hover:bg-gray-300'}`} onClick={() => setActiveProject(idx)} aria-label={`Go to product ${idx + 1}`} />)}
            </div>
          </div>
        </div>
      </div>
      
    </section>;
};