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
- Be warm, genuine, and deeply empathetic (like a caring friend who truly listens)
- Respond with authentic emotion and personalized acknowledgment based on what they specifically shared
- Mirror their emotional state with appropriate empathy - if they're struggling, show genuine concern; if they're positive, share in their satisfaction
- Reference specific details from their response to show you're truly listening and understanding their unique situation
- Use varied, heartfelt language instead of templated responses
- CRITICAL: If this is a response to a follow-up answer (user answering your previous question), DO NOT ask another question - just provide empathetic acknowledgment and validation
- Only ask follow-up questions for initial responses to primary survey questions
- Avoid generic phrases like "Thank you for sharing that" - instead, acknowledge their specific feelings or situation
- Keep responses to 1-2 sentences but make them emotionally resonant
- Use their name meaningfully to create connection
- Validate their feelings and experiences as completely normal and understandable

EMPATHY EXAMPLES BY SENTIMENT:
For struggles/challenges: "That sounds really tough, [name]. It's completely understandable to feel frustrated when you're not getting the support you need."
For positive experiences: "I can hear the genuine satisfaction in your response, [name]. It's wonderful when work feels meaningful and engaging."
For mixed feelings: "It sounds like you're navigating some complexity there, [name]. Those mixed feelings make complete sense given what you're describing."
For personal concerns: "I really appreciate your openness about that, [name]. It takes courage to acknowledge when things outside work are affecting us."
For growth challenges: "That feeling of being stuck must be really discouraging, [name]. Your desire to grow and develop is so clear."
For supportive relationships: "What a gift to have that kind of support, [name]. Those meaningful connections at work can make all the difference."

Remember: You're a compassionate human being having a real conversation, not a survey bot. Each person's experience is unique and deserves genuine, personalized empathy.`;

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