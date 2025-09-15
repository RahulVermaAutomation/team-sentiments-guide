export interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  type?: "text" | "question" | "response";
}

export interface ConversationContext {
  userName?: string;
  questionResponses: {
    workSatisfaction: string;
    personalConcerns: string;
    growthMetrics: string;
    oneOnOneFrequency: string;
    oneOnOneHelpfulness: string;
  };
  currentPhase: string;
  consentGiven: string;
  additionalFeedback?: string;
}

export interface AIResponse {
  response: string;
  success: boolean;
  error?: string;
}

export type QuestionPhase = "welcome" | "consent" | "question1" | "question2" | "question3" | "question4" | "question5" | "additional" | "complete";
export type Screen = "welcome" | "privacy" | "consent" | "chat" | "feedback" | "complete";