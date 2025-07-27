import { supabase } from "@/integrations/supabase/client";

interface MeditationInput {
  name: string;
  text: string;
  duration: number;
  image?: File;
}

interface MeditationScript {
  textContent: string;
}

// 고급 감정 분석 함수 - OpenAI API 우선, 실패 시 로컬 분석
export async function analyzeEmotion(input: MeditationInput): Promise<string> {
  try {
    // OpenAI API로 감정 분석 시도
    const { data, error } = await supabase.functions.invoke('generate-meditation', {
      body: {
        action: 'analyze-emotion',
        name: input.name,
        text: input.text,
        duration: input.duration
      }
    });

    if (!error && data?.result) {
      console.log('OpenAI API 감정 분석 성공');
      return data.result;
    }

    console.warn('OpenAI API 감정 분석 실패, 로컬 분석 사용:', error);

  } catch (error) {
    console.warn('API 호출 실패, 로컬 분석 사용:', error);
  }

  // API 실패 시 로컬 감정 분석
  const text = input.text.toLowerCase();
  const stressKeywords = ['스트레스', '힘들', '어려운', '압박', '불안', '바쁜', '피곤', '지친'];
  const sadnessKeywords = ['슬프', '우울', '외로운', '허무', '실망', '좌절'];
  const joyKeywords = ['기쁘', '행복', '좋은', '즐거운', '만족', '성취', '감사'];
  const confusionKeywords = ['혼란', '모르겠', '복잡', '갈피', '고민', '선택'];
  const reflectionKeywords = ['생각', '성찰', '깨달음', '회고', '되돌아', '돌아보'];

  const emotionScores = {
    stress: stressKeywords.filter(k => text.includes(k)).length,
    sadness: sadnessKeywords.filter(k => text.includes(k)).length,
    joy: joyKeywords.filter(k => text.includes(k)).length,
    confusion: confusionKeywords.filter(k => text.includes(k)).length,
    reflection: reflectionKeywords.filter(k => text.includes(k)).length
  };

  const dominantEmotion = Object.entries(emotionScores)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0] || 'reflection';

  const messages = {
    stress: `${input.name}님, 오늘 하루 많은 스트레스를 받으셨나요? 깊은 호흡과 함께하는 이완 명상으로 마음의 평안을 되찾아보세요.`,
    sadness: `${input.name}님, 마음이 무거우시군요. 따뜻한 자비와 함께하는 치유 명상으로 마음을 위로해드리겠습니다.`,
    joy: `${input.name}님, 기쁜 일이 있으셨나요? 이 행복한 에너지를 더욱 깊이 느끼고 온몸으로 음미해보세요.`,
    confusion: `${input.name}님, 복잡한 마음이 드시나요? 명상을 통해 내면의 지혜와 명확함을 찾아보겠습니다.`,
    reflection: `${input.name}님, 자신을 돌아보는 소중한 시간을 가지고 싶으시군요. 깊은 성찰과 통찰의 명상을 함께해보세요.`
  };

  return messages[dominantEmotion as keyof typeof messages] || messages.reflection;
}

