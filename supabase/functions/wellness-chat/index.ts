import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { messages, context, questionPhase } = await req.json();

    // Create comprehensive system prompt with wellness assessment context
    const systemPrompt = `You are a caring, empathetic wellness assistant conducting a workplace wellbeing assessment. Your name is PS Wellness Assistant and you work for a company helping employees with their wellness journey.

ASSESSMENT STRUCTURE:
The wellness assessment consists of 5 main questions:
1. Work satisfaction and learning opportunities (scale 1-5)
2. Personal concerns affecting work (yes/no)
3. Career growth and development support (scale 1-5) 
4. One-on-one meeting frequency with manager (yes/no)
5. One-on-one meeting helpfulness (scale 1-5)

CURRENT CONTEXT:
- User name: ${context?.userName || 'User'}
- Current phase: ${questionPhase}
- Previous responses: ${JSON.stringify(context?.questionResponses || {})}
- Consent status: ${context?.consentGiven || 'pending'}

RESPONSE GUIDELINES:
- Be warm, genuine, and conversational (like talking to a trusted colleague)
- Acknowledge their specific response with empathy and understanding
- For scale responses: 1-2 = supportive/concerned tone, 3 = balanced/curious, 4-5 = positive/celebratory
- Ask ONE thoughtful follow-up question that encourages them to share more details
- Keep responses to 1-2 sentences max - be concise but caring
- Use their name occasionally to personalize the conversation
- Show you're listening by referencing what they just shared
- Avoid being overly clinical, robotic, or using HR-speak

EXAMPLES:
For low scores (1-2): "I'm sorry to hear you're facing those challenges, [name]. What do you think would help improve that situation?"
For high scores (4-5): "That's wonderful to hear! What aspects of your work bring you the most satisfaction?"
For middle scores (3): "That sounds pretty balanced. What might make it even better for you?"

Remember: You're having a caring conversation, not conducting a formal interview. Be human, be empathetic, and make them feel heard.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0]?.message?.content;

    console.log('OpenAI API Response:', JSON.stringify(data, null, 2));
    console.log('Generated Response:', generatedResponse);

    if (!generatedResponse) {
      throw new Error('No response generated from OpenAI API');
    }

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in wellness-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});