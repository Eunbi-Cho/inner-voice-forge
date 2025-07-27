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

// 감정 분석 함수
export async function analyzeEmotion(input: MeditationInput): Promise<string> {
  console.log('감정 분석 시작...', { text: input.text.substring(0, 50) });
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-meditation', {
      body: {
        action: 'analyze-emotion',
        name: input.name,
        text: input.text
      }
    });

    if (error) {
      console.error('함수 호출 오류:', error);
      throw new Error('감정 분석 중 오류가 발생했습니다.');
    }

    console.log('감정 분석 완료');
    return data.result;
  } catch (error) {
    console.error('감정 분석 중 오류:', error);
    throw new Error('감정 분석 중 오류가 발생했습니다.');
  }
}

// 명상 스크립트 생성 함수
export async function generateMeditationScript(input: MeditationInput): Promise<MeditationScript> {
  console.log('명상 스크립트 생성 시작...', { duration: input.duration });
  
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
      throw new Error('명상 스크립트 생성 중 오류가 발생했습니다.');
    }

    console.log('명상 스크립트 생성 완료');
    return {
      textContent: data.textContent
    };
  } catch (error) {
    console.error('명상 스크립트 생성 중 오류:', error);
    throw new Error('명상 스크립트 생성 중 오류가 발생했습니다.');
  }
}

// TTS 생성 함수
export async function generateTTS(text: string): Promise<string | null> {
  try {
    console.log('TTS 생성 시작...', { textLength: text.length });
    
    const { data, error } = await supabase.functions.invoke('generate-meditation', {
      body: {
        action: 'generate-tts',
        text: text
      }
    });

    if (error) {
      console.error('TTS 함수 호출 오류:', error);
      return null;
    }

    // Edge function에서 Blob을 직접 반환하므로 URL 생성
    const audioBlob = new Blob([data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('TTS 생성 완료');
    return audioUrl;
  } catch (error) {
    console.error('TTS 생성 실패:', error);
    return null;
  }
}