// 명상 스크립트 생성 함수 - OpenAI API 우선, 실패 시 고급 로컬 템플릿
export async function generateMeditationScript(input: MeditationInput): Promise<MeditationScript> {
  console.log('명상 스크립트 생성 시작...', { duration: input.duration });
  
  try {
    // OpenAI API로 스크립트 생성 시도
    const { data, error } = await supabase.functions.invoke('generate-meditation', {
      body: {
        action: 'generate-script',
        name: input.name,
        text: input.text,
        duration: input.duration
      }
    });

    if (!error && data?.textContent) {
      console.log('OpenAI API 스크립트 생성 성공');
      return { textContent: data.textContent };
    }

    console.warn('OpenAI API 스크립트 생성 실패, 로컬 템플릿 사용:', error);

  } catch (error) {
    console.warn('API 호출 실패, 로컬 템플릿 사용:', error);
  }

  // API 실패 시 로컬 고급 템플릿 사용
  console.log('로컬 고급 템플릿 사용');
  
  // 감정 분석을 위한 키워드 분석
  const text = input.text.toLowerCase();
  
  // 사용자 텍스트에서 핵심 키워드 추출
  const stressKeywords = ['스트레스', '힘들', '어려운', '압박', '불안', '바쁜', '피곤', '지친'];
  const sadnessKeywords = ['슬프', '우울', '외로운', '허무', '실망', '좌절'];
  const joyKeywords = ['기쁘', '행복', '좋은', '즐거운', '만족', '성취', '감사'];
  const confusionKeywords = ['혼란', '모르겠', '복잡', '갈피', '고민', '선택'];
  const reflectionKeywords = ['생각', '성찰', '깨달음', '회고', '되돌아', '돌아보'];
  
  // 감정별 점수 계산
  const emotionScores = {
    stress: stressKeywords.filter(k => text.includes(k)).length,
    sadness: sadnessKeywords.filter(k => text.includes(k)).length,
    joy: joyKeywords.filter(k => text.includes(k)).length,
    confusion: confusionKeywords.filter(k => text.includes(k)).length,
    reflection: reflectionKeywords.filter(k => text.includes(k)).length
  };
  
  const dominantEmotion = Object.entries(emotionScores)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0] || 'reflection';
  
  // 고급 개인화 템플릿
  const templates = {
    stress: {
      intro: `안녕하세요, ${input.name}님. 오늘 하루 많은 스트레스와 압박을 받으셨나요? 지금부터 ${input.duration}분 동안 그 무거운 짐을 내려놓고 마음의 평안을 되찾아보겠습니다. 편안한 의자에 등을 기대고 앉거나 누우셔도 좋습니다. 두 눈을 부드럽게 감고, 깊게 숨을 들이마시며 어깨의 긴장을 풀어보세요. 지금 이 순간, ${input.name}님은 안전하고 평온한 공간에 있습니다.`,
      core: `이제 호흡에 온전히 집중해보겠습니다. 코로 천천히 숨을 들이마시면서 배가 부드럽게 올라오는 것을 느껴보세요. 그리고 입으로 천천히 내쉬면서 모든 스트레스와 걱정을 함께 내보내세요. ${input.name}님의 목과 어깨, 턱의 긴장을 의식적으로 풀어주세요. 마음속에 떠오르는 걱정들은 마치 구름이 하늘을 지나가듯 자연스럽게 흘려보내주세요. 지금 이 순간의 고요함과 평화로움을 온몸으로 느껴보세요. 숨을 들이마실 때마다 평온함이, 내쉴 때마다 긴장이 사라집니다.`,
      outro: `${input.name}님, 이제 깊은 휴식을 취하셨습니다. 이 평온한 상태를 마음에 새겨두세요. 언제든 스트레스를 느낄 때는 이 호흡법으로 돌아와 마음의 중심을 되찾으시기 바랍니다. 이제 천천히 손가락과 발가락을 움직여보고, 준비가 되면 부드럽게 눈을 뜨세요. 새롭게 충전된 에너지와 함께 남은 하루를 평안하게 보내시길 바랍니다.`
    },
    sadness: {
      intro: `${input.name}님, 안녕하세요. 오늘 마음이 많이 무거우신가요? 슬픔과 우울한 감정도 우리 삶의 자연스러운 일부입니다. 지금부터 ${input.duration}분 동안 그 감정을 따뜻하게 품어주고, 마음에 위로와 치유를 선사해보겠습니다. 편안한 자세로 앉아 두 손을 가슴에 올려보세요. 심장이 뛰는 소리를 느끼며, 살아있음에 감사해보세요.`,
      core: `${input.name}님의 슬픔을 거부하지 마세요. 그 감정을 마치 오랜 친구를 대하듯 따뜻하게 맞이해주세요. 숨을 깊이 들이마시면서 마음속 상처받은 부분에 사랑과 자비를 보내보세요. 내쉴 때는 슬픔이 조금씩 가벼워지는 것을 느껴보세요. 지금 이 순간 ${input.name}님은 혼자가 아닙니다. 온 우주가 당신을 지지하고 사랑하고 있습니다. 가슴 깊은 곳에서 따뜻한 빛이 서서히 퍼져나가는 것을 상상해보세요. 그 빛이 모든 슬픔을 부드럽게 감싸안아줍니다.`,
      outro: `${input.name}님, 슬픔 속에서도 자신을 돌봐주신 것에 감사드립니다. 이 따뜻한 자비의 감정을 기억해주세요. 슬플 때마다 자신에게 사랑을 보내는 이 연습을 떠올리시기 바랍니다. 천천히 눈을 뜨시고, 오늘 하루도 자신을 사랑하며 보내세요. 당신은 소중하고 사랑받을 자격이 있는 존재입니다.`
    },
    joy: {
      intro: `${input.name}님, 안녕하세요! 오늘 기쁘고 행복한 일이 있으셨나요? 이 아름다운 감정을 더욱 깊이 음미하고 온몸으로 느껴보는 ${input.duration}분의 시간을 가져보겠습니다. 편안히 앉아서 입가에 자연스러운 미소를 지어보세요. 이 기쁨이 어디서 오는지 마음속 깊이 느껴보세요.`,
      core: `${input.name}님의 가슴 속에서 따뜻한 기쁨이 퍼져나가는 것을 느껴보세요. 숨을 들이마실 때마다 이 행복감이 온몸 구석구석까지 전해지는 것을 상상해보세요. 이 순간의 감사함을 충분히 느껴보세요. 지금 이 기쁨을 선사해준 모든 것들에 고마움을 표현해보세요. 이 행복한 에너지가 ${input.name}님 주변의 모든 사람들에게도 전해져 세상을 더 밝게 만들고 있다고 상상해보세요. 이 순간을 마음에 깊이 새겨두세요.`,
      outro: `${input.name}님, 이 기쁨의 순간을 마음에 간직해주세요. 힘든 일이 있을 때마다 오늘의 이 행복했던 감정을 떠올리시기 바랍니다. 천천히 눈을 뜨시고, 이 긍정적인 에너지로 주변 사람들에게도 기쁨을 나누어주세요. 당신의 행복이 세상을 더 아름답게 만듭니다.`
    },
    confusion: {
      intro: `${input.name}님, 안녕하세요. 지금 마음이 복잡하고 혼란스러우신가요? 선택의 기로에서 갈등하고 계신가요? 괜찮습니다. 이런 혼란스러운 시기야말로 내면의 지혜와 만날 수 있는 소중한 기회입니다. ${input.duration}분 동안 마음을 고요히 가라앉혀 명확함을 찾아보겠습니다. 편안히 앉아 두 손을 무릎에 올리고, 깊게 숨을 쉬어보세요.`,
      core: `${input.name}님, 지금 마음속 혼란을 마치 흐린 물처럼 생각해보세요. 잠시 그 물을 가만히 두면 자연스럽게 맑아지듯, 마음도 고요해질 수 있습니다. 호흡에 집중하면서 복잡한 생각들이 하나씩 정리되는 것을 느껴보세요. 내면 깊은 곳에 이미 답을 알고 있는 현명한 자신이 있다는 것을 믿어보세요. 숨을 들이마실 때마다 명료함이, 내쉴 때마다 혼란이 사라집니다. 지금 이 순간 ${input.name}님은 올바른 길을 찾을 수 있는 지혜를 갖고 있습니다.`,
      outro: `${input.name}님, 고요한 마음에서 나오는 직관을 신뢰하세요. 모든 답이 한 번에 나오지 않아도 괜찮습니다. 차근차근 한 걸음씩 나아가시면 됩니다. 천천히 눈을 뜨시고, 내면의 지혜를 믿으며 현명한 선택을 해나가세요. 당신 안에는 이미 모든 답이 있습니다.`
    },
    reflection: {
      intro: `${input.name}님, 안녕하세요. 오늘은 자신을 돌아보고 성찰하는 시간을 가지고 싶으시군요. 이런 시간은 우리 삶에서 정말 소중합니다. ${input.duration}분 동안 조용히 내면을 탐색하며 깊은 통찰을 얻어보겠습니다. 편안한 자세로 앉아 척추를 곧게 세우고, 자연스럽게 호흡해보세요.`,
      core: `${input.name}님, 이제 마음의 눈으로 지나온 시간들을 부드럽게 바라보세요. 판단하지 말고 그저 관찰만 해보세요. 성장한 부분들, 배운 교훈들, 소중했던 순간들을 차례로 떠올려보세요. 실수나 후회도 모두 소중한 배움의 과정이었음을 인정해주세요. 숨을 들이마실 때마다 자신에 대한 이해가 깊어지고, 내쉴 때마다 자기 수용이 커집니다. 지금의 ${input.name}님은 완벽하지 않아도 충분히 가치 있는 존재입니다. 앞으로 나아갈 방향에 대한 지혜가 마음속에서 조용히 떠오르는 것을 느껴보세요.`,
      outro: `${input.name}님, 자신을 성찰하는 이 소중한 시간을 가져주셔서 감사합니다. 오늘 얻은 통찰을 마음에 깊이 새겨두세요. 계속해서 자신과 대화하며 성장해나가시기 바랍니다. 천천히 눈을 뜨시고, 새로운 이해와 함께 더욱 지혜로운 하루를 보내세요. 자기 성찰은 가장 큰 선물입니다.`
    }
  };

  const template = templates[dominantEmotion as keyof typeof templates] || templates.reflection;
  
  const textContent = `**도입부**

${template.intro}

**본 명상**

${template.core}

**마무리**

${template.outro}`;

  console.log('로컬 고급 템플릿 생성 완료:', dominantEmotion);
  return { textContent };
}

// TTS 준비 함수 - Web Speech API 사용
export async function generateTTS(text: string): Promise<string | null> {
  try {
    // Web Speech API 지원 확인
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API를 지원하지 않는 브라우저입니다.');
      return null;
    }

    // 음성 대기
    await new Promise<void>((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
      } else {
        speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
      }
    });

    console.log('Web Speech API TTS 준비 완료');
    return 'ready';

  } catch (error) {
    console.error('TTS 준비 중 오류:', error);
    return null;
  }
}