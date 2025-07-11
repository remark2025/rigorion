
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface ChapterStats {
  chapterId: string;
  chapterName: string;
  correct: number;
  incorrect: number;
  unattempted: number;
}

interface ChapterProgressProps {
  chapters: ChapterStats[];
}

export const ChapterProgress = ({
  chapters = []
}: ChapterProgressProps) => {
  const { isDarkMode } = useTheme();
  
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return value / total * 100;
  };

  return (
    <div className="space-y-4 h-[480px] flex flex-col">
      <h3 className={`text-lg font-semibold mb-4 text-center ${
        isDarkMode ? 'text-green-400' : 'text-gray-800'
      }`}>Chapter Performance</h3>
      
      <div className="flex justify-center gap-8 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className={`text-sm ${
            isDarkMode ? 'text-green-400' : 'text-gray-600'
          }`}>Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className={`text-sm ${
            isDarkMode ? 'text-green-400' : 'text-gray-600'
          }`}>Incorrect</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className={`text-sm ${
            isDarkMode ? 'text-green-400' : 'text-gray-600'
          }`}>Unattempted</span>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        <table className="w-full text-sm">
          <thead className={`sticky top-0 z-10 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <tr>
              <th className={`text-left py-2 px-3 font-medium ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Chapter</th>
              <th className={`text-center py-2 px-3 font-medium ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Correct</th>
              <th className={`text-center py-2 px-3 font-medium ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Incorrect</th>
              <th className={`text-center py-2 px-3 font-medium ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Unattempted</th>
              <th className={`text-right py-2 px-3 font-medium ${
                isDarkMode ? 'text-green-400' : 'text-gray-600'
              }`}>Progress</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode ? 'divide-green-500/30' : 'divide-gray-100'
          }`}>
            {chapters.map((chapter, index) => {
              const totalQuestions = chapter.correct + chapter.incorrect + chapter.unattempted;
              const coveredQuestions = chapter.correct + chapter.incorrect;
              const totalProgress = calculatePercentage(coveredQuestions, totalQuestions);
              
              return (
                <motion.tr
                  key={chapter.chapterId || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className={`py-2 px-3 font-medium ${
                    isDarkMode ? 'text-green-400' : ''
                  }`}>{chapter.chapterName}</td>
                  <td className={`py-2 px-3 text-center ${
                    isDarkMode ? 'text-green-400' : 'text-emerald-600'
                  }`}>{chapter.correct}</td>
                  <td className="py-2 px-3 text-center text-red-600">{chapter.incorrect}</td>
                  <td className="py-2 px-3 text-center text-orange-600">{chapter.unattempted}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-24 h-2 rounded-full overflow-hidden ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <div 
                          className={`h-full rounded-l-full ${
                            isDarkMode ? 'bg-green-500' : 'bg-emerald-500'
                          }`}
                          style={{ 
                            width: `${calculatePercentage(chapter.correct, totalQuestions)}%` 
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        isDarkMode ? 'text-green-400' : ''
                      }`}>
                        {totalProgress.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
            
            {chapters.length === 0 && (
              <tr>
                <td colSpan={5} className={`py-8 text-center ${
                  isDarkMode ? 'text-green-400/70' : 'text-gray-500'
                }`}>
                  No chapter data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
