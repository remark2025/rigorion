
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import { Flag, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  dueDate: string;
}

interface GoalsCardProps {
  goals: Goal[];
}

export const GoalsCard = ({ goals = [] }: GoalsCardProps) => {
  const sortedGoals = [...goals].sort((a, b) => {
    // Get completion percentage
    const aPercentage = (a.currentValue / a.targetValue) * 100;
    const bPercentage = (b.currentValue / b.targetValue) * 100;

    // First, show goals that are not yet completed
    if (aPercentage < 100 && bPercentage >= 100) return -1;
    if (aPercentage >= 100 && bPercentage < 100) return 1;

    // Then sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const completedGoals = goals.filter(goal => (goal.currentValue / goal.targetValue) * 100 >= 100).length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <Card className="bg-white border border-gray-50 h-[480px]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Goals</h3>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-600 font-medium">{completedGoals}/{totalGoals} completed</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Goal Completion Rate</span>
            <span className="text-sm font-medium text-blue-600">{completionRate}%</span>
          </div>
          
          <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="space-y-6 mt-6 overflow-y-auto max-h-[320px] pr-2">
          {sortedGoals.map((goal, index) => {
            const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isComplete = progress >= 100;
            const timeLeft = new Date(goal.dueDate) > new Date() 
              ? formatDistanceToNow(new Date(goal.dueDate), { addSuffix: true })
              : 'Expired';

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-800 mb-1">{goal.title}</h4>
                    <div className="text-xs text-gray-500">Due {timeLeft}</div>
                  </div>
                  {isComplete && (
                    <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Complete</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span>{goal.currentValue} / {goal.targetValue}</span>
                    <span className={isComplete ? "text-green-600" : "text-blue-600"}>{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-1.5 ${isComplete ? "bg-green-100" : "bg-blue-100"}`} 
                  />
                </div>
              </motion.div>
            );
          })}
          
          {goals.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
              <Flag className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm">No goals have been set yet.</p>
              <p className="text-xs mt-1">Goals help track your progress and stay motivated.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsCard;
