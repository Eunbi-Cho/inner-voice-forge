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

// 고급 감정 분석 함수
export async function analyzeEmotion(input: MeditationInput): Promise<string> {
  console.log('감정 분석 시작...', { text: input.text.substring(0, 50) });
  
  const text = input.text.toLowerCase();
  
  // 감정 키워드 매핑
  const emotionKeywords = {
    stress: ['스트레스', '힘들', '어려운', '압박', '부담', '걱정', '불안'],
    sadness: ['슬프', '우울', '외로운', '허무', '공허', '쓸쓸', '멜랑콜리'],
    joy: ['기쁘', '행복', '좋은', '즐거운', '만족', '감사', '기분좋'],
    anger: ['화나', '짜증', '분노', '억울', '답답', '빡치', '열받'],
    confusion: ['혼란', '모르겠', '복잡', '어지러운', '갈피', '미궁'],
    hope: ['희망', '기대', '꿈', '목표', '바라', '소망', '계획'],
    fatigue: ['피곤', '지쳐', '힘없', '나른', '무기력', '권태'],
    reflection: ['생각', '고민', '성찰', '반성', '깨달음', '인식', '자각']
  };
  
  // 감정 점수 계산
  const emotionScores: Record<string, number> = {};
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    emotionScores[emotion] = keywords.reduce((score, keyword) => {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      return score + matches;
    }, 0);
  }
  
  // 가장 높은 점수의 감정 찾기
  const dominantEmotion = Object.entries(emotionScores)
    .reduce((a, b) => emotionScores[a[0]] > emotionScores[b[0]] ? a : b)[0];
  
  // 개인화된 감정 분석 메시지 생성
  const emotionMessages = {
    stress: `${input.name}님의 글에서 스트레스와 긴장감이 느껴집니다. 마음의 짐을 내려놓고 깊은 안정을 찾는 명상을 진행해보겠습니다.`,
    sadness: `${input.name}님의 마음속 슬픔과 고독감이 전해집니다. 이러한 감정을 따뜻하게 감싸 안고 위로받는 명상을 진행해보겠습니다.`,
    joy: `${input.name}님의 글에서 기쁨과 긍정적인 에너지가 느껴집니다. 이 좋은 감정을 더욱 깊이 느끼고 확장하는 명상을 진행해보겠습니다.`,
    anger: `${input.name}님의 분노와 좌절감이 느껴집니다. 이러한 강한 감정을 건강하게 해소하고 내면의 평화를 되찾는 명상을 진행해보겠습니다.`,
    confusion: `${input.name}님의 마음속 혼란과 복잡함이 느껴집니다. 생각을 정리하고 명확한 방향을 찾는 명상을 진행해보겠습니다.`,
    hope: `${input.name}님의 희망과 기대감이 느껴집니다. 이러한 긍정적인 에너지를 더욱 키우고 실현 가능성을 높이는 명상을 진행해보겠습니다.`,
    fatigue: `${input.name}님의 피로와 무기력함이 느껴집니다. 깊은 휴식과 재충전의 시간을 가지는 명상을 진행해보겠습니다.`,
    reflection: `${input.name}님의 깊은 성찰과 사색이 느껴집니다. 이러한 내적 여행을 더욱 의미 있게 만드는 명상을 진행해보겠습니다.`
  };
  
  const result = emotionMessages[dominantEmotion] || `${input.name}님의 마음을 이해하고 평온함을 찾는 명상을 진행해보겠습니다.`;
  console.log('감정 분석 완료:', dominantEmotion);
  return result;
}

