
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation, LogIn } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
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
        background: 'linear-gradient(45deg, rgba(45, 45, 45, 0.9) 0%, rgba(64, 64, 64, 0.8) 45%, rgba(192, 192, 192, 0.3) 70%, rgba(255, 255, 255, 0.2) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(192, 192, 192, 0.3)',
        boxShadow: '0 8px 32px rgba(45, 45, 45, 0.2)'
      }}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => setIsNavOpen(!isNavOpen)} 
            className="mr-4 md:hidden rounded-lg p-2 hover:bg-gray-700 transition-colors"
          >
            <Navigation className="h-5 w-5 text-gray-300" />
          </button>
          <Link to="/" className="font-semibold text-xl md:text-2xl tracking-wide" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>
            <span className="text-gray-200 font-bold" style={{
              fontFamily: 'serif',
              textShadow: `
                1px 0 0 #2D2D2D, -1px 0 0 #2D2D2D, 0 1px 0 #2D2D2D, 0 -1px 0 #2D2D2D,
                0 2px 4px rgba(0,0,0,0.4),
                0 4px 8px rgba(192,192,192,0.3),
                inset 0 1px 0 rgba(255,255,255,0.6)
              `,
              background: 'linear-gradient(145deg, #F5F5F5, #E5E5E5, #C0C0C0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(45,45,45,0.2))'
            }}>SAT</span>
            <span className="text-orange-500 ml-1 font-bold" style={{
              textShadow: `
                0 2px 4px rgba(0,0,0,0.3),
                0 4px 8px rgba(255,165,0,0.3),
                0 1px 0 rgba(255,255,255,0.8),
                0 -1px 0 rgba(255,140,0,0.8)
              `,
              background: 'linear-gradient(145deg, #FF6B35, #FF8C42, #FFA726)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}>Elite</span>
            <sup className="text-xs font-normal text-gray-300">®</sup>
          </Link>
        </div>
        
        <div className="flex items-center">
          <nav className="hidden md:flex space-x-6 mr-6">
            <Link to="/account" className="text-gray-200 hover:text-orange-300 transition-colors">Account</Link>
            <Link to="/about" className="text-gray-200 hover:text-orange-300 transition-colors">About us</Link>
            <Link to="/practice" className="text-gray-200 hover:text-orange-300 transition-colors">Practice</Link>
            <Link to="/analytics" className="text-gray-200 hover:text-orange-300 transition-colors">Analytics</Link>
          </nav>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 hover:border-orange-600 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg"
          >
            <LogIn className="mr-1.5 h-3.5 w-3.5" />
            Login
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isNavOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 border-b border-gray-600 shadow-md py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-2">
              <Link to="/account" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Account</Link>
              <Link to="/about" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>About us</Link>
              <Link to="/practice" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Practice</Link>
              <Link to="/analytics" className="text-gray-200 hover:text-orange-400 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Analytics</Link>
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
