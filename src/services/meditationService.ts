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

// 감정 분석 함수 (스킵 가능)
export async function analyzeEmotion(input: MeditationInput): Promise<string> {
  console.log('감정 분석 시작...', { text: input.text.substring(0, 50) });
  
  // API 제한으로 인해 간단한 감정 분석을 제공
  try {
    // 간단한 키워드 기반 감정 분석 (API 호출 없이)
    const text = input.text.toLowerCase();
    let emotion = "차분한 성찰";
    
    if (text.includes('스트레스') || text.includes('힘들') || text.includes('어려운')) {
      emotion = "스트레스와 긴장감";
    } else if (text.includes('슬프') || text.includes('우울') || text.includes('외로운')) {
      emotion = "슬픔과 고독감";
    } else if (text.includes('기쁘') || text.includes('행복') || text.includes('좋은')) {
      emotion = "기쁨과 만족감";
    } else if (text.includes('화나') || text.includes('짜증') || text.includes('분노')) {
      emotion = "분노와 좌절감";
    }
    
    const result = `${input.name}님의 글에서 ${emotion}이 느껴집니다. 이러한 감정을 자연스럽게 받아들이고 마음의 평화를 찾는 명상을 진행해보겠습니다.`;
    console.log('감정 분석 완료');
    return result;
  } catch (error) {
    console.error('감정 분석 중 오류:', error);
    return `${input.name}님의 마음을 이해하고 평온함을 찾는 명상을 진행해보겠습니다.`;
  }
}

// 명상 스크립트 생성 함수
export async function generateMeditationScript(input: MeditationInput): Promise<MeditationScript> {
  console.log('명상 스크립트 생성 시작...', { duration: input.duration });
  
  try {
    // API 호출 재시도 로직 추가
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase.functions.invoke('generate-meditation', {
          body: {
            action: 'generate-script',
            name: input.name,
            text: input.text,
            duration: input.duration
          }
        });

        if (error) {
          console.error('함수 호출 오류:', error);
          throw error;
        }

        console.log('명상 스크립트 생성 완료');
        return {
          textContent: data.textContent
        };
      } catch (apiError) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw apiError;
        }
        // 재시도 전 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('최대 재시도 횟수 초과');
  } catch (error) {
    console.error('명상 스크립트 생성 중 오류:', error);
    
    // 폴백: 간단한 기본 명상 스크립트 제공
    const fallbackScript = `
**도입부**

안녕하세요, ${input.name}님. 오늘 시간을 내어 명상을 하시려는 마음이 정말 소중합니다. 지금부터 ${input.duration}분 동안 저와 함께 마음의 평화를 찾아보겠습니다.

편안한 자세를 취하고 눈을 감아보세요. 깊게 숨을 들이마시고... 천천히 내쉬어보세요.

**본 명상**

이제 호흡에 집중해보겠습니다. 자연스럽게 들어오고 나가는 숨을 느껴보세요. 마음이 바쁘게 움직이더라도 괜찮습니다. 그저 호흡으로 돌아오면 됩니다.

${input.name}님의 오늘 하루를 떠올려보세요. 어떤 감정이든 있는 그대로 받아들여보세요. 판단하지 말고 그저 관찰해보세요.

이제 감사한 마음을 떠올려보겠습니다. 작은 것이라도 좋습니다. 그 따뜻한 마음을 느껴보세요.

**마무리**

천천히 현재로 돌아와 보겠습니다. ${input.name}님, 이 평온한 마음을 기억하세요. 언제든 호흡으로 돌아올 수 있습니다.

눈을 천천히 뜨고 새로운 마음으로 하루를 이어가세요.
    `;
    
    return {
      textContent: fallbackScript.trim()
    };
  }
}

// TTS 생성 함수 (선택적)
export async function generateTTS(text: string): Promise<string | null> {
  try {
    console.log('TTS 생성 시작...', { textLength: text.length });
    
    // 텍스트가 너무 길면 일부만 사용
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) + "..." : text;
    
    const { data, error } = await supabase.functions.invoke('generate-meditation', {
      body: {
        action: 'generate-tts',
        text: truncatedText
      }
    });

    if (error) {
      console.error('TTS 함수 호출 오류:', error);
      return null; // TTS 실패 시 null 반환 (계속 진행)
    }

    // base64 오디오 데이터를 Blob으로 변환
    const binaryString = atob(data.audioContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('TTS 생성 완료');
    return audioUrl;
  } catch (error) {
    console.error('TTS 생성 실패:', error);
    return null; // TTS 실패해도 앱이 멈추지 않도록
  }
}