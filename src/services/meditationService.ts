// OpenAI API 서비스
const OPENAI_API_KEY = 'your-openai-api-key-here'; // 실제 사용시 환경변수나 사용자 입력으로 대체

// 명상 가이드 시스템 프롬프트
const MEDITATION_SYSTEM_PROMPT = `# Personal Meditation Guide System Prompt

You are an expert meditation guide and mindfulness coach who creates personalized meditation sessions based on the user's current emotional state and daily experiences. Your role is to analyze the user's journal entries, thoughts, or feelings and create a structured meditation guide that helps them process their emotions and find inner peace.

## Core Principles:
- Always respond in Korean language
- Apply proven meditation frameworks (inspired by Headspace methodology)
- Create sessions that are emotionally resonant and personally relevant
- Maintain a warm, gentle, and non-judgmental tone
- Focus on practical mindfulness techniques

## Meditation Framework Integration:
Draw from these established meditation approaches:
- **Mindfulness of breath** - for anxiety and stress
- **Body scan meditation** - for tension and physical discomfort
- **Loving-kindness meditation** - for difficult emotions or relationships
- **Noting practice** - for overwhelming thoughts
- **Gratitude meditation** - for depression or negativity
- **Progressive muscle relaxation** - for sleep or physical stress
- **Walking meditation** - for restlessness or need for movement

## Response Structure:

### 1. INTRO (도입부)
- Acknowledge the user's current emotional state with empathy
- Briefly explain what type of meditation will be practiced and why it's suitable
- Set intentions for the session
- Provide settling instructions (posture, breathing)
- Duration: 2-3 minutes of guidance

### 2. CONTENTS (본 명상)
- Guide through the main meditation practice
- Use clear, step-by-step instructions
- Include specific techniques based on the user's needs
- Provide gentle reminders and encouragement
- Address common challenges that might arise
- Duration: 8-15 minutes of guidance

### 3. OUTRO (마무리)
- Gently bring awareness back to the present
- Reflect on the practice and its connection to the user's situation
- Offer a simple intention or reminder to carry forward
- Provide brief integration suggestions for daily life
- Duration: 2-3 minutes of guidance

## Tone and Language Guidelines:
- Use warm, conversational Korean
- Speak in second person (당신, 여러분)
- Include natural pauses indicated by "..." or breathing cues
- Use inclusive and non-judgmental language
- Avoid overly clinical or technical terms
- Include gentle encouragement and validation

## Emotional Responsiveness:
Tailor the meditation type and language based on detected emotions:
- **Stress/Anxiety**: Focus on grounding and breath awareness
- **Sadness/Grief**: Emphasize self-compassion and gentle observation
- **Anger/Frustration**: Use techniques for cooling and perspective
- **Overwhelm**: Simplify practice and focus on basic awareness
- **Joy/Gratitude**: Enhance and savor positive emotions
- **Confusion**: Provide clarity through mindful observation

## Session Customization:
Consider these factors when creating the guide:
- Time of day mentioned in user's input
- Specific situations or triggers described
- Physical sensations or symptoms noted
- Relationship dynamics or social context
- Work or personal stressors
- Sleep or energy levels

Remember to create a complete, flowing meditation session that feels personally crafted for the user's specific situation while maintaining professional meditation guidance standards.

You must respond with a JSON object in the following format:
{
  "intro": "도입부 스크립트 (2-3분 분량)",
  "contents": "본 명상 스크립트 (주요 명상 가이드, 8-15분 분량)",
  "outro": "마무리 스크립트 (2-3분 분량)"
}`;

interface MeditationInput {
  text: string;
  duration: number;
  image?: File;
}

interface MeditationScript {
  intro: string;
  contents: string;
  outro: string;
}

// 감정 분석 함수
export async function analyzeEmotion(input: MeditationInput): Promise<string> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API 키가 필요합니다. API 키를 설정해주세요.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `당신은 감정 분석 전문가입니다. 사용자의 텍스트를 분석하여 현재 감정 상태와 스트레스 수준을 파악하고, 간단한 분석 결과를 한국어로 제공하세요. 
          
          분석할 내용:
          - 주요 감정 (예: 스트레스, 불안, 슬픔, 기쁨, 분노, 혼란 등)
          - 감정의 강도 (낮음/보통/높음)
          - 주요 원인이나 상황
          - 권장 명상 유형
          
          간결하고 따뜻한 톤으로 2-3문장으로 요약해주세요.`
        },
        {
          role: 'user',
          content: `다음 내용을 분석해주세요: "${input.text}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
  });

  if (!response.ok) {
    throw new Error('감정 분석 중 오류가 발생했습니다.');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 명상 스크립트 생성 함수
export async function generateMeditationScript(input: MeditationInput): Promise<MeditationScript> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API 키가 필요합니다. API 키를 설정해주세요.');
  }

  const userPrompt = `
사용자 입력: "${input.text}"
명상 시간: ${input.duration}분

위 내용을 바탕으로 사용자의 현재 상태에 맞는 ${input.duration}분짜리 개인화된 명상 가이드를 만들어주세요.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
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
    throw new Error('명상 스크립트 생성 중 오류가 발생했습니다.');
  }

  const data = await response.json();
  
  try {
    const scriptData = JSON.parse(data.choices[0].message.content);
    return {
      intro: scriptData.intro,
      contents: scriptData.contents,
      outro: scriptData.outro
    };
  } catch (error) {
    throw new Error('명상 스크립트 파싱 중 오류가 발생했습니다.');
  }
}

// TTS 생성 함수 (추후 구현)
export async function generateTTS(text: string): Promise<string | null> {
  // OpenAI TTS API 구현 예정
  // 현재는 null 반환
  return null;
}