
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "signin" | "signup");
    setShowForgotPassword(false);
  };

  const handleSuccessfulAuth = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white border-0 shadow-xl rounded-xl p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-light text-center text-[#8A0303]">
            {showForgotPassword 
              ? "Reset Password" 
              : activeTab === "signin" 
                ? "Return to Studies" 
                : "Begin Your Journey"}
          </DialogTitle>
          {!showForgotPassword && (
            <p className="text-sm font-light text-gray-500 text-center">
              {activeTab === "signin" 
                ? "Continue your academic preparation" 
                : "Start your academic excellence journey"}
            </p>
          )}
        </DialogHeader>

        {showForgotPassword ? (
          <div className="mt-6">
            <ForgotPasswordForm onBack={handleBackToSignIn} />
          </div>
        ) : (
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full mt-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInForm onForgotPassword={handleForgotPasswordClick} onSuccess={handleSuccessfulAuth} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpForm onSuccess={handleSuccessfulAuth} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
