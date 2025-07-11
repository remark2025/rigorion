
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, TooltipProps, Bar, BarChart, ReferenceLine, Cell } from 'recharts';
import { format } from 'date-fns';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useState } from 'react';

interface PerformanceDataPoint {
  date: string;
  attempted: number;
}

interface ProgressChartProps {
  data: PerformanceDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const questions = payload[0].value as number;
    const momentum = payload[0].payload.momentum as number;
    
    // Calculate global percentage (mock data - replace with real global average)
    const globalAverage = 18; // Global average questions per day
    const globalPercentage = ((questions / globalAverage) * 100).toFixed(0);
    
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200 shadow-xl rounded-lg min-w-[200px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: momentum >= 0 ? '#22c55e' : '#ef4444' }}></div>
          <p className="font-semibold text-gray-800">{format(new Date(label), 'MMM dd, yyyy')}</p>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Questions:</span>
            <span className="font-medium text-gray-900">{questions}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Momentum:</span>
            <span 
              className="font-medium"
              style={{ color: momentum >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {momentum >= 0 ? '+' : ''}{momentum.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">vs Global:</span>
            <span 
              className="font-medium"
              style={{ color: questions >= globalAverage ? '#22c55e' : '#ef4444' }}
            >
              {globalPercentage}% of avg
            </span>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Global avg: {globalAverage} questions/day
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ProgressChart = ({ data = [] }: ProgressChartProps) => {
  const [isLineChart, setIsLineChart] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lastFifteenData = data.slice(-15); // Always show exactly 15 days of data
  
  // Debug logging to see what data we're receiving
  console.log("ProgressChart received data:", data);
  console.log("Data length:", data.length);
  console.log("Last fifteen data:", lastFifteenData);
  console.log("Last fifteen data length:", lastFifteenData.length);
  
  const enrichedData = lastFifteenData.map((item, index) => {
    const prevAttempted = index > 0 ? lastFifteenData[index - 1].attempted : item.attempted;
    const momentum = prevAttempted === 0 ? 0 : 
      ((item.attempted - prevAttempted) / prevAttempted * 100);
    
    const cappedMomentum = Math.max(Math.min(Number(momentum.toFixed(1)), 1.5), -1.5);
    
    return {
      date: format(new Date(item.date), 'MMM dd'),
      questions: item.attempted,
      momentum: cappedMomentum
    };
  });

  const minQuestions = Math.min(...enrichedData.map(d => d.questions));
  const minYAxis = Math.min(minQuestions * 0.8, 0);
  const avgQuestions = Math.round(lastFifteenData.reduce((acc, curr) => acc + curr.attempted, 0) / lastFifteenData.length);

  const renderChart = () => {
    if (isLineChart) {
      return (
        <LineChart
          data={enrichedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E5E5" opacity={0.6} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            dy={10}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            dx={-10}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            domain={[minYAxis, 'auto']}
          />
          <Tooltip 
          content={<CustomTooltip />}
          cursor={false}
        />
          <Line
            type="linear"
            dataKey="questions"
            strokeWidth={2}
            stroke="#333333"
            dot={(props) => {
              const momentum = props.payload.momentum;
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill={momentum >= 0 ? '#22c55e' : '#ef4444'}
                  stroke="white"
                  strokeWidth={1}
                />
              );
            }}
            activeDot={(props) => {
              const momentum = props.payload.momentum;
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={6}
                  fill={momentum >= 0 ? '#22c55e' : '#ef4444'}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }}
          />
        </LineChart>
      );
    }

    return (
      <BarChart
        data={enrichedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        onMouseMove={(data) => {
          if (data && data.activeTooltipIndex !== undefined) {
            setActiveIndex(data.activeTooltipIndex);
          }
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E5E5" opacity={0.6} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          dy={10}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          interval={0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          dx={-10}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          domain={[minYAxis, 'auto']}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={false}
        />
        {activeIndex !== null && (
          <ReferenceLine 
            x={enrichedData[activeIndex]?.date} 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="0"
          />
        )}
        <Bar
          dataKey="questions"
          radius={[0, 0, 0, 0]} // Rectangular edges
          maxBarSize={20} // Increase bar size to ensure all bars are visible
          shape={(props) => {
            const { x, y, width, height, payload } = props;
            const momentum = payload.momentum;
            const fillColor = momentum >= 0 ? '#22c55e' : '#ef4444';
            
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fillColor}
              />
            );
          }}
        />
      </BarChart>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Daily Questions Progress</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            Avg: {avgQuestions} questions/day
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsLineChart(!isLineChart)}
            className="h-8 w-8"
          >
            {isLineChart ? <BarChart3 className="h-4 w-4" /> : <LineChartIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mb-2 text-sm text-gray-600">
        Data points: {enrichedData.length} | Raw data: {data.length} | Expected: 15
      </div>
      <div className="w-full h-[300px]"> {/* Increased height from 225px for better visualization */}
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
