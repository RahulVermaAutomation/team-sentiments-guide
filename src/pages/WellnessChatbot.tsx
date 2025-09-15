import { useEffect, useState } from "react";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { PrivacyScreen } from "@/components/screens/PrivacyScreen";
import { ConsentScreen } from "@/components/screens/ConsentScreen";
import { ChatInterface } from "@/components/ChatInterface";
import { FeedbackScreen } from "@/components/screens/FeedbackScreen";
import { useToast } from "@/hooks/use-toast";
import { useAI } from "@/hooks/useAI";
import { Message, ConversationContext, QuestionPhase, Screen } from "@/types/conversation";

export const WellnessChatbot = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("chat");
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showResponseOptions, setShowResponseOptions] = useState(false);
  const [currentQuestionType, setCurrentQuestionType] = useState<"scale" | "yesno" | "consent">("scale");
  const [questionResponses, setQuestionResponses] = useState({
    workSatisfaction: "",
    personalConcerns: "",
    growthMetrics: "",
    oneOnOneFrequency: "",
    oneOnOneHelpfulness: "",
  });
  const [additionalFeedback, setAdditionalFeedback] = useState<string | undefined>(undefined);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const { toast } = useToast();
  const { generateResponse, isLoading: aiLoading, error: aiError } = useAI();

  const userName = "Rahul"; // This could be dynamic based on authentication

  // Build conversation context for AI
  const getConversationContext = (): ConversationContext => ({
    userName,
    questionResponses,
    currentPhase: questionPhase,
    consentGiven: questionPhase === "consent" ? "pending" : "given",
    additionalFeedback
  });

  // Initialize chat flow on component mount
  useEffect(() => {
    startChatFlow();
  }, []);

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

  function startChatFlow() {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("assistant", `Hi ${userName}! 👋 How are you doing today?`);
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage("assistant", "Before we begin, I'd like to share some important information about your privacy and how we handle your data.\n\nThis wellness assistant is designed to support you and your team's well-being. We take your privacy seriously and want to be transparent about our data practices.\n\nYour responses will be used to understand team wellness trends and improve our support systems. All data is encrypted and stored securely. You have control over what you share and can stop at any time.\n\nNow, I need your consent to proceed. Please choose one of the following options:");
          setQuestionPhase("consent");
          setCurrentQuestionType("consent");
          setShowResponseOptions(true);
        }, 2000);
      }, 1500);
    }, 1000);
  }

  const handleQuestionResponse = async (response: string) => {
    // Add user response to chat
    addMessage("user", response, "response");
    setShowResponseOptions(false);
    setIsTyping(true);

    // Handle consent responses with static responses for now
    if (questionPhase === "consent") {
      setTimeout(() => {
        setIsTyping(false);
        let responseText = "";
        
        switch (response) {
          case "agree-full":
            responseText = "Great! Thank you for your consent. We will save your full name and email ID for the feedback you have shared. This helps us provide personalized support and follow up on your wellness journey.";
            break;
          case "agree-anonymous":
            responseText = "Thank you for participating anonymously. We will not save your personal information, but your responses will be used for team-level feedback to improve our wellness programs.";
            break;
          case "decline":
            responseText = "Thank you for sharing your feedback. If you want to discuss more about the personal assistant, you can reach out to PSPersonal.Assistant@PS.com for more information.";
            setCurrentScreen("complete");
            return;
        }
        
        addMessage("assistant", responseText);
        
        // After consent, start the wellness questions
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addMessage("assistant", "Now let's begin! I'm here to have a friendly chat and learn a bit about your work experience. I'd love to know - how satisfied are you feeling with your current work and the learning opportunities you have? I'm thinking on a scale where 1 would be really dissatisfied and 5 would be very satisfied.");
            setQuestionPhase("question1");
            setCurrentQuestionType("scale");
            setShowResponseOptions(true);
          }, 2000);
        }, 1500);
      }, 1500);
      return;
    }

    // Update question responses
    switch (questionPhase) {
      case "question1":
        setQuestionResponses(prev => ({ ...prev, workSatisfaction: response }));
        break;
      case "question2":
        setQuestionResponses(prev => ({ ...prev, personalConcerns: response }));
        break;
      case "question3":
        setQuestionResponses(prev => ({ ...prev, growthMetrics: response }));
        break;
      case "question4":
        setQuestionResponses(prev => ({ ...prev, oneOnOneFrequency: response }));
        break;
      case "question5":
        setQuestionResponses(prev => ({ ...prev, oneOnOneHelpfulness: response }));
        break;
    }

    // Use AI to generate empathetic response based on user's answer
    try {
      const context = getConversationContext();
      const currentMessages = [...messages, { 
        id: `temp_${Date.now()}`, 
        role: "user" as const, 
        content: response, 
        timestamp: new Date(),
        type: "response" as const
      }];
      
      const aiResponse = await generateResponse(currentMessages, context, questionPhase);
      
      setIsTyping(false);
      addMessage("assistant", aiResponse.response);
      
      // After AI responds, ask intelligent follow-up or confirmation
      if (questionPhase !== "question5") {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            
            // Analyze the user's previous response to determine appropriate follow-up
            const lastUserMessage = messages[messages.length - 2]?.content.toLowerCase() || "";
            const currentQuestionResponses = questionResponses[questionPhase as keyof typeof questionResponses];
            
            // Check if user seems unsatisfied (low scores, negative keywords, or concerns)
            const seemsUnsatisfied = (
              (typeof currentQuestionResponses === 'string' && ['1', '2'].includes(currentQuestionResponses)) ||
              lastUserMessage.includes('no') ||
              lastUserMessage.includes('not') ||
              lastUserMessage.includes('difficult') ||
              lastUserMessage.includes('problem') ||
              lastUserMessage.includes('issue') ||
              lastUserMessage.includes('concern') ||
              lastUserMessage.includes('worry') ||
              lastUserMessage.includes('stress') ||
              lastUserMessage.includes('struggle') ||
              lastUserMessage.includes('challenge')
            );
            
            if (seemsUnsatisfied) {
              addMessage("assistant", "I hear that this is challenging for you. What do you think would help improve this situation, or is there anything specific we could do to support you better?");
            } else {
              addMessage("assistant", "That sounds really positive! Ready to move on to the next question?");
            }
            
            setWaitingForConfirmation(true);
          }, 1500);
        }, 1000);
      } else {
        // For question 5, wrap up and move to feedback after acknowledgement
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
      
    } catch (error) {
      // Fallback to original logic if AI fails
      setIsTyping(false);
      let responseText = "";
      
      switch (questionPhase) {
        case "question1":
          responseText = parseInt(response) >= 4 
            ? "That's fantastic! What aspects of your work or learning opportunities do you find most fulfilling?"
            : parseInt(response) === 3
            ? "That sounds like a balanced perspective. What might make it even better?"
            : "Thank you for sharing that with me. That must be challenging. What do you think would help improve things?";
          break;
        case "question2":
          responseText = response === "yes" 
            ? "I appreciate you trusting me with that. Is there anything specific that might help, or would you prefer we focus on work-related topics?"
            : "That's good to hear. It's great when personal life feels stable.";
          break;
        case "question3":
          responseText = parseInt(response) >= 4 
            ? "That's excellent! Having that support makes such a difference. What kind of support has been most helpful?"
            : parseInt(response) === 3
            ? "It sounds like there's some support there. What additional support would be most valuable?"
            : "That's tough. Growth support is so important. What would ideal support look like for you?";
          break;
        case "question4":
          responseText = response === "yes" 
            ? "That's great to hear! Regular one-on-ones are so important for staying connected."
            : "I understand. Regular check-ins can be challenging to maintain.";
          break;
        case "question5":
          responseText = `Thank you so much for sharing all of that with me, ${userName}. Your insights are really valuable.`;
          break;
      }
      
      addMessage("assistant", responseText);
      
      // After fallback response, ask intelligent follow-up or confirmation
      if (questionPhase !== "question5") {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            
            // Analyze the user's response for fallback logic too
            const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
            const currentQuestionResponses = questionResponses[questionPhase as keyof typeof questionResponses];
            
            const seemsUnsatisfied = (
              (typeof currentQuestionResponses === 'string' && ['1', '2'].includes(currentQuestionResponses)) ||
              lastUserMessage.includes('no') ||
              lastUserMessage.includes('not') ||
              lastUserMessage.includes('difficult') ||
              lastUserMessage.includes('problem') ||
              lastUserMessage.includes('issue') ||
              lastUserMessage.includes('concern') ||
              lastUserMessage.includes('worry') ||
              lastUserMessage.includes('stress') ||
              lastUserMessage.includes('struggle') ||
              lastUserMessage.includes('challenge')
            );
            
            if (seemsUnsatisfied) {
              addMessage("assistant", "I hear that this is challenging for you. What do you think would help improve this situation, or is there anything specific we could do to support you better?");
            } else {
              addMessage("assistant", "That sounds really positive! Ready to move on to the next question?");
            }
            
            setWaitingForConfirmation(true);
          }, 1500);
        }, 1000);
      }
    }
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

  const handleChatMessage = async (message: string) => {
    addMessage("user", message);
    setIsTyping(true);
    
    // Handle confirmation to move to next question
    if (waitingForConfirmation) {
      const normalizedMessage = message.toLowerCase().trim();
      const wantsToMoveOn = normalizedMessage.includes("next") || 
                           normalizedMessage.includes("move") || 
                           normalizedMessage.includes("continue") ||
                           normalizedMessage.includes("yes") ||
                           normalizedMessage === "ok";
      
      setWaitingForConfirmation(false);
      setIsTyping(false);
      
      if (wantsToMoveOn) {
        addMessage("assistant", "Great! Let's move on to the next question.");
        setTimeout(() => {
          moveToNextQuestion();
        }, 1000);
      } else {
        // User wants to discuss more about current topic
        try {
          const context = getConversationContext();
          const currentMessages = [...messages, { 
            id: `temp_${Date.now()}`, 
            role: "user" as const, 
            content: message, 
            timestamp: new Date() 
          }];
          
          const aiResponse = await generateResponse(currentMessages, context, questionPhase);
          addMessage("assistant", aiResponse.response);
          
          // Ask for confirmation again after responding
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              addMessage("assistant", "Is there anything else about this topic, or shall we move to the next question?");
              setWaitingForConfirmation(true);
            }, 1500);
          }, 1000);
          
        } catch (error) {
          addMessage("assistant", "I understand. Thank you for sharing more about that with me.");
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              addMessage("assistant", "Is there anything else about this topic, or shall we move to the next question?");
              setWaitingForConfirmation(true);
            }, 1500);
          }, 1000);
        }
      }
      return;
    }
    
    try {
      // Get AI response to user's message
      const context = getConversationContext();
      const currentMessages = [...messages, { 
        id: `temp_${Date.now()}`, 
        role: "user" as const, 
        content: message, 
        timestamp: new Date() 
      }];
      
      const aiResponse = await generateResponse(currentMessages, context, questionPhase);
      
      setIsTyping(false);
      addMessage("assistant", aiResponse.response);

      // Move to next question after AI acknowledgment
      if (questionPhase !== "question5") {
        setTimeout(() => {
          moveToNextQuestion();
        }, 1500);
      } else {
        // For question 5, wrap up and move to feedback after acknowledgement
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
    } catch (error) {
      setIsTyping(false);
      addMessage("assistant", "Thank you for sharing that with me. Your feedback is valuable and helps us understand your experience better.");
      
      // Continue with normal flow even if AI fails
      if (questionPhase !== "question5") {
        setTimeout(() => {
          moveToNextQuestion();
        }, 1500);
      }
    }
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
                <h1 className="text-2xl font-semibold text-foreground mb-6">
                  All Done! Thank You!
                </h1>
                <p className="text-base text-foreground leading-relaxed">
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