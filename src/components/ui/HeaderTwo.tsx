
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import FilterButton from './FilterButton';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (selectedFilters: string[]) => void;
  filterOptions: {
    id: string;
    label: string;
  }[];
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onFilterChange,
  filterOptions,
  className
}) => {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navigateToPage = (path: string) => {
    navigate(path);
    setIsNavOpen(false);
  };

  return (
    <header className={cn('sticky top-0 z-50 w-full py-4 bg-white/80 backdrop-blur-sm border-b border-slate-100', 'transition-all duration-300', className)}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">
          <div className="relative flex items-center gap-4">
            <DropdownMenu open={isNavOpen} onOpenChange={setIsNavOpen}>
              <DropdownMenuTrigger className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                <Menu className="h-5 w-5 text-blue-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white border border-gray-100 shadow-sm">
                <DropdownMenuItem onSelect={() => navigateToPage('/')} className="hover:bg-gray-50 cursor-pointer">
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigateToPage('/practice')} className="hover:bg-gray-50 cursor-pointer">
                  Practice
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigateToPage('/progress')} className="hover:bg-gray-50 cursor-pointer">
                  Progress
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigateToPage('/chat')} className="hover:bg-gray-50 cursor-pointer">
                  Chat
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigateToPage('/about')} className="hover:bg-gray-50 cursor-pointer">
                  About
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <h1 className="font-cursive text-2xl sm:text-3xl text-red-dark font-semibold italic">Rigorion</h1>
            <div className="absolute -bottom-1 left-0 w-16 h-0.5 bg-blue opacity-50 rounded-full"></div>
          </div>
          
          <div className="flex items-center gap-2">
            <SearchBar onSearch={onSearch} />
            <FilterButton options={filterOptions} onFilterChange={onFilterChange} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
