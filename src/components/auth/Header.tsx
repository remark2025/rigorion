
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

export const Header = () => {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white py-4 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 
            className="text-2xl font-bold text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            Academia
          </h1>
          
          {user && (
            <nav className="hidden md:flex space-x-6 ml-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/practice")}
                className="text-gray-600 hover:text-primary hover:bg-blue-50"
              >
                Practice
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/analytics")}
                className="text-gray-600 hover:text-primary hover:bg-blue-50"
              >
                Analytics
              </Button>
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsAuthModalOpen(true)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};
