
import { Calendar, LineChart, Clock, TrendingUp, Award, Target, Star, Trophy } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProgressControlsProps {
  period: string;
  setPeriod: (period: string) => void;
}

export const ProgressControls = ({ period, setPeriod }: ProgressControlsProps) => {
  const handlePeriodChange = (value: string) => {
    console.log("Changing period to:", value);
    setPeriod(value);
  };

  return (
    <div className="flex gap-4">
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[160px] rounded-full border border-gray-300 bg-white">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <SelectValue placeholder="Select period" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-gray-200 shadow-md">
          <SelectItem value="daily" className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span>Daily</span>
          </SelectItem>
          <SelectItem value="weekly" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Weekly</span>
          </SelectItem>
          <SelectItem value="monthly" className="flex items-center gap-2">
            <Award className="h-4 w-4 text-purple-500" />
            <span>Monthly</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
