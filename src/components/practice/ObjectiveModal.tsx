import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ObjectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetObjective: (value: number) => void;
}

const ObjectiveModal = ({ open, onOpenChange, onSetObjective }: ObjectiveModalProps) => {
  const [value, setValue] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-orange-50 border-orange-200">
        <DialogHeader>
          <DialogTitle className="text-orange-800">Set Your Practice Objective</DialogTitle>
        </DialogHeader>
        {/* Single input for number of questions */}
        <Input
          type="number"
          placeholder="Number of questions"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="1"
          className="rounded-xl"
        />
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => onSetObjective(parseInt(value) || 0)}
            className="rounded-xl transition-all duration-300 text-black font-semibold"
            style={{
              background: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)'
            }}
          >
            Set Objective
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObjectiveModal;
