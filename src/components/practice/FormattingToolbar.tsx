import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Minus, 
  Plus, 
  ChevronDown
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

const COLOR_PRESETS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF",
  "#EF4444", "#F97316", "#EAB308", "#22C55E", 
  "#3B82F6", "#8B5CF6", "#EC4899", "#F43F5E"
];

interface FormattingToolbarProps {
  settings: {
    fontFamily: string;
    fontSize: number;
    textColor: string;
  };
  onSettingsChange: (key: string, value: string | number) => void;
}

export const FormattingToolbar = ({ settings, onSettingsChange }: FormattingToolbarProps) => {
  const { isDarkMode } = useTheme();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

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
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
      isDarkMode 
        ? 'bg-gray-800/50 border border-gray-700/50' 
        : 'bg-gray-50 border border-gray-200/50'
    }`}>
      
      {/* Font Family Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 px-2 text-xs font-medium ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Type className="h-3 w-3 mr-1" />
            <span className="text-xs">{getCurrentFontName().slice(0, 4)}</span>
            <ChevronDown className="h-2 w-2 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`w-48 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {FONT_OPTIONS.map((font) => (
            <DropdownMenuItem
              key={font.value}
              onClick={() => onSettingsChange("fontFamily", font.value)}
              className={`cursor-pointer ${
                settings.fontFamily === font.value 
                  ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') 
                  : ''
              } ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
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

      {/* Font Size Controls */}
      <div className="flex items-center border rounded">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFontSizeChange(false)}
          className={`h-6 w-6 p-0 border-r ${
            isDarkMode ? 'hover:bg-gray-700 border-gray-600' : 'hover:bg-gray-100 border-gray-200'
          }`}
          disabled={settings.fontSize <= 10}
        >
          <Minus className="h-2 w-2" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-6 px-2 text-xs font-medium border-r min-w-8 ${
                isDarkMode ? 'hover:bg-gray-700 border-gray-600 text-gray-300' : 'hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              {settings.fontSize}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onSettingsChange("fontSize", size)}
                className={`cursor-pointer text-center ${
                  settings.fontSize === size 
                    ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') 
                    : ''
                } ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
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
          variant="ghost"
          size="sm"
          onClick={() => handleFontSizeChange(true)}
          className={`h-6 w-6 p-0 ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          disabled={settings.fontSize >= 24}
        >
          <Plus className="h-2 w-2" />
        </Button>
      </div>

      {/* Color Picker */}
      <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 w-6 p-0 relative ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Type className="h-3 w-3" style={{ color: settings.textColor }} />
            <div 
              className="absolute bottom-0.5 left-0.5 right-0.5 h-0.5 rounded"
              style={{ backgroundColor: settings.textColor }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={`w-64 p-3 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          side="bottom"
          align="end"
        >
          <div className="space-y-3">
            <div className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Text Color
            </div>
            
            {/* Color Presets */}
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onSettingsChange("textColor", color);
                    setColorPickerOpen(false);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    settings.textColor === color 
                      ? 'border-blue-500 scale-110' 
                      : (isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => onSettingsChange("textColor", e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={settings.textColor}
                  onChange={(e) => onSettingsChange("textColor", e.target.value)}
                  className={`w-full px-2 py-1 text-xs border rounded ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-300' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

    </div>
  );
};

export default FormattingToolbar;