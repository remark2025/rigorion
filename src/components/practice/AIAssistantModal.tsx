import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, BookOpen, Target, Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { analyzeWithAIML } from "@/services/aimlApi";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface AIAssistantSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  currentQuestionTopic?: string;
  userProgress?: any;
}

export const AIAssistantModal = ({ 
  open, 
  onOpenChange, 
  currentQuestionIndex = 0,
  totalQuestions = 0,
  currentQuestionTopic = "General",
  userProgress 
}: AIAssistantSidebarProps) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi! I'm your AI study assistant. I can help you with personalized study techniques, answer questions about your practice session, and provide learning strategies based on your progress. What would you like to know?",
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const generatePersonalizedPrompt = (userQuestion: string) => {
    const userContext = {
      currentQuestion: currentQuestionIndex + 1,
      totalQuestions,
      topic: currentQuestionTopic,
      userName: user?.user_metadata?.name || "Student",
      hasProgress: !!userProgress
    };

    return `As a personalized AI study assistant, help ${userContext.userName} with their question: "${userQuestion}"

Current Context:
- Currently on question ${userContext.currentQuestion} of ${userContext.totalQuestions}
- Question topic: ${userContext.topic}
- User has ${userContext.hasProgress ? 'progress data available' : 'limited progress data'}

Please provide a personalized response that:
1. Addresses their specific question
2. Offers study techniques tailored to their current situation
3. Suggests learning strategies based on their progress
4. Provides actionable advice for SAT math preparation
5. Maintains an encouraging and supportive tone

Keep responses concise but helpful (2-3 paragraphs max).`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const personalizedPrompt = generatePersonalizedPrompt(userMessage.content);
      const aiResponse = await analyzeWithAIML({ query: personalizedPrompt });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Assistant error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Here are some general study tips while I get back online:\n\n• Take breaks every 25-30 minutes (Pomodoro technique)\n• Review your mistakes to learn from them\n• Practice active recall by explaining concepts aloud\n• Focus on understanding patterns rather than memorizing\n\nPlease try asking your question again in a moment!",
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "I'm having trouble connecting. Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What study technique works best for my current progress?",
    "How can I improve my speed on math problems?", 
    "What should I focus on based on my mistakes?",
    "Give me motivation tips for studying"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay backdrop - subtle and non-intrusive */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-20 right-4 bottom-24 w-96 max-w-[90vw] z-50 transform transition-transform duration-300 ease-in-out rounded-2xl flex flex-col ${
        open ? 'translate-x-0' : 'translate-x-full'
      } ${isDarkMode ? 'bg-gray-900/95 border border-green-500/30' : 'bg-orange-50/95 border border-orange-200'} backdrop-blur-md shadow-2xl`}>
        
        {/* Header - Collapsible */}
        <div className={`flex-shrink-0 border-b p-4 rounded-t-2xl ${isDarkMode ? 'border-green-500/30' : 'border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isDarkMode ? 'bg-green-600' : 'bg-orange-600'}`}>
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-orange-800'}`}>
                  AI Assistant
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-green-400/70' : 'text-orange-600'}`}>
                  Quick study help
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-orange-100 text-orange-600'}`}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800 text-green-400' : 'hover:bg-orange-100 text-orange-600'}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Context - Always Visible */}
          <div className={`mt-3 grid grid-cols-3 gap-2 p-2 rounded-lg ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-orange-100'
          }`}>
            <div className="text-center">
              <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-orange-600'}`}>Question</div>
              <div className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-orange-800'}`}>
                {currentQuestionIndex + 1}/{totalQuestions}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-orange-600'}`}>Topic</div>
              <div className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {currentQuestionTopic}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-orange-600'}`}>Ready</div>
              <div className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-orange-600'}`}>✓</div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="flex-1 flex flex-col overflow-hidden rounded-b-2xl">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3 py-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                      message.role === 'user'
                        ? isDarkMode 
                          ? 'bg-green-600 text-white' 
                          : 'bg-blue-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-800/50 border border-green-500/30 text-green-100'
                          : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="leading-relaxed whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isDarkMode ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className={`rounded-2xl p-3 ${
                      isDarkMode ? 'bg-gray-800/50 border border-green-500/30' : 'bg-gray-100'
                    }`}>
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-green-400' : 'bg-blue-600'
                        }`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-green-400' : 'bg-blue-600'
                        }`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${
                          isDarkMode ? 'bg-green-400' : 'bg-blue-600'
                        }`} style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Questions - Only show for first message */}
            {messages.length === 1 && (
              <div className="px-4 pb-3">
                <div className={`text-xs mb-2 font-medium ${isDarkMode ? 'text-green-400' : 'text-gray-600'}`}>
                  Quick questions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className={`text-xs h-7 px-2 rounded-full ${
                        isDarkMode 
                          ? 'border-green-500/30 text-green-400 hover:bg-green-600/20' 
                          : 'border-gray-300 text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`flex-shrink-0 p-4 border-t rounded-b-2xl ${isDarkMode ? 'border-green-500/30' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className={`flex-1 rounded-full px-3 py-2 text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 border-green-500/30 text-green-400 placeholder-green-600' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`rounded-full w-10 h-10 p-0 ${
                    isDarkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Quick Actions */}
        {!isExpanded && (
          <div className="flex-1 p-4 space-y-3 flex flex-col justify-center rounded-b-2xl">
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.slice(0, 2).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleQuickQuestion(question);
                    setIsExpanded(true);
                  }}
                  className={`text-xs h-8 px-2 rounded-full ${
                    isDarkMode 
                      ? 'border-green-500/30 text-green-400 hover:bg-green-600/20' 
                      : 'border-gray-300 text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {question.split(' ').slice(0, 3).join(' ')}...
                </Button>
              ))}
            </div>
            
            <Button
              onClick={() => setIsExpanded(true)}
              className={`w-full rounded-full ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Start Chat
            </Button>
          </div>
        )}

      </div>
    </>
  );
};