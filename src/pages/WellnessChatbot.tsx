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
  const [waitingForFollowUp, setWaitingForFollowUp] = useState(false);
  const [closeAfterFollowUp, setCloseAfterFollowUp] = useState(false);
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
  // Ensure AI responses don't mix transition to next question
  const sanitizeAssistantText = (text: string): string => {
    if (!text) return text;
    const patterns = [
      /(moving on to the next question[:,]?)/i,
      /(move on to the next question[:,]?)/i,
      /(moving on[:,]?)/i,
      /(next question[:,]?)/i,
      /(let'?s move on[:,]?)/i,
      /(continue (to|with)[:,]?)/i,
      /(now let'?s (talk|move)[:,]?)/i,
    ];
    let cutIndex = -1;
    for (const p of patterns) {
      const m = text.match(p);
      if (m && m.index !== undefined) {
        cutIndex = cutIndex === -1 ? m.index : Math.min(cutIndex, m.index);
      }
    }
    let cleaned = cutIndex >= 0 ? text.slice(0, cutIndex) : text;
    cleaned = cleaned.trim();
    if (!cleaned) cleaned = "Thank you for sharing that.";
    return cleaned;
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
      addMessage("assistant", sanitizeAssistantText(aiResponse.response));
      
      // After AI responds, determine next action based on satisfaction level
      if (questionPhase !== "question5") {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);

            // Analyze satisfaction and whether AI already asked a question
            const userResponse = response.toLowerCase();
            const isLowScore = ['1', '2'].includes(response);
            const seemsUnsatisfied = isLowScore ||
              userResponse.includes('no') ||
              userResponse.includes('not') ||
              userResponse.includes('difficult') ||
              userResponse.includes('problem') ||
              userResponse.includes('issue') ||
              userResponse.includes('concern') ||
              userResponse.includes('worry') ||
              userResponse.includes('stress') ||
              userResponse.includes('struggle') ||
              userResponse.includes('challenge');

            const aiText = aiResponse.response || '';
            const aiAskedQuestion = aiText.includes('?');
            const askedMoveOn = /(move (on|to the next)|next question|continue|proceed|ready to move)/i.test(aiText);
            const askedFollowUp = /(what|how|could you|would you|tell me more|share more|help|support|improve)/i.test(aiText);

            if (seemsUnsatisfied) {
              if (aiAskedQuestion) {
                // Let the AI's question stand; decide which state to wait for
                if (askedMoveOn) {
                  setWaitingForConfirmation(true);
                } else {
                  setWaitingForFollowUp(true);
                }
              } else {
                addMessage("assistant", "I hear that this is challenging for you. What do you think would help improve this situation, or is there anything specific we could do to support you better?");
                setWaitingForFollowUp(true);
              }
            } else {
              if (aiAskedQuestion) {
                // If AI already prompted to move on, just wait for confirmation
                if (askedMoveOn) {
                  setWaitingForConfirmation(true);
                } else if (askedFollowUp) {
                  setWaitingForFollowUp(true);
                } else {
                  setWaitingForConfirmation(true);
                }
              } else {
                addMessage("assistant", "That sounds really positive! Ready to move on to the next question?");
                setWaitingForConfirmation(true);
              }
            }
          }, 1500);
        }, 1000);
      } else {
        // For question 5, ensure we wait for ANY AI follow-up (if any) before closing
        const aiText = aiResponse.response || '';
        const aiAskedQuestion = aiText.includes('?');
        const askedMoveOn = /(move (on|to the next)|next question|continue|proceed|ready to move)/i.test(aiText);
        const askedFollowUp = /(what|how|could you|would you|tell me more|share more|help|support|improve)/i.test(aiText);

        // If AI asked a question (of any kind) that is not a navigation prompt, wait for the employee's reply
        if (aiAskedQuestion && !askedMoveOn) {
          setWaitingForFollowUp(true);
          setCloseAfterFollowUp(true);
        } else {
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              addMessage("assistant", "Thank you for your valuable time and input. Your feedback has been captured for further review.");
              setCurrentScreen("complete");
            }, 2000);
          }, 1500);
        }
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
    
    // Handle follow-up question responses
    if (waitingForFollowUp) {
      setWaitingForFollowUp(false);
      
      // Do not call AI again here to avoid extra follow-up questions.
      setIsTyping(false);

      const importanceReason = (() => {
        switch (questionPhase) {
          case "question1":
            return "Understanding what drives your satisfaction helps us align work and learning opportunities better for you.";
          case "question2":
            return "Being aware of personal factors helps us offer the right support and flexibility when needed.";
          case "question3":
            return "Insights on growth support guide us to improve coaching, mentorship, and resources for your development.";
          case "question4":
            return "Clarity on one-on-one rhythms helps ensure consistent feedback, alignment, and care.";
          case "question5":
            return "Your perspective on usefulness helps us make those conversations more impactful.";
          default:
            return "Your perspective helps us support you in meaningful and practical ways.";
        }
      })();

      addMessage("assistant", `Thank you for sharing that, ${userName}. ${importanceReason}`);

      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          if (questionPhase === "question5" || closeAfterFollowUp) {
            addMessage("assistant", "Your feedback has been captured for further review. Thank you for your valuable time and input.");
            setCloseAfterFollowUp(false);
            setCurrentScreen("complete");
          } else {
            addMessage("assistant", "Your feedback has been captured for further review. Ready to move on to the next question?");
            setWaitingForConfirmation(true);
          }
        }, 1500);
      }, 1000);

      return;
    }
    
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
          addMessage("assistant", sanitizeAssistantText(aiResponse.response));
          
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
      addMessage("assistant", sanitizeAssistantText(aiResponse.response));

      // Move to next question after AI acknowledgment
      if (questionPhase !== "question5") {
        setTimeout(() => {
          moveToNextQuestion();
        }, 1500);
      } else {
        // For question 5, close the session after acknowledgement
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addMessage("assistant", "Thank you for your valuable time and input. Your feedback has been captured for further review.");
            setCurrentScreen("complete");
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