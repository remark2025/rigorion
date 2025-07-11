import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Star, Palette, Text } from "lucide-react";
import { ReactNode } from "react";

const FONT_OPTIONS = [
  { value: "inter", label: "Inter", class: "font-sans" },
  { value: "roboto", label: "Roboto", class: "font-roboto" },
  { value: "open-sans", label: "Open Sans", class: "font-open-sans" },
  { value: "comic-sans", label: "Comic Sans", class: "font-comic-sans" },
  { value: "courier-new", label: "Courier New", class: "font-mono" },
  { value: "poppins", label: "Poppins", class: "font-poppins" },
  { value: "merriweather", label: "Merriweather", class: "font-serif" },
  { value: "dancing-script", label: "Dancing Script", class: "font-dancing-script" },
  { value: "ubuntu", label: "Ubuntu", class: "font-ubuntu" }
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    fontFamily: string;
    fontSize: number;
    colorStyle: string;
    textColor: string;
  };
  onApply: (key: string, value: string | number) => void;
  children: ReactNode;
}

const SettingsDialog = ({
  open,
  onOpenChange,
  settings,
  onApply,
  children,
}: SettingsDialogProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-4 bg-white shadow-xl rounded-2xl border border-gray-100" side="bottom" align="end">
        <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
          <Star className="mr-2 h-4 w-4 text-amber-500" fill="#F59E0B" />
          <h3 className="text-base font-semibold text-gray-800 tracking-wide">
            Text Settings
          </h3>
        </div>

        <div className="grid gap-4 py-1">
          {/* Font Family Selection */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Text className="w-3 h-3 text-gray-400" />
              Font
            </Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(v) => onApply("fontFamily", v)}
            >
              <SelectTrigger className="w-full h-8 text-xs bg-white border rounded-md">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] bg-white rounded-xl shadow-md">
                {FONT_OPTIONS.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    className={cn(
                      "text-xs px-2 py-1 rounded font-medium flex items-center gap-2",
                      font.class,
                      settings.fontFamily === font.value ? "bg-blue-50 text-blue-600" : ""
                    )}
                  >
                    <span className={font.class}>{font.label}</span>
                    {settings.fontFamily === font.value && (
                      <span className="ml-auto text-blue-500 text-xs rounded px-2 py-0.5 bg-blue-100">Selected</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-gray-700">Size</Label>
              <span className="text-xs text-gray-500">
                {settings.fontSize}px
              </span>
            </div>
            <Slider
              min={10}
              max={24}
              step={1}
              value={[settings.fontSize]}
              onValueChange={([value]) => onApply("fontSize", value)}
              className="cursor-pointer"
            />
          </div>

          {/* Text Color */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Palette className="w-3 h-3 text-gray-400" />
              Text Color
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={settings.textColor || '#374151'}
                onChange={(e) => onApply("textColor", e.target.value)}
                className="h-8 w-10 cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs text-gray-700 ml-1">{settings.textColor}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SettingsDialog;
