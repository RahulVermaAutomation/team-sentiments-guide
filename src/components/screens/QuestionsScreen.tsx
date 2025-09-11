import { useState } from "react";
import { WellnessScreen, WellnessHeader, WellnessActions } from "@/components/WellnessScreen";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuestionsScreenProps {
  onNext: (responses: QuestionResponses) => void;
}

export interface QuestionResponses {
  workSatisfaction: string;
  personalConcerns: string;
  growthMetrics: string;
}

export const QuestionsScreen = ({ onNext }: QuestionsScreenProps) => {
  const [responses, setResponses] = useState<QuestionResponses>({
    workSatisfaction: "",
    personalConcerns: "",
    growthMetrics: "",
  });

  const isComplete = responses.workSatisfaction && responses.personalConcerns && responses.growthMetrics;

  const handleSubmit = () => {
    if (isComplete) {
      onNext(responses);
    }
  };

  return (
    <WellnessScreen>
      <WellnessHeader 
        emoji="📊"
        title="Share your experience"
        description="Your honest feedback helps us better support you and your team."
      />
      
      <div className="space-y-8">
        {/* Question 1: Work Satisfaction */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            How satisfied are you with your current work and the learning opportunities available to you?
          </Label>
          <RadioGroup 
            value={responses.workSatisfaction} 
            onValueChange={(value) => setResponses(prev => ({ ...prev, workSatisfaction: value }))}
            className="grid grid-cols-5 gap-2"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex flex-col items-center space-y-1">
                <RadioGroupItem value={num.toString()} id={`work-${num}`} />
                <Label htmlFor={`work-${num}`} className="text-sm text-muted-foreground">{num}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Question 2: Personal Concerns */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            Do you have any personal concerns that are affecting how you feel at work?
          </Label>
          <RadioGroup 
            value={responses.personalConcerns} 
            onValueChange={(value) => setResponses(prev => ({ ...prev, personalConcerns: value }))}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="concerns-yes" />
              <Label htmlFor="concerns-yes" className="text-base">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="concerns-no" />
              <Label htmlFor="concerns-no" className="text-base">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Question 3: Growth Metrics */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            How supported do you feel in achieving your career growth and development goals?
          </Label>
          <RadioGroup 
            value={responses.growthMetrics} 
            onValueChange={(value) => setResponses(prev => ({ ...prev, growthMetrics: value }))}
            className="grid grid-cols-5 gap-2"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex flex-col items-center space-y-1">
                <RadioGroupItem value={num.toString()} id={`growth-${num}`} />
                <Label htmlFor={`growth-${num}`} className="text-sm text-muted-foreground">{num}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <WellnessActions>
        <Button 
          variant="wellness" 
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full"
        >
          ✅ Continue
        </Button>
      </WellnessActions>
    </WellnessScreen>
  );
};