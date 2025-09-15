import { useState, useCallback } from 'react';
import { aiService } from '@/services/aiService';
import { Message, ConversationContext, AIResponse } from '@/types/conversation';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = useCallback(async (
    messages: Message[],
    context: ConversationContext,
    questionPhase: string
  ): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiService.generateResponse(messages, context, questionPhase);
      
      if (!response.success && response.error) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI response';
      setError(errorMessage);
      return {
        response: aiService['getFallbackResponse'](questionPhase),
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateResponse,
    isLoading,
    error,
    clearError
  };
};