
import { motion } from "framer-motion";
import { ReactNode } from "react";

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedContainer = ({ children, className }: AnimatedContainerProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={containerVariants}
  >
    {children}
  </motion.div>
);

export const AnimatedItem = ({ children, className }: AnimatedContainerProps) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);
