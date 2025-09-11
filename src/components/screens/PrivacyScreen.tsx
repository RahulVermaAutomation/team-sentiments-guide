import { Button } from "@/components/ui/button";
import { WellnessScreen, WellnessHeader, WellnessActions } from "@/components/WellnessScreen";

interface PrivacyScreenProps {
  onAgree: () => void;
  onQuestions: () => void;
}

export const PrivacyScreen = ({ onAgree, onQuestions }: PrivacyScreenProps) => {
  return (
    <WellnessScreen>
      <WellnessHeader
        emoji="🔒"
        title="Your privacy matters"
        description=""
      />
      
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3 text-muted-foreground">
          <span className="text-primary text-lg">✅</span>
          <p className="text-base leading-relaxed">
            Your responses are confidential and only shared with leadership in aggregated form to better understand team well-being.
          </p>
        </div>
        
        <div className="flex items-start gap-3 text-muted-foreground">
          <span className="text-primary text-lg">✅</span>
          <p className="text-base leading-relaxed">
            Individual responses will not be shared without your permission.
          </p>
        </div>
        
        <div className="flex items-start gap-3 text-muted-foreground">
          <span className="text-primary text-lg">✅</span>
          <p className="text-base leading-relaxed">
            Sensitive data is protected with limited access controls to ensure your privacy and security.
          </p>
        </div>
      </div>
      
      <WellnessActions>
        <Button 
          variant="wellness" 
          size="lg" 
          onClick={onAgree}
          className="w-full"
        >
          ✅ I understand and agree
        </Button>
        <Button 
          variant="wellness-outline" 
          size="lg" 
          onClick={onQuestions}
          className="w-full"
        >
          ❓ I have questions
        </Button>
      </WellnessActions>
    </WellnessScreen>
  );
};