// 템플릿 기반 개인화 명상 스크립트 생성
export async function generateMeditationScript(input: MeditationInput): Promise<MeditationScript> {
  console.log('명상 스크립트 생성 시작...', { duration: input.duration });
  
  // 감정 분석을 위한 키워드 분석
  const text = input.text.toLowerCase();
  
  // 사용자 텍스트에서 핵심 키워드 추출
  const stressKeywords = ['스트레스', '힘들', '어려운', '압박', '불안'];
  const sadnessKeywords = ['슬프', '우울', '외로운', '허무'];
  const joyKeywords = ['기쁘', '행복', '좋은', '즐거운', '만족'];
  const confusionKeywords = ['혼란', '모르겠', '복잡', '갈피'];
  const reflectionKeywords = ['생각', '고민', '성찰', '깨달음'];
  
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
  
  // 시간대별 구조 정의 (총 시간을 3등분)
  const thirdDuration = Math.floor(input.duration / 3);
  const introDuration = thirdDuration;
  const coreDuration = input.duration - (thirdDuration * 2);
  const outroDuration = thirdDuration;
  
  // 감정별 맞춤 명상 템플릿
  const templates = {
    stress: {
      intro: `안녕하세요, ${input.name}님. 오늘 하루 많은 스트레스와 압박을 받으셨군요. 지금부터 ${input.duration}분 동안 그 무거운 짐을 내려놓고 마음의 평안을 되찾아보겠습니다. 편안한 자세를 취하고, 깊게 숨을 들이마시며 긴장을 풀어보세요.`,
      core: `이제 호흡에 집중해보겠습니다. 숨을 들이마실 때는 평온함을, 내쉴 때는 스트레스를 함께 내보내세요. ${input.name}님의 어깨와 목의 긴장을 의식적으로 풀어주세요. 마음속 걱정과 염려들을 구름처럼 떠나보내고, 지금 이 순간의 평화로움을 느껴보세요.`,
      outro: `${input.name}님, 이제 깊은 휴식을 취하셨습니다. 이 평온한 상태를 기억하시고, 언제든 스트레스를 느낄 때 이 호흡법으로 돌아오세요. 천천히 눈을 뜨시고, 새롭게 충전된 에너지로 하루를 마무리하세요.`
    },
    sadness: {
      intro: `안녕하세요, ${input.name}님. 마음이 무겁고 슬픈 하루였군요. 이러한 감정도 소중한 당신의 일부입니다. 지금부터 ${input.duration}분 동안 그 슬픔을 따뜻하게 감싸 안고, 내면의 위로를 찾아보겠습니다.`,
      core: `${input.name}님의 마음속 슬픔을 있는 그대로 받아들여보세요. 그 감정을 밀어내지 말고, 마치 오래된 친구를 맞이하듯 따뜻하게 안아주세요. 숨을 들이마실 때마다 자신에게 사랑을 보내고, 내쉴 때마다 마음의 짐을 조금씩 덜어보세요.`,
      outro: `${input.name}님, 슬픔 속에서도 자신을 돌보는 시간을 가지셨습니다. 이런 순간들이 모여 더 깊은 자비심과 지혜를 만들어갑니다. 천천히 현재로 돌아오시며, 오늘의 경험을 소중히 간직하세요.`
    },
    joy: {
      intro: `안녕하세요, ${input.name}님. 오늘 기쁨과 행복한 마음이 느껴집니다. 이 아름다운 감정을 더욱 깊이 느끼고 확장해보는 ${input.duration}분의 시간을 가져보겠습니다.`,
      core: `${input.name}님의 마음속 기쁨을 온몸으로 느껴보세요. 이 행복한 에너지가 가슴에서 시작해서 온몸으로 퍼져나가는 것을 상상해보세요. 감사한 마음과 함께 이 순간의 소중함을 깊이 새겨보세요.`,
      outro: `${input.name}님, 이 아름다운 기쁨의 순간을 마음에 깊이 새기셨습니다. 이 에너지를 일상에서도 계속 간직하시고, 다른 사람들에게도 나누어주세요. 밝은 미소와 함께 하루를 마무리하세요.`
    },
    confusion: {
      intro: `안녕하세요, ${input.name}님. 마음이 복잡하고 혼란스러운 하루였군요. 지금부터 ${input.duration}분 동안 그 혼란한 생각들을 정리하고 명확한 방향을 찾아보겠습니다.`,
      core: `${input.name}님의 마음속 여러 생각들을 하나씩 정리해보겠습니다. 각각의 생각을 구름처럼 떠나보내고, 호흡에만 집중해보세요. 복잡한 마음이 점점 고요해지고, 그 속에서 진정한 답이 떠오르는 것을 느껴보세요.`,
      outro: `${input.name}님, 혼란 속에서도 고요한 중심을 찾으셨습니다. 모든 답을 지금 당장 알 필요는 없습니다. 이 평온한 마음가짐으로 하나씩 천천히 해결해나가세요.`
    },
    reflection: {
      intro: `안녕하세요, ${input.name}님. 깊은 성찰과 사색의 시간을 보내셨군요. 지금부터 ${input.duration}분 동안 그 내적 여행을 더욱 의미 있게 만들어보겠습니다.`,
      core: `${input.name}님의 깊은 사색을 이어가보세요. 지금까지의 경험과 깨달음들을 차분히 되돌아보며, 그 속에서 자신만의 지혜를 발견해보세요. 과거와 현재, 그리고 미래의 자신과 대화하는 시간을 가져보세요.`,
      outro: `${input.name}님, 성찰의 시간을 통해 더 깊은 자기 이해에 도달하셨습니다. 이러한 내면의 여행이 앞으로의 삶을 더욱 풍요롭게 만들어갈 것입니다. 지혜로운 마음으로 새로운 하루를 맞이하세요.`
    }
  };
  
  const template = templates[dominantEmotion] || templates.reflection;
  
  const personalizedScript = `
**도입부** (${introDuration}분)

${template.intro}

편안한 자세를 취하고 눈을 부드럽게 감아보세요. 깊게 숨을 들이마시고... 천천히 내쉬어보세요. 세 번 더 깊은 호흡을 해보겠습니다. 들이마시고... 내쉬고... 들이마시고... 내쉬고... 들이마시고... 내쉬세요.

**본 명상** (${coreDuration}분)

${template.core}

이제 자연스러운 호흡의 리듬을 느껴보세요. 호흡이 들어오고 나갈 때마다 ${input.name}님의 몸과 마음이 더욱 편안해지는 것을 느껴보세요. 

몸의 각 부분을 차례로 의식해보겠습니다. 발끝부터 시작해서... 다리... 허리... 가슴... 어깨... 팔... 목... 그리고 머리까지... 각 부분이 편안하게 이완되는 것을 느껴보세요.

${input.name}님만의 특별한 이 순간을 깊이 느끼고 기억해주세요.

**마무리** (${outroDuration}분)

${template.outro}

이제 서서히 주변의 소리들을 의식해보세요. 호흡이 자연스럽게 돌아오고, 몸의 감각이 돌아오는 것을 느껴보세요. 

손가락과 발가락을 가볍게 움직여보고, 목을 좌우로 부드럽게 돌려보세요. 

준비가 되시면 천천히, 정말 천천히 눈을 뜨세요. ${input.name}님, 오늘도 수고 많으셨습니다.
  `;
  
  console.log('개인화된 명상 스크립트 생성 완료:', dominantEmotion);
  
  return {
    textContent: personalizedScript.trim()
  };
}

// Web Speech API를 사용한 브라우저 내장 TTS (API 무관)
export async function generateTTS(text: string): Promise<string | null> {
  try {
    console.log('브라우저 TTS 준비...', { textLength: text.length });
    
    // Web Speech API 지원 확인
    if (!('speechSynthesis' in window)) {
      console.error('이 브라우저는 Web Speech API를 지원하지 않습니다.');
      return null;
    }
    
    // 음성 목록이 로딩될 때까지 대기
    await new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        speechSynthesis.addEventListener('voiceschanged', resolve, { once: true });
      }
    });
    
    console.log('브라우저 TTS 준비 완료');
    // Web Speech API는 URL이 아닌 직접 재생 방식이므로 특별한 식별자 반환
    return 'web-speech-api-ready';
  } catch (error) {
    console.error('브라우저 TTS 준비 실패:', error);
    return null;
  }
}