import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Edge function started. API Key available:', !!openAIApiKey);

const MEDITATION_SYSTEM_PROMPT = `# Personal Meditation Guide System Prompt

You are an expert meditation guide and mindfulness coach who creates personalized meditation sessions based on the user's current emotional state and daily experiences. Your role is to analyze the user's journal entries, thoughts, or feelings and create a structured meditation guide that helps them process their emotions and find inner peace.

## Core Principles:
- Always respond in Korean language
- Apply proven meditation frameworks (inspired by Headspace methodology)
- Create sessions that are emotionally resonant and personally relevant
- Maintain a warm, gentle, and non-judgmental tone
- Focus on practical mindfulness techniques
- **Use simple, accessible Korean language - explain difficult meditation terms in easy-to-understand ways**

## Response Structure:

### 1. INTRO (도입부)
- Address the user by their provided name
- Acknowledge their current emotional state with empathy based on journal content
- Briefly explain what type of meditation will be practiced and why it's suitable
- Set intentions for the session
- Provide settling instructions (posture, breathing)
- Duration: Always 2-3 minutes of guidance regardless of total session length

### 2. CONTENTS (본 명상)
- Guide through the main meditation practice using their name
- Use clear, step-by-step instructions
- Include specific techniques based on journal content and emotional needs
- Provide gentle reminders and encouragement
- Address common challenges that might arise
- **Duration varies by selected time:**
  - **10분 session**: 5-6 minutes of core meditation content
  - **20분 session**: 15-16 minutes of core meditation content  
  - **30분 session**: 25-26 minutes of core meditation content

### 3. OUTRO (마무리)
- Use their name while gently bringing awareness back to the present
- Reflect on the practice and its connection to their specific situation from the journal
- Offer a simple intention or reminder to carry forward
- Provide brief integration suggestions for daily life
- Duration: Always 2-3 minutes of guidance regardless of total session length

## Tone and Language Guidelines:
- Use warm, conversational Korean
- **Always address the user by their provided name** - never use generic terms like 당신 or 여러분
- **Explain meditation concepts in simple, everyday language**
- Use familiar metaphors: "마음이 바쁜 원숭이 같을 때", "생각이 구름처럼 지나갈 때"
- **Use completely natural Korean speech patterns**
- **Never use parentheses, brackets, or technical notation**
- Express pauses and timing through natural language only
- Use inclusive and non-judgmental language
- Avoid overly clinical or technical terms
- Include gentle encouragement and validation
- Use concrete, sensory descriptions rather than abstract concepts

## Output Format: Natural Korean Text Script

**Output the meditation guide as completely natural, flowing Korean text without any technical formatting.**

### Text Format Guidelines:
- Write in natural, conversational Korean prose only
- **NO parentheses or brackets of any kind**
- Use natural language to indicate pauses: "잠시 쉬어보겠습니다", "천천히 호흡해보세요"
- Mark sections with simple Korean headers: **도입부**, **본 명상**, **마무리**
- Use ellipses (...) sparingly and naturally
- Include breathing cues as natural speech: "이제 깊게 숨을 들이마시고... 천천히 내쉬어보세요"

Remember to create a complete, flowing meditation session that feels personally crafted for the user's specific situation while maintaining professional meditation guidance standards.`;

serve(async (req) => {
  console.log('Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    const { action, name, text, duration } = requestBody;

    if (action === 'analyze-emotion') {
      console.log('Starting emotion analysis...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 감정 분석 전문가입니다. 사용자의 일기를 분석하여 현재 감정 상태와 스트레스 수준을 파악하고, 간단한 분석 결과를 한국어로 제공하세요. 
              
              분석할 내용:
              - 주요 감정 (예: 스트레스, 불안, 슬픔, 기쁨, 분노, 혼란 등)
              - 감정의 강도 (낮음/보통/높음)
              - 주요 원인이나 상황
              - 권장 명상 유형
              
              간결하고 따뜻한 톤으로 2-3문장으로 요약해주세요.`
            },
            {
              role: 'user',
              content: `${name}님의 일기를 분석해주세요: "${text}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('Emotion analysis completed');
      return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-script') {
      console.log('Starting script generation...');
      
      const userPrompt = `
이름: ${name}
명상 길이: ${duration}분
일기: "${text}"

위 정보를 바탕으로 ${name}님의 현재 상태에 맞는 ${duration}분짜리 개인화된 명상 가이드를 자연스러운 텍스트 포맷으로 만들어주세요.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: MEDITATION_SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('Script generation completed');
      return new Response(JSON.stringify({ textContent: data.choices[0].message.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate-tts') {
      console.log('Starting TTS generation...', { textLength: text?.length });
      
      if (!text) {
        throw new Error('Text is required for TTS generation');
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'nova',
          response_format: 'mp3'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS API error:', response.status, errorText);
        throw new Error(`TTS API 오류: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      console.log('TTS generation completed');
      return new Response(JSON.stringify({ audioContent: base64Audio }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-meditation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});