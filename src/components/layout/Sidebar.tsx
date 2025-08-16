
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger
} from "@/components/ui/drawer";

const navigationItems = [
  { label: "Account", path: "/account" },
  { label: "Practice", path: "/practice" },
  { label: "Analytics", path: "/analytics" },
  { label: "About", path: "/about" },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="flex lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh] bg-white">
        <nav className="flex flex-col gap-4 p-6">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start text-lg font-medium transition-colors",
                "hover:bg-slate-100 hover:text-slate-900"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
};

export default AppSidebar;
