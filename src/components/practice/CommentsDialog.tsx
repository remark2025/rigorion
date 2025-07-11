
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CommentsDialogProps {
  onSubmitComment?: (comment: string, rating: number) => void;
}

const CommentsDialog = ({ onSubmitComment }: CommentsDialogProps) => {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide some feedback before submitting",
        variant: "destructive",
      });
      return;
    }

    if (onSubmitComment) {
      onSubmitComment(comment, rating);
    } else {
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully",
      });
    }

    setComment("");
    setRating(0);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full relative transition-all duration-300"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-center">Share Your Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          {/* Star Rating */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Rate your experience:</label>
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`p-1 transition-all duration-200 ${
                    rating >= star ? "text-yellow-400 scale-110" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Your comments (optional):
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think about our app..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;
