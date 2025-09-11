import { Button } from "@/components/ui/button";
import { WellnessScreen, WellnessHeader, WellnessActions } from "@/components/WellnessScreen";

interface WelcomeScreenProps {
  onContinue: () => void;
  onLearnMore: () => void;
}

export const WelcomeScreen = ({ onContinue, onLearnMore }: WelcomeScreenProps) => {
  return (
    <WellnessScreen>
      <WellnessHeader
        emoji="👋"
        title="Welcome! We're here to support you."
        description="This chatbot helps you share how you're feeling about your work, workload, and well-being. Your responses help leadership better understand team challenges and offer personalized support — all while keeping your privacy a priority."
      />
      
      <WellnessActions>
        <Button 
          variant="wellness" 
          size="lg" 
          onClick={onContinue}
          className="w-full"
        >
          ✅ Continue
        </Button>
        <Button 
          variant="wellness-outline" 
          size="lg" 
          onClick={onLearnMore}
          className="w-full"
        >
          ❓ Learn more
        </Button>
      </WellnessActions>
    </WellnessScreen>
  );
};