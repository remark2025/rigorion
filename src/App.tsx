
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Practice from "@/pages/Practice";
import Analytics from "@/pages/Progress";
import About from "@/pages/About";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Endpoints from "@/pages/Endpoints";
import StripeTest from "@/pages/StripeTest";
import Account from "@/pages/Account";
import InteractiveMathDemo from "@/pages/InteractiveMathDemo";
import InteractiveMathTest from "@/pages/InteractiveMathTest";
import SimpleInteractiveTest from "@/pages/SimpleInteractiveTest";
import ReadingSolutionDemo from "@/pages/ReadingSolutionDemo";
import WritingSolutionDemo from "@/pages/WritingSolutionDemo";
import WritingCorrectionDemo from "@/pages/WritingCorrectionDemo";
import SATWritingDemo from "@/pages/SATWritingDemo";
import AIWritingExaminer from "@/pages/AIWritingExaminer";
import AIReadingAnalyzer from "@/pages/AIReadingAnalyzer";
import ReadingAssistant from "@/components/reading/ReadingAssistant";
import InteractiveMathHub from "@/pages/InteractiveMathHub";
import ProjectileMotion from "@/components/math/ProjectileMotion";
import PremiumMathTool from "@/components/math/PremiumMathTool";
import AdvancedAnimationDemo from "@/pages/AdvancedAnimationDemo";
import SATMockTestPage from "@/pages/SATMockTestPage";
import SATExamHub from "@/pages/SATExamHub";
import DatabasePopulator from "@/pages/DatabasePopulator";
import SATMath from "@/pages/SATMath";

function App() {
  // Prevent layout shift from modals by maintaining scrollbar space
  React.useEffect(() => {
    document.documentElement.style.scrollbarGutter = 'stable';
  }, []);

  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <AudioProvider>
            <Router>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300" style={{ scrollbarGutter: 'stable' }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/sat-math" element={<SATMath />} />
                <Route path="/interactive-math" element={<InteractiveMathDemo />} />
                <Route path="/interactive-math-test" element={<InteractiveMathTest />} />
                <Route path="/simple-test" element={<SimpleInteractiveTest />} />
                <Route path="/reading-demo" element={<ReadingSolutionDemo />} />
                <Route path="/writing-demo" element={<WritingSolutionDemo />} />
                <Route path="/writing-correction-demo" element={<WritingCorrectionDemo />} />
                <Route path="/sat-writing-demo" element={<SATWritingDemo />} />
                <Route path="/ai-writing-examiner" element={<AIWritingExaminer />} />
                <Route path="/ai-reading-analyzer" element={<AIReadingAnalyzer />} />
                <Route path="/reading-assistant" element={<ReadingAssistant />} />
                <Route path="/interactive-math" element={<InteractiveMathHub />} />
                <Route path="/interactive-math/projectile-motion" element={<ProjectileMotion />} />
                <Route 
                  path="/interactive-math/quadratic-grapher" 
                  element={
                    <PremiumMathTool 
                      title="Quadratic Functions"
                      description="Explore parabolas and their transformations with interactive graphing tools."
                      category="Algebra"
                      toolName="Quadratic Grapher"
                    />
                  } 
                />
                <Route 
                  path="/interactive-math/trig-circle" 
                  element={
                    <PremiumMathTool 
                      title="Unit Circle Explorer"
                      description="Master trigonometric functions with visual circle interactions."
                      category="Trigonometry"
                      toolName="Trigonometry Circle"
                    />
                  } 
                />
                <Route 
                  path="/interactive-math/linear-transforms" 
                  element={
                    <PremiumMathTool 
                      title="Linear Transformations"
                      description="Understand matrix operations through visual transformations."
                      category="Geometry"
                      toolName="Linear Transformations"
                    />
                  } 
                />
                <Route 
                  path="/interactive-math/statistics" 
                  element={
                    <PremiumMathTool 
                      title="Data Visualization"
                      description="Interactive charts and probability distribution tools."
                      category="Statistics"
                      toolName="Statistics Visualizer"
                    />
                  } 
                />
                <Route 
                  path="/interactive-math/calculus" 
                  element={
                    <PremiumMathTool 
                      title="Calculus Explorer"
                      description="Visualize derivatives and integrals with interactive tools."
                      category="Advanced Math"
                      toolName="Calculus Explorer"
                    />
                  } 
                />
                <Route 
                  path="/interactive-math/coordinate-geometry" 
                  element={
                    <PremiumMathTool 
                      title="Coordinate Geometry"
                      description="Points, lines, and shapes in the coordinate plane."
                      category="Geometry"
                      toolName="Coordinate Geometry"
                    />
                  } 
                />
                <Route 
                  path="/interactive-math/exponential" 
                  element={
                    <PremiumMathTool 
                      title="Exponential & Logarithmic Functions"
                      description="Growth and decay in mathematical models."
                      category="Algebra"
                      toolName="Exponential Functions"
                    />
                  } 
                />
                <Route path="/advanced-animations" element={<AdvancedAnimationDemo />} />
                <Route path="/sat-exams" element={<SATExamHub />} />
                <Route path="/sat-mock-test" element={<SATMockTestPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/about" element={<About />} />
                <Route path="/payment" element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                } />
                <Route path="/payment-success" element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } />
                <Route path="/endpoints" element={
                  <ProtectedRoute>
                    <Endpoints />
                  </ProtectedRoute>
                } />
                <Route path="/database-populator" element={
                  <ProtectedRoute>
                    <DatabasePopulator />
                  </ProtectedRoute>
                } />
                <Route path="/stripe-test" element={
                  <ProtectedRoute>
                    <StripeTest />
                  </ProtectedRoute>
                } />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
          </AudioProvider>
        </AuthProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

export default App;
