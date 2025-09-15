import { supabase } from "@/integrations/supabase/client";
import { Message, ConversationContext, AIResponse } from "@/types/conversation";

export class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateResponse(
    messages: Message[], 
    context: ConversationContext,
    questionPhase: string
  ): Promise<AIResponse> {
    try {
      // Convert messages to OpenAI format
      const openAIMessages = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const { data, error } = await supabase.functions.invoke('wellness-chat', {
        body: {
          messages: openAIMessages,
          context,
          questionPhase
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI service returned an error');
      }

      return {
        response: data.response,
        success: true
      };
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        response: this.getFallbackResponse(questionPhase),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getFallbackResponse(questionPhase: string): string {
    const fallbacks = {
      'question1': "Thank you for sharing that with me. Could you tell me more about what aspects of your work experience are most important to you?",
      'question2': "I appreciate you being open about that. It's important to consider all aspects of wellbeing.",
      'question3': "That's helpful to know. Support for growth is such an important part of job satisfaction.",
      'question4': "Thank you for that insight about your one-on-ones.",
      'question5': "I really appreciate all the feedback you've shared with me today.",
      'default': "Thank you for sharing that. I'd love to hear more about your experience."
    };

    return fallbacks[questionPhase as keyof typeof fallbacks] || fallbacks.default;
  }

  // Helper method to analyze sentiment from user responses
  async analyzeSentiment(message: string): Promise<'positive' | 'neutral' | 'negative'> {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'excellent', 'satisfied', 'happy', 'love', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'dissatisfied', 'unhappy', 'hate', 'horrible', 'frustrated'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();