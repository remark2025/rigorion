
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

function App() {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <AudioProvider>
            <Router>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/interactive-math" element={<InteractiveMathDemo />} />
                <Route path="/interactive-math-test" element={<InteractiveMathTest />} />
                <Route path="/simple-test" element={<SimpleInteractiveTest />} />
                <Route path="/reading-demo" element={<ReadingSolutionDemo />} />
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
