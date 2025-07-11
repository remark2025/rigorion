
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, User, Navigation, Bell, LogIn, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileCustomizationDialog } from "@/components/profile/ProfileCustomizationDialog";

const Header = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [rank] = useState(150); 
  const { session, signOut } = useAuth();
  const [hasNotifications, setHasNotifications] = useState(true); // Demo state for notification dot
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const userEmail = session?.user?.email;
  const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "AA";

  const navigationItems = [
    { name: "Home", path: "/" },
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
              {/* Notification Bell */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-gray-100"
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                    {hasNotifications && (
                      <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white border border-gray-200 shadow-lg rounded-lg p-2">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="font-semibold">Notifications</h3>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-500 hover:text-blue-700">
                      Mark all as read
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-64">
                    <div className="p-2 text-sm bg-blue-50 rounded-md mb-2">
                      <p className="font-medium">Welcome to Academic Arc!</p>
                      <p className="text-gray-600">Get started with your learning journey.</p>
                      <p className="text-xs text-gray-500 mt-1">Just now</p>
                    </div>
                    <div className="p-2 text-sm mb-2">
                      <p className="font-medium">System update complete</p>
                      <p className="text-gray-600">We've added new features to enhance your experience.</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                    <div className="p-2 text-sm mb-2">
                      <p className="font-medium">Your account was created</p>
                      <p className="text-gray-600">Welcome aboard! Start exploring your dashboard.</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </ScrollArea>
                  <DropdownMenuSeparator />
                  <Button variant="ghost" size="sm" className="w-full text-center text-sm mt-1">
                    View all notifications
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
    </header>
  );
};

export default Header;
