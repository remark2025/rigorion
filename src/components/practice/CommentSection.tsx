
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, X, Send } from "lucide-react";

const CommentSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");

  const handleToggle = () => setIsOpen((prev) => !prev);
  
  const handleSend = () => {
    // Implement your send logic here
    console.log("Comment submitted:", comment);
    setComment("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {/* Trigger Button */}
      {!isOpen && (
        <Button
          onClick={handleToggle}
          className="rounded-full text-black p-3 h-12 w-12 shadow-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
          }}
        >
          <MessageCircle className="h-5 w-5 text-black" />
        </Button>
      )}

      {/* Comment Input Area (opens upward and fits within viewport) */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-xl border transition-all duration-300 ease-in-out p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Write your comment</h4>
            <Button
              onClick={handleToggle}
              variant="ghost"
              className="p-1 h-6 w-6 rounded-full hover:bg-gray-100"
              size="sm"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            maxLength={500}
          />
          
          {/* Character count */}
          <div className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/500
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end mt-3 gap-2">
            {/* Image Upload (Plus Icon) */}
            <Button
              onClick={() => console.log("Upload image")}
              variant="outline"
              className="rounded-full p-2 h-8 w-8"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!comment.trim()}
              className="text-black rounded-full px-4 py-1 h-8 flex items-center gap-1 disabled:opacity-50"
              style={{
                background: !comment.trim() ? '#E5E7EB' : 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
              }}
              size="sm"
            >
              <Send className="h-3 w-3" />
              <span className="text-xs">Send</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
