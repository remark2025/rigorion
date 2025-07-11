
import { useState, useEffect } from "react";
import { BookOpen, ChevronDown, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/ui/use-toast";
import { useQuestions } from "@/contexts/QuestionsContext";

interface ExamTest {
  id: number;
  title: string;
  description: string;
  completionRate: number;
  examNumber: number;
}

interface ModulesDialogProps {
  onExamFilter?: (examNumber: number | null) => void;
  currentExamFilter?: number | null;
}

const ModulesDialog = ({ onExamFilter, currentExamFilter }: ModulesDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const { toast } = useToast();
  const { questions } = useQuestions();
  
  // Expanded exam tests list with 5 exams
  const [examTests] = useState<ExamTest[]>([
    { id: 1, title: "Exam 1", description: "Heart of Algebra focus", completionRate: 85, examNumber: 1 },
    { id: 2, title: "Exam 2", description: "Problem Solving and Data Analysis", completionRate: 75, examNumber: 2 },
    { id: 3, title: "Exam 3", description: "Passport to Advanced Math", completionRate: 60, examNumber: 3 },
    { id: 4, title: "Exam 4", description: "Reading Comprehension", completionRate: 70, examNumber: 4 },
    { id: 5, title: "Exam 5", description: "Writing and Language", completionRate: 80, examNumber: 5 }
  ]);

  const handleExamClick = (exam: ExamTest) => {
    console.log(`ModulesDialog - Filtering by Exam ${exam.examNumber}...`);
    
    // Filter questions by examNumber (integer field from database)
    const examQuestions = questions.filter(q => {
      let questionExam = q.examNumber;
      
      // Convert string to number if needed
      if (typeof questionExam === 'string') {
        const parsed = parseInt(questionExam, 10);
        questionExam = isNaN(parsed) ? null : parsed;
      }
      
      return questionExam === exam.examNumber;
    });
    
    console.log(`ModulesDialog - Found ${examQuestions.length} questions for Exam ${exam.examNumber}`);
    
    if (examQuestions.length === 0) {
      toast({
        title: "No Questions Found",
        description: `No questions found for ${exam.title}. This exam may not be available yet.`,
        variant: "destructive",
      });
      return;
    }

    if (onExamFilter) {
      console.log(`ModulesDialog - Calling onExamFilter with ${exam.examNumber}`);
      onExamFilter(exam.examNumber);
    }
    
    setIsOpen(false);
    
    toast({
      title: "Exam Filter Applied",
      description: `Filtered to ${examQuestions.length} questions from ${exam.title}`,
    });
  };

  const handleShowAllExams = () => {
    console.log("ModulesDialog - Clearing exam filter");
    
    if (onExamFilter) {
      onExamFilter(null);
    }
    setIsOpen(false);
    
    toast({
      title: "Filter Cleared",
      description: "Showing all available questions",
    });
  };

  const getExamQuestionCount = (examNumber: number) => {
    const count = questions.filter(q => {
      let questionExam = q.examNumber;
      
      // Convert string to number if needed
      if (typeof questionExam === 'string') {
        const parsed = parseInt(questionExam, 10);
        questionExam = isNaN(parsed) ? null : parsed;
      }
      
      return questionExam === examNumber;
    }).length;
    return count;
  };

  const isExamActive = (examNumber: number) => {
    return currentExamFilter === examNumber;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-full bg-transparent transition-colors ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          } ${currentExamFilter !== null ? (isDarkMode ? 'text-green-300 bg-green-900/20' : 'text-blue-600 bg-blue-50') : ''}`}
        >
          <BookOpen className={`h-4 w-4 mr-1.5 ${isDarkMode ? 'text-green-400' : 'text-blue-500'}`} />
          <span className={`hidden sm:inline ${isDarkMode ? 'text-green-400' : 'text-gray-700'}`}>
            {currentExamFilter !== null ? `Exam ${currentExamFilter}` : "Exams"}
          </span>
          <span className={`sm:hidden ${isDarkMode ? 'text-green-400' : 'text-gray-700'}`}>Ex</span>
          <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""} ${isDarkMode ? 'text-green-400' : 'text-gray-600'}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-80 shadow-lg rounded-lg p-2 z-50 ${
        isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-gray-900'}`}>Practice Exams</h3>
          {currentExamFilter !== null && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShowAllExams}
              className={`text-xs ${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-blue-500 hover:text-blue-700'}`}
            >
              Show All
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {examTests.map((exam) => {
              const questionCount = getExamQuestionCount(exam.examNumber);
              const isActive = isExamActive(exam.examNumber);
              
              return (
                <motion.div
                  key={exam.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive 
                      ? (isDarkMode ? 'bg-green-900/30 border-green-500/50' : 'bg-blue-50 border-blue-200') 
                      : (isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
                  }`}
                  onClick={() => handleExamClick(exam)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${
                          isActive 
                            ? (isDarkMode ? 'text-green-300' : 'text-blue-700') 
                            : (isDarkMode ? 'text-green-400' : 'text-gray-900')
                        }`}>
                          {exam.title}
                        </h4>
                        {isActive && (
                          <CheckCircle className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-blue-500'}`} />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {exam.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-blue-600'}`}>
                          {questionCount} questions
                        </span>
                        <div className={`text-xs px-2 py-1 rounded ${
                          exam.completionRate > 70 
                            ? (isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700')
                            : exam.completionRate > 30 
                            ? (isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                            : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')
                        }`}>
                          {exam.completionRate}% complete
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModulesDialog;
