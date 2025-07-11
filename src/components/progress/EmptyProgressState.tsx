
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyProgressStateProps {
  message?: string;
}

export const EmptyProgressState = ({ message = "No Progress Data Yet" }: EmptyProgressStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-mono-bg">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4">{message}</h2>
        <p className="text-mono-muted mb-6">Start practicing to track your progress and see your improvements!</p>
        <Button onClick={() => navigate("/practice")}>
          Start Practice
        </Button>
      </motion.div>
    </div>
  );
};
