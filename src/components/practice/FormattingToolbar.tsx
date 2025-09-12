import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Minus, 
  Plus, 
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Highlighter,
  Timer,
  Play,
  Pause,
  Eye,
  EyeOff
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/contexts/ThemeContext";

const FONT_OPTIONS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "open-sans", label: "Open Sans" },
  { value: "comic-sans", label: "Comic Sans" },
  { value: "courier-new", label: "Courier New" },
  { value: "poppins", label: "Poppins" },
  { value: "merriweather", label: "Merriweather" },
  { value: "dancing-script", label: "Dancing Script" },
  { value: "ubuntu", label: "Ubuntu" }
];

const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 22, 24];

const TEXT_EMPHASIS = [
  { key: 'bold', label: 'Bold', icon: Bold },
  { key: 'italic', label: 'Italic', icon: Italic },
  { key: 'underline', label: 'Underline', icon: Underline },
  { key: 'highlight', label: 'Highlight', icon: Highlighter }
];

interface FormattingToolbarProps {
  settings: {
    fontFamily: string;
    fontSize: number;
    emphasis: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
      highlight: boolean;
    };
  };
  onSettingsChange: (key: string, value: string | number | object) => void;
  timerEnabled?: boolean;
}

export const FormattingToolbar = ({ settings, onSettingsChange, timerEnabled = true }: FormattingToolbarProps) => {
  const { isDarkMode } = useTheme();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  
  // Timer state
  const [timerVisible, setTimerVisible] = useState(true);
  const [timerPaused, setTimerPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!timerPaused && timerVisible && timerEnabled) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerPaused, timerVisible, timerEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFontSizeChange = (increment: boolean) => {
    const currentSize = settings.fontSize;
    const newSize = increment 
      ? Math.min(24, currentSize + 1)
      : Math.max(10, currentSize - 1);
    onSettingsChange("fontSize", newSize);
  };

  const getCurrentFontName = () => {
    const font = FONT_OPTIONS.find(f => f.value === settings.fontFamily);
    return font ? font.label : "Inter";
  };

  return (
    <div className="flex items-center gap-2">
      {/* Timer Component */}
      {timerEnabled && timerVisible && (
        <div className="flex items-center gap-1 bg-transparent border border-orange-400 px-2 py-1 rounded-full">
          <Timer className="h-3 w-3 text-orange-400" />
          <span className="text-xs font-mono text-orange-400 min-w-[35px]">
            {formatTime(elapsedTime)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTimerPaused(!timerPaused)}
            className="h-5 w-5 p-0 text-orange-400 hover:text-orange-300"
          >
            {timerPaused ? <Play className="h-2 w-2" /> : <Pause className="h-2 w-2" />}
          </Button>
        </div>
      )}
      
      {/* Timer visibility toggle */}
      {timerEnabled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTimerVisible(!timerVisible)}
          className="h-6 w-6 p-0 text-orange-400 hover:text-orange-300"
        >
          {timerVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      )}
      
      {/* Font Formatting Popover */}
      <Popover open={toolbarOpen} onOpenChange={setToolbarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 bg-white rounded-full hover:bg-gray-100"
          >
            <Type className="h-4 w-4 text-orange-600" />
          </Button>
        </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-orange-50 border-orange-200"
        side="bottom"
        align="start"
      >
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Text Formatting
          </div>
          
          {/* Font Family Section */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Font Family</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between h-8 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Type className="h-3 w-3" />
                    {getCurrentFontName()}
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-orange-50 border-orange-200">
                {FONT_OPTIONS.map((font) => (
                  <DropdownMenuItem
                    key={font.value}
                    onClick={() => onSettingsChange("fontFamily", font.value)}
                    className={`cursor-pointer ${
                      settings.fontFamily === font.value 
                        ? 'bg-gray-100' 
                        : ''
                    } hover:bg-gray-50 text-gray-700`}
                  >
                    <span style={{ fontFamily: font.value === 'inter' ? 'Inter' : font.value }}>
                      {font.label}
                    </span>
                    {settings.fontFamily === font.value && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Font Size Section */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Font Size</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFontSizeChange(false)}
                className="h-8 w-8 p-0"
                disabled={settings.fontSize <= 10}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-8 text-xs"
                  >
                    {settings.fontSize}px
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-orange-50 border-orange-200">
                  {FONT_SIZES.map((size) => (
                    <DropdownMenuItem
                      key={size}
                      onClick={() => onSettingsChange("fontSize", size)}
                      className={`cursor-pointer text-center ${
                        settings.fontSize === size 
                          ? 'bg-gray-100' 
                          : ''
                      } hover:bg-gray-50 text-gray-700`}
                    >
                      {size}px
                      {settings.fontSize === size && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFontSizeChange(true)}
                className="h-8 w-8 p-0"
                disabled={settings.fontSize >= 24}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Text Emphasis Section */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Key Concepts & Formulas</label>
            
            {/* Formatting Options */}
            <div className="flex items-center gap-1">
              {TEXT_EMPHASIS.map((option) => {
                const IconComponent = option.icon;
                const isActive = settings.emphasis[option.key as keyof typeof settings.emphasis];
                
                return (
                  <Button
                    key={option.key}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newEmphasis = {
                        ...settings.emphasis,
                        [option.key]: !isActive
                      };
                      onSettingsChange("emphasis", newEmphasis);
                    }}
                    className={`h-8 w-8 p-0 ${
                      isActive 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                    title={option.label}
                  >
                    <IconComponent className="h-3 w-3" />
                  </Button>
                );
              })}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Use these to emphasize important formulas, key terms, and concepts
            </p>
          </div>

        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
};

export default FormattingToolbar;