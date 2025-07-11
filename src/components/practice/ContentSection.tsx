
import { Question } from "@/types/QuestionInterface";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface TextSettings {
  fontFamily: string;
  fontSize: number;
  colorStyle: 'plain';
  textColor?: string;
}

interface ContentSectionProps {
  activeTab: "problem" | "solution" | "quote";
  question: Question;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  onAnswerSelected: (answer: string) => void;
  settings: TextSettings;
}

const ContentSection = ({
  activeTab,
  question,
  selectedAnswer,
  isCorrect,
  onAnswerSelected,
  settings
}: ContentSectionProps) => {
  const { isDarkMode } = useTheme();
  // Get font family class (tailwind utility or fallback to default)
  const fontFamilyClass = `font-${settings.fontFamily}`;

  // Shared style for question and solution content
  const contentStyle = {
    fontFamily: settings.fontFamily === 'inter' ? 'Inter, sans-serif' : 
                settings.fontFamily === 'roboto' ? 'Roboto, sans-serif' :
                settings.fontFamily === 'open-sans' ? 'Open Sans, sans-serif' :
                settings.fontFamily === 'comic-sans' ? 'Comic Sans MS, cursive' :
                settings.fontFamily === 'courier-new' ? 'Courier New, monospace' :
                settings.fontFamily === 'poppins' ? 'Poppins, sans-serif' :
                settings.fontFamily === 'merriweather' ? 'Merriweather, serif' :
                settings.fontFamily === 'dancing-script' ? 'Dancing Script, cursive' :
                settings.fontFamily === 'ubuntu' ? 'Ubuntu, sans-serif' : 'Inter, sans-serif',
    fontSize: `${settings.fontSize}px`,
    color: settings.textColor || "#374151",
    transition: "all 0.2s"
  };

  const getAnswerButtonStyles = (answer: string) => {
    if (selectedAnswer !== answer)
      return `${fontFamilyClass} border-2 border-gray-200 rounded-full p-4 hover:bg-gray-50 transition-all text-left flex justify-between items-center`;
    if (answer === question.correctAnswer)
      return `${fontFamilyClass} border-2 border-emerald-500 bg-emerald-50 rounded-full p-4 transition-all text-left flex justify-between items-center animate-pulse`;
    return `${fontFamilyClass} border-2 border-red-500 bg-red-50 rounded-full p-4 transition-all text-left flex justify-between items-center animate-pulse`;
  };

  // Create choices array if it doesn't exist
  const choices = question.choices || ["Option A", "Option B", "Option C", "Option D"];

  return (
    <div className={`flex-1 p-8 max-w-3xl mx-auto ${fontFamilyClass} transition-all`}>
      {/* Question Content */}
      <div className="mb-8 text-center">
        <div className="text-sm text-gray-500 mb-2 flex items-center justify-center gap-2">
          <span>Problem Solution Quote</span>
        </div>
        <h2
          className="text-2xl font-medium"
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: question.content || "Question content not available" }}
        />
      </div>

      {/* Dynamic Content based on Tab */}
      {activeTab === "problem" && (
        <div className="grid grid-cols-2 gap-4 mb-12">
          {choices.map((answer) => (
            <button
              key={answer}
              className={getAnswerButtonStyles(answer)}
              style={contentStyle}
              onClick={() => onAnswerSelected(answer)}
            >
              <span 
                dangerouslySetInnerHTML={{ __html: answer }} 
                style={contentStyle}
              />
              {selectedAnswer === answer && isCorrect !== null && (
                isCorrect
                  ? <CheckCircle className="h-5 w-5 text-green-500" />
                  : <XCircle className="h-5 w-5 text-red-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {activeTab === "solution" && (
        <div className={`prose max-w-none mb-12 p-6 rounded-lg transition-colors ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <h3 
            className="text-lg font-semibold mb-4"
            style={{...contentStyle, color: isDarkMode ? '#a3e635' : contentStyle.color}}
          >
            Step-by-Step Solution
          </h3>
          
          {/* Handle new step-based structure */}
          {(() => {
            // Check if solution is an array of step objects
            let solutionSteps = [];
            try {
              if (typeof question.solution === 'string') {
                const parsed = JSON.parse(question.solution);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].step) {
                  solutionSteps = parsed;
                }
              } else if (Array.isArray(question.solution)) {
                solutionSteps = question.solution;
              }
            } catch (e) {
              // If parsing fails, fall back to original string rendering
            }

            if (solutionSteps.length > 0) {
              return (
                <div className="space-y-4">
                  {solutionSteps.map((stepObj, index) => (
                    <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isDarkMode ? 'bg-gray-800 border-green-500/30' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div 
                        className="flex-1"
                        style={{...contentStyle, color: isDarkMode ? '#a3e635' : contentStyle.color}}
                        dangerouslySetInnerHTML={{ __html: stepObj.step }}
                      />
                    </div>
                  ))}
                </div>
              );
            } else {
              // Fall back to original solution rendering
              return (
                <div 
                  dangerouslySetInnerHTML={{ __html: question.solution || "Solution not available" }} 
                  style={contentStyle}
                />
              );
            }
          })()}
          
          {question.explanation && (
            <div className={`mt-4 p-4 rounded-lg border transition-colors ${
              isDarkMode ? 'bg-gray-900 border-green-500/30' : 'bg-white border-gray-200'
            }`}>
              <h4 className="font-medium mb-2" style={{...contentStyle, color: isDarkMode ? '#a3e635' : contentStyle.color}}>Explanation</h4>
              <p style={{...contentStyle, color: isDarkMode ? '#a3e635' : contentStyle.color}}>{question.explanation}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "quote" && (
        <div className="prose max-w-none mb-12 p-6 pt-24 bg-gray-50 rounded-lg">
          {question.quote ? (
            <blockquote className="text-xl italic text-gray-700">
              <span style={contentStyle}>"{question.quote.text}"</span>
              {question.quote.source && (
                <footer className="mt-2 text-gray-500" style={contentStyle}>- {question.quote.source}</footer>
              )}
            </blockquote>
          ) : (
            <p className="text-gray-500 italic" style={contentStyle}>No quote available for this question.</p>
          )}
        </div>
      )}

      {/* Trusted By Section */}
      <div className="mt-16 text-center text-sm text-gray-500">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gray-300" />
          TRUSTED BY
          <div className="h-px w-16 bg-gray-300" />
        </div>
        <div className="flex justify-center gap-6 text-gray-600 font-medium">
          <span>Company A</span>
          <span>Company B</span>
          <span>Company C</span>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
