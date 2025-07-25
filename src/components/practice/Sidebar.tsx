
import { Home, ChartBar, MessageSquare, ShoppingBag, Settings, Info, X, User, BookOpen, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  onClose: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Practice", path: "/practice" },
    { icon: BarChart, label: "Progress", path: "/progress" },
    { icon: MessageSquare, label: "Endpoints", path: "/endpoints" },
    { icon: ShoppingBag, label: "Payment", path: "/payment" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Info, label: "About", path: "/about" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        className={`fixed left-0 top-0 h-full w-72 sm:w-80 shadow-xl z-50 ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-r`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-6 flex justify-between items-center border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-lg sm:text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Navigation
            </h2>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Practice & Progress
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className={`rounded-full ${
              isDarkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation Items */}
        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="p-4 sm:p-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800 active:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${
                  isDarkMode ? 'text-green-400' : 'text-blue-600'
                }`} />
                <span className="font-medium text-base">{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Footer */}
          <div className={`p-4 sm:p-6 mt-8 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-xs text-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              SAT Practice Platform
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </>
  );
};
