import { useState } from "react";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { PrivacyScreen } from "@/components/screens/PrivacyScreen";
import { ConsentScreen } from "@/components/screens/ConsentScreen";
import { ChatInterface } from "@/components/ChatInterface";
import { FeedbackScreen } from "@/components/screens/FeedbackScreen";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  type?: "text" | "question" | "response";
}

type Screen = "welcome" | "privacy" | "consent" | "chat" | "feedback" | "complete";
type QuestionPhase = "welcome" | "question1" | "question2" | "question3" | "question4" | "question5" | "additional" | "complete";

export const WellnessChatbot = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showResponseOptions, setShowResponseOptions] = useState(false);
  const [currentQuestionType, setCurrentQuestionType] = useState<"scale" | "yesno">("scale");
  const [questionResponses, setQuestionResponses] = useState({
    workSatisfaction: "",
    personalConcerns: "",
    growthMetrics: "",
    oneOnOneFrequency: "",
    oneOnOneHelpfulness: "",
  });
  const [additionalFeedback, setAdditionalFeedback] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const userName = "Rahul"; // This could be dynamic based on authentication

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
    setCurrentScreen("chat");
    toast({
      title: "Thank you!",
      description: "Your consent has been recorded. You can now proceed with the wellness assessment.",
    });
    setTimeout(() => {
      startChatFlow();
    }, 1000);
  };

  // Chat flow management
  const addMessage = (role: "assistant" | "user", content: string, type?: "text" | "question" | "response") => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startChatFlow = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("assistant", `Hi ${userName}! 👋 How are you doing today? I hope everything's going well for you!`);
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage("assistant", "I'm here to have a friendly chat and learn a bit about your work experience. I'd love to know - how satisfied are you feeling with your current work and the learning opportunities you have? I'm thinking on a scale where 1 would be really dissatisfied and 5 would be very satisfied.");
          setQuestionPhase("question1");
          setCurrentQuestionType("scale");
          setShowResponseOptions(true);
        }, 2000);
      }, 1500);
    }, 1000);
  };

  const handleQuestionResponse = (response: string) => {
    // Add user response to chat
    addMessage("user", response, "response");
    setShowResponseOptions(false);
    setIsTyping(true);

    // AI responds based on user input and asks for more details
    setTimeout(() => {
      setIsTyping(false);
      let responseText = "";
      
      switch (questionPhase) {
        case "question1":
          setQuestionResponses(prev => ({ ...prev, workSatisfaction: response }));
          responseText = parseInt(response) >= 4 
            ? "That's fantastic! What aspects of your work or learning opportunities do you find most fulfilling?"
            : parseInt(response) === 3
            ? "That sounds like a balanced perspective. What might make it even better?"
            : "Thank you for sharing that with me. That must be challenging. What do you think would help improve things?";
          break;

        case "question2":
          setQuestionResponses(prev => ({ ...prev, personalConcerns: response }));
          responseText = response === "yes" 
            ? "I appreciate you trusting me with that. Is there anything specific that might help, or would you prefer we focus on work-related topics?"
            : "That's good to hear. It's great when personal life feels stable.";
          break;

        case "question3":
          setQuestionResponses(prev => ({ ...prev, growthMetrics: response }));
          responseText = parseInt(response) >= 4 
            ? "That's excellent! Having that support makes such a difference. What kind of support has been most helpful?"
            : parseInt(response) === 3
            ? "It sounds like there's some support there. What additional support would be most valuable?"
            : "That's tough. Growth support is so important. What would ideal support look like for you?";
          break;

        case "question4":
          setQuestionResponses(prev => ({ ...prev, oneOnOneFrequency: response }));
          responseText = response === "yes" 
            ? "That's great to hear! Regular one-on-ones are so important for staying connected."
            : "I understand. Regular check-ins can be challenging to maintain.";
          break;

        case "question5":
          setQuestionResponses(prev => ({ ...prev, oneOnOneHelpfulness: response }));
          responseText = `Thank you so much for sharing all of that with me, ${userName}. Your insights are really valuable.`;
          break;
      }
      
      addMessage("assistant", responseText);
      
      // Allow user to add more information before moving to next question
      if (questionPhase !== "question5") {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addMessage("assistant", "Is there anything else you'd like to add about this, or shall we move on to the next question?");
          }, 1500);
        }, 1000);
      } else {
        // After question 5, go to feedback
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addMessage("assistant", "Before we wrap up, is there anything else on your mind that you'd like to share? It could be anything - suggestions, concerns, positive feedback, or just thoughts about your work experience.");
            setQuestionPhase("additional");
            setCurrentScreen("feedback");
          }, 2000);
        }, 1500);
      }
    }, 1500);
  };

  const moveToNextQuestion = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      switch (questionPhase) {
        case "question1":
          addMessage("assistant", "I want to make sure you're doing well overall. Do you have any personal concerns that might be affecting how you feel at work? It's completely okay if you'd rather not share details.");
          setQuestionPhase("question2");
          setCurrentQuestionType("yesno");
          setShowResponseOptions(true);
          break;
          
        case "question2":
          addMessage("assistant", "One more thing I'm curious about - how supported do you feel in achieving your career growth and development goals? Again, thinking 1 to 5, where 1 is not supported at all and 5 is fully supported.");
          setQuestionPhase("question3");
          setCurrentQuestionType("scale");
          setShowResponseOptions(true);
          break;
          
        case "question3":
          addMessage("assistant", "Are your one-on-one meetings with your manager happening regularly?");
          setQuestionPhase("question4");
          setCurrentQuestionType("yesno");
          setShowResponseOptions(true);
          break;
          
        case "question4":
          addMessage("assistant", "How helpful do you find your one-on-one meetings with your manager? On a scale of 1 to 5, where 1 is not helpful at all and 5 is extremely helpful.");
          setQuestionPhase("question5");
          setCurrentQuestionType("scale");
          setShowResponseOptions(true);
          break;
      }
    }, 1500);
  };

  const handleChatMessage = (message: string) => {
    addMessage("user", message);
    setIsTyping(true);
    
    // AI acknowledges and asks if user wants to continue
    setTimeout(() => {
      setIsTyping(false);
      addMessage("assistant", `Thank you for sharing that, ${userName}. I really appreciate your openness. Would you like to move on to the next question now?`);
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
    }, 1500);
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
      case "chat":
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleChatMessage}
            isTyping={isTyping}
            showResponseOptions={showResponseOptions}
            responseOptions={{
              type: currentQuestionType,
              onResponse: handleQuestionResponse
            }}
            userName={userName}
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