
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
    <header className={`sticky top-0 z-50 bg-white py-4 transition-all duration-300 shadow-sm`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => setIsNavOpen(!isNavOpen)} 
            className="mr-4 md:hidden rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <Navigation className="h-5 w-5 text-blue-500" />
          </button>
          <Link to="/" className="font-semibold text-xl md:text-2xl text-blue-600 tracking-wide" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em'}}>SAT Premium<sup className="text-xs font-normal">®</sup></Link>
        </div>
        
        <div className="flex items-center">
          <nav className="hidden md:flex space-x-6 mr-6">
            <Link to="/account" className="text-gray-600 hover:text-blue-600 transition-colors">Account</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About us</Link>
            <Link to="/practice" className="text-gray-600 hover:text-blue-600 transition-colors">Practice</Link>
            <Link to="/analytics" className="text-gray-600 hover:text-blue-600 transition-colors">Analytics</Link>
          </nav>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 hover:border-blue-700 px-3 py-1.5 rounded-full text-sm"
          >
            <LogIn className="mr-1.5 h-3.5 w-3.5" />
            Login
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isNavOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b shadow-md py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-2">
              <Link to="/account" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Account</Link>
              <Link to="/about" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>About us</Link>
              <Link to="/practice" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Practice</Link>
              <Link to="/analytics" className="text-gray-600 hover:text-blue-600 py-2 transition-colors" onClick={() => setIsNavOpen(false)}>Analytics</Link>
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
