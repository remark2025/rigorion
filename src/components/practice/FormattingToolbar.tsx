import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Type, 
  Minus, 
  Plus, 
  ChevronDown,
  Palette,
  Paintbrush,
  Heart,
  Sparkles
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
  onThemeChange?: (themeId: string) => void;
  onCompanionChange?: (companionId: string) => void;
}

const THEMES = [
  { id: "classic", name: "Classic Library", color: "#8B4513" },
  { id: "modern", name: "Modern Lab", color: "#6366F1" },
  { id: "cozy", name: "Cozy Study", color: "#10B981" },
  { id: "forest", name: "Forest Retreat", color: "#059669" },
  { id: "ocean", name: "Ocean Depths", color: "#0891B2" },
  { id: "space", name: "Space Station", color: "#7C3AED" },
  { id: "zen", name: "Zen Garden", color: "#84CC16" },
];

const COMPANIONS = [
  { id: "cat", name: "Study Cat", emoji: "🐱" },
  { id: "owl", name: "Wise Owl", emoji: "🦉" },
  { id: "fox", name: "Clever Fox", emoji: "🦊" },
  { id: "dolphin", name: "Smart Dolphin", emoji: "🐬" },
  { id: "robot", name: "Study Bot", emoji: "🤖" },
  { id: "dragon", name: "Knowledge Dragon", emoji: "🐉" },
];

export const FormattingToolbar = ({ settings, onSettingsChange, onThemeChange, onCompanionChange }: FormattingToolbarProps) => {
  const { isDarkMode } = useTheme();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [personalizationOpen, setPersonalizationOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("classic");
  const [selectedCompanion, setSelectedCompanion] = useState("cat");

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
    <div className="flex items-center gap-1">
      {/* Text Personalization Icon */}
      <Popover open={toolbarOpen} onOpenChange={setToolbarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 bg-white rounded-full hover:bg-gray-100"
          >
            <Palette className="h-4 w-4 text-purple-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 bg-white border-gray-200"
          side="bottom"
          align="start"
        >
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Text Personalization
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
              <DropdownMenuContent className="w-48 bg-white border-gray-200">
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
                <DropdownMenuContent className="bg-white border-gray-200">
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

          {/* Text Color Section */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Text Color</label>
            
            {/* Color Presets */}
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => onSettingsChange("textColor", color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    settings.textColor === color 
                      ? 'border-blue-500 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
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
                  className="w-full px-2 py-1 text-xs border rounded bg-white border-gray-300 text-gray-700"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          </div>
        </PopoverContent>
      </Popover>

      {/* Themes & Companions Icon */}
      <Popover open={personalizationOpen} onOpenChange={setPersonalizationOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 bg-white rounded-full hover:bg-gray-100"
          >
            <Sparkles className="h-4 w-4 text-pink-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4 bg-white border-gray-200"
          side="bottom"
          align="start"
        >
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Study Experience
            </div>

            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs text-gray-600 flex items-center gap-1">
                <Paintbrush className="h-3 w-3" />
                Study Theme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      onThemeChange?.(theme.id);
                    }}
                    className={`p-2 rounded-lg border transition-all text-xs ${
                      selectedTheme === theme.id 
                        ? 'border-blue-500 bg-blue-50 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={theme.name}
                  >
                    <div 
                      className="w-6 h-6 rounded mx-auto mb-1"
                      style={{ backgroundColor: theme.color }}
                    />
                    <div className="text-gray-700 leading-tight">{theme.name.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Companion Selection */}
            <div className="space-y-2">
              <label className="text-xs text-gray-600 flex items-center gap-1">
                <Heart className="h-3 w-3" />
                Study Companion
              </label>
              <div className="grid grid-cols-6 gap-2">
                {COMPANIONS.map((companion) => (
                  <button
                    key={companion.id}
                    onClick={() => {
                      setSelectedCompanion(companion.id);
                      onCompanionChange?.(companion.id);
                    }}
                    className={`p-2 rounded-lg border transition-all ${
                      selectedCompanion === companion.id 
                        ? 'border-pink-500 bg-pink-50 scale-110' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={companion.name}
                  >
                    <div className="text-xl">{companion.emoji}</div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-500 text-center">
                {COMPANIONS.find(c => c.id === selectedCompanion)?.name || "Study Cat"}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FormattingToolbar;