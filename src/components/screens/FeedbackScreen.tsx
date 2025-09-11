import { useState } from "react";
import { WellnessScreen, WellnessHeader, WellnessActions } from "@/components/WellnessScreen";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FeedbackScreenProps {
  onSubmit: (feedback?: string) => void;
}

export const FeedbackScreen = ({ onSubmit }: FeedbackScreenProps) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    onSubmit(feedback.trim() || undefined);
  };

  const handleSkip = () => {
    onSubmit();
  };

  return (
    <WellnessScreen>
      <WellnessHeader 
        emoji="💭"
        title="Anything else to share?"
        description="Is there anything else you'd like to share that could help us better support you and your team?"
      />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="feedback" className="text-base font-medium text-foreground">
            Additional feedback (optional)
          </Label>
          <Textarea
            id="feedback"
            placeholder="Share any additional thoughts, concerns, or suggestions..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>
      </div>

      <WellnessActions>
        <Button 
          variant="wellness" 
          onClick={handleSubmit}
          className="w-full"
        >
          ✅ Submit Feedback
        </Button>
        <Button 
          variant="wellness-outline" 
          onClick={handleSkip}
          className="w-full"
        >
          Skip
        </Button>
      </WellnessActions>
    </WellnessScreen>
  );
};