import { Button } from "@/components/ui/button";
import { WellnessScreen, WellnessHeader, WellnessActions } from "@/components/WellnessScreen";

interface ConsentScreenProps {
  onConsent: () => void;
  onDecline: () => void;
}

export const ConsentScreen = ({ onConsent, onDecline }: ConsentScreenProps) => {
  return (
    <WellnessScreen>
      <WellnessHeader
        emoji="🤝"
        title="Let's work together"
        description="Do you consent to share your details to help leadership better support your well-being and that of your team? Your information will be used to provide timely help and improvements tailored to your experience."
      />
      
      <WellnessActions>
        <Button 
          variant="wellness" 
          size="lg" 
          onClick={onConsent}
          className="w-full"
        >
          ✅ Yes, I consent
        </Button>
        <Button 
          variant="wellness-outline" 
          size="lg" 
          onClick={onDecline}
          className="w-full"
        >
          ❌ No, I prefer not to share
        </Button>
      </WellnessActions>
    </WellnessScreen>
  );
};