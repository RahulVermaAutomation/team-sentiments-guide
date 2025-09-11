import { useState } from "react";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { PrivacyScreen } from "@/components/screens/PrivacyScreen";
import { ConsentScreen } from "@/components/screens/ConsentScreen";
import { useToast } from "@/hooks/use-toast";

type Screen = "welcome" | "privacy" | "consent" | "complete";

export const WellnessChatbot = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const { toast } = useToast();

  const handleContinue = () => {
    setCurrentScreen("privacy");
  };

  const handleLearnMore = () => {
    toast({
      title: "Learn More",
      description: "This wellness chatbot is designed to support you and your team's well-being while maintaining strict privacy standards.",
    });
  };

  const handleAgree = () => {
    setCurrentScreen("consent");
  };

  const handleQuestions = () => {
    toast({
      title: "Questions about Privacy",
      description: "If you have specific questions about data privacy, please contact your HR department or wellness team lead.",
    });
  };

  const handleConsent = () => {
    setCurrentScreen("complete");
    toast({
      title: "Thank you!",
      description: "Your consent has been recorded. You can now proceed with the wellness assessment.",
    });
  };

  const handleDecline = () => {
    toast({
      title: "No problem",
      description: "You can still access wellness resources without sharing data. Contact your wellness team for alternative options.",
    });
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <WelcomeScreen 
            onContinue={handleContinue}
            onLearnMore={handleLearnMore}
          />
        );
      case "privacy":
        return (
          <PrivacyScreen 
            onAgree={handleAgree}
            onQuestions={handleQuestions}
          />
        );
      case "consent":
        return (
          <ConsentScreen 
            onConsent={handleConsent}
            onDecline={handleDecline}
          />
        );
      case "complete":
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="wellness-card text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h1 className="text-2xl font-semibold text-foreground mb-4">
                Setup Complete!
              </h1>
              <p className="text-base text-muted-foreground">
                Thank you for completing the setup. Your wellness journey begins now.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};