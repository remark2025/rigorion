import { Users, Calendar, Star } from "lucide-react";
import { useEffect, useState } from "react";

const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("stats-section");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div id="stats-section" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex flex-col items-center">
              <div className="bg-white border border-gray-300 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {isVisible ? <AnimatedCounter end={50000} /> : "0"}+
              </h3>
              <p className="text-gray-400 mt-2">Total Tests Taken</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex flex-col items-center">
              <div className="bg-white border border-gray-300 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {isVisible ? <AnimatedCounter end={1200} /> : "0"}+
              </h3>
              <p className="text-gray-400 mt-2">Tests Today</p>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex flex-col items-center">
              <div className="bg-white border border-gray-300 p-4 rounded-full mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {isVisible ? <AnimatedCounter end={4.9} duration={1500} /> : "0"}
              </h3>
              <p className="text-gray-400 mt-2">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};