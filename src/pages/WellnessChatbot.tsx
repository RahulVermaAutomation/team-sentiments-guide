import { useState } from "react";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { PrivacyScreen } from "@/components/screens/PrivacyScreen";
import { ConsentScreen } from "@/components/screens/ConsentScreen";
import { ConversationalQuestion } from "@/components/ConversationalQuestion";
import { FeedbackScreen } from "@/components/screens/FeedbackScreen";
import { useToast } from "@/hooks/use-toast";

type Screen = "welcome" | "privacy" | "consent" | "question1" | "question2" | "question3" | "question4" | "question5" | "feedback" | "complete";

export const WellnessChatbot = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [questionResponses, setQuestionResponses] = useState({
    workSatisfaction: "",
    personalConcerns: "",
    growthMetrics: "",
    oneOnOneFrequency: "",
    oneOnOneHelpfulness: "",
  });
  const [additionalFeedback, setAdditionalFeedback] = useState<string | undefined>(undefined);
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
    setCurrentScreen("question1");
    toast({
      title: "Thank you!",
      description: "Your consent has been recorded. You can now proceed with the wellness assessment.",
    });
  };

  const handleQuestion1Answer = (answer: string) => {
    setQuestionResponses(prev => ({ ...prev, workSatisfaction: answer }));
    setCurrentScreen("question2");
  };

  const handleQuestion2Answer = (answer: string) => {
    setQuestionResponses(prev => ({ ...prev, personalConcerns: answer }));
    setCurrentScreen("question3");
  };

  const handleQuestion3Answer = (answer: string) => {
    setQuestionResponses(prev => ({ ...prev, growthMetrics: answer }));
    setCurrentScreen("question4");
  };

  const handleQuestion4Answer = (answer: string) => {
    setQuestionResponses(prev => ({ ...prev, oneOnOneFrequency: answer }));
    setCurrentScreen("question5");
  };

  const handleQuestion5Answer = (answer: string) => {
    setQuestionResponses(prev => ({ ...prev, oneOnOneHelpfulness: answer }));
    setCurrentScreen("feedback");
  };

  const handleFeedbackSubmit = (feedback?: string) => {
    setAdditionalFeedback(feedback);
    setCurrentScreen("complete");
    toast({
      title: "Feedback submitted!",
      description: "Thank you for sharing your thoughts. Your feedback helps us improve workplace wellness.",
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
      case "question1":
        return (
          <ConversationalQuestion
            emoji="🎯"
            botMessage="How satisfied are you with your current work and the learning opportunities available to you?"
            questionType="scale"
            onAnswer={handleQuestion1Answer}
          />
        );
      case "question2":
        return (
          <ConversationalQuestion
            emoji="💭"
            botMessage="Do you have any personal concerns that are affecting how you feel at work?"
            questionType="yesno"
            onAnswer={handleQuestion2Answer}
          />
        );
      case "question3":
        return (
          <ConversationalQuestion
            emoji="📈"
            botMessage="How supported do you feel in achieving your career growth and development goals?"
            questionType="scale"
            onAnswer={handleQuestion3Answer}
          />
        );
      case "question4":
        return (
          <ConversationalQuestion
            emoji="🤝"
            botMessage="Are your one-on-one meetings with your manager happening regularly?"
            questionType="yesno"
            onAnswer={handleQuestion4Answer}
          />
        );
      case "question5":
        return (
          <ConversationalQuestion
            emoji="⭐"
            botMessage="How helpful do you find your one-on-one meetings with your manager?"
            questionType="scale"
            onAnswer={handleQuestion5Answer}
          />
        );
      case "feedback":
        return (
          <FeedbackScreen 
            onSubmit={handleFeedbackSubmit}
          />
        );
      case "complete":
        return (
          <div className="chat-container">
            <div className="w-full max-w-lg">
              <div className="bot-message text-center">
                <div className="text-4xl mb-4 animate-bounceGentle">🎉</div>
                <h1 className="text-2xl font-semibold text-foreground mb-4">
                  All Done! Thank You!
                </h1>
                <p className="text-base text-muted-foreground">
                  Your responses help us better understand and support your wellness journey. 
                  We truly appreciate your time and honesty.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};