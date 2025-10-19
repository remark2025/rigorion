
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation, LogIn } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <header 
      className={`sticky top-0 z-50 py-4 transition-all duration-300 shadow-sm`}
      style={{
        background: 'linear-gradient(45deg, rgba(25, 25, 25, 0.95) 0%, rgba(128, 128, 128, 0.4) 50%, rgba(25, 25, 25, 0.95) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(25, 25, 25, 0.4)'
      }}>
      <div className="container mx-auto pl-0 pr-4 flex items-center justify-between">
        <div className="flex items-center pl-4">
          <button 
            onClick={() => setIsNavOpen(!isNavOpen)} 
            className="mr-4 md:hidden rounded-lg p-2 hover:bg-gray-700 transition-colors"
          >
            <Navigation className="h-5 w-5 text-gray-300" />
          </button>
          <Link to="/" className="font-black text-xl md:text-2xl tracking-wider select-none">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-gray-400 via-gray-600 to-black bg-clip-text text-transparent font-black">
                SAT
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]">
                SAT
              </span>
            </span>
            <span className="text-[8px] font-bold text-gray-400 border border-gray-400 rounded-full w-2.5 h-2.5 inline-flex items-center justify-center leading-none ml-0.5 mr-1 align-top">
              ®
            </span>
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent font-black">
                Elite
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-40 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite_0.5s]">
                Elite
              </span>
            </span>
            <style jsx>{`
              @keyframes shimmer {
                0% {
                  background-position: -200% 0;
                  opacity: 0;
                }
                50% {
                  opacity: 0.6;
                }
                100% {
                  background-position: 200% 0;
                  opacity: 0;
                }
              }
            `}</style>
          </Link>
        </div>
        
        <div className="flex items-center">
          <nav className="hidden md:flex space-x-6 mr-6">
            {session && <Link to="/account" className="text-gray-200 hover:text-orange-300 transition-colors">Account</Link>}
            <Link to="/sat-math" className="text-gray-200 hover:text-orange-300 transition-colors">SAT Math</Link>
            <Link to="/practice" className="text-gray-200 hover:text-orange-300 transition-colors">Practice</Link>
            <Link to="/sat-writing-demo" className="text-gray-200 hover:text-orange-300 transition-colors">AI Writing</Link>
            <Link to="/reading-assistant" className="text-gray-200 hover:text-orange-300 transition-colors">AI Reading</Link>
            <Link to="/sat-exams" className="text-gray-200 hover:text-orange-300 transition-colors">SAT Exams</Link>
            <Link to="/analytics" className="text-gray-200 hover:text-orange-300 transition-colors">Analytics</Link>
            <Link to="/contact" className="text-gray-200 hover:text-orange-300 transition-colors">Contact us</Link>
          </nav>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-black border border-orange-500 hover:border-orange-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg h-7"
          >
            <LogIn className="mr-1 h-3 w-3" />
            Login
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isNavOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 border-b border-gray-600 shadow-md py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-2">
              {session && <Link to="/account" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Account</Link>}
              <Link to="/sat-math" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>SAT Math</Link>
              <Link to="/practice" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Practice</Link>
              <Link to="/sat-writing-demo" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>AI Writing</Link>
              <Link to="/reading-assistant" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>AI Reading</Link>
              <Link to="/sat-exams" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>SAT Exams</Link>
              <Link to="/analytics" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Analytics</Link>
              <Link to="/contact" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Contact us</Link>
            </div>
          </div>
        </div>
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};
