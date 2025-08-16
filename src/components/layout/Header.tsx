
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, User, Navigation, CreditCard, LogIn, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileCustomizationDialog } from "@/components/profile/ProfileCustomizationDialog";
import { SubscriptionManager } from "@/components/payment/SubscriptionManager";

const Header = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [rank] = useState(150); 
  const { session, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  
  const userEmail = session?.user?.email;
  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "AA";

  const navigationItems = [
    { name: "Account", path: "/account" },
    { name: "Practice", path: "/practice" },
    { name: "Analytics", path: "/analytics" },
    { name: "About us", path: "/about" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-4" onClick={toggleSidebar}>
            <Navigation className="h-5 w-5 text-blue-500" />
          </Button>

          <div className="mr-4 hidden md:flex">
            <a href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">Academic Arc</span>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              {/* Subscription Management */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
                onClick={() => setIsSubscriptionDialogOpen(true)}
                title="Manage Subscription"
              >
                <CreditCard className="h-5 w-5 text-gray-600" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-900 text-white text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
                  <DropdownMenuItem 
                    className="cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDialogOpen(true)}
                  >
                    <User className="mr-2 h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Customize Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
                    <Settings className="mr-2 h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-gray-200" />
                  <DropdownMenuItem 
                    className="cursor-pointer py-2 px-3 rounded-md hover:bg-red-50 transition-colors text-red-600" 
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-white hover:bg-gray-50 text-[#8A0303] border border-[#8A0303] hover:border-[#6b0202] px-4 py-2 rounded-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <ProfileCustomizationDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        userEmail={userEmail}
      />
      
      {/* Subscription Management Dialog */}
      {isSubscriptionDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Subscription Management</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSubscriptionDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <SubscriptionManager />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
