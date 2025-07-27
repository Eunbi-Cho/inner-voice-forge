// Web Speech API를 사용한 브라우저 내장 TTS
interface TTSOptions {
  rate?: number;  // 0.1 - 10 (기본값: 1)
  pitch?: number; // 0 - 2 (기본값: 1)
  volume?: number; // 0 - 1 (기본값: 1)
  voice?: SpeechSynthesisVoice;
  lang?: string; // 언어 코드 (예: 'ko-KR')
}

export class WebSpeechTTS {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private isPaused = false;
  private onEndCallback?: () => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  // 사용 가능한 한국어 음성 목록 가져오기
  getKoreanVoices(): SpeechSynthesisVoice[] {
    const voices = this.synthesis.getVoices();
    return voices.filter(voice => 
      voice.lang.startsWith('ko') || 
      voice.name.includes('Korean') ||
      voice.name.includes('한국')
    );
  }

  // 최적의 한국어 음성 선택
  getBestKoreanVoice(): SpeechSynthesisVoice | null {
    const koreanVoices = this.getKoreanVoices();
    
    if (koreanVoices.length === 0) {
      console.warn('한국어 음성을 찾을 수 없습니다. 기본 음성을 사용합니다.');
      return null;
    }

    // 우선순위: 로컬 > 네트워크, 여성 음성 선호
    const preferred = koreanVoices.find(voice => 
      voice.localService && (voice.name.includes('여성') || voice.name.includes('female'))
    );
    
    if (preferred) return preferred;

    // 로컬 음성 중 아무거나
    const local = koreanVoices.find(voice => voice.localService);
    if (local) return local;

    // 첫 번째 한국어 음성
    return koreanVoices[0];
  }

  // 텍스트를 음성으로 재생
  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // 이전 재생 중지
      this.stop();

      // 마크다운 및 특수 문자 제거
      const cleanText = this.cleanTextForSpeech(text);
      
      if (!cleanText.trim()) {
        resolve();
        return;
      }

      this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
      
      // 음성 설정
      const bestVoice = this.getBestKoreanVoice();
      if (bestVoice) {
        this.currentUtterance.voice = bestVoice;
      }
      
      this.currentUtterance.rate = options.rate || 1.0; // 정상 속도
      this.currentUtterance.pitch = options.pitch || 1;
      this.currentUtterance.volume = options.volume || 0.9;
      this.currentUtterance.lang = options.lang || 'ko-KR';

      // 이벤트 핸들러
      this.currentUtterance.onend = () => {
        this.isPlaying = false;
        this.isPaused = false;
        this.onEndCallback?.();
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        console.error('TTS 오류:', event);
        this.isPlaying = false;
        this.isPaused = false;
        reject(new Error(`TTS 오류: ${event.error}`));
      };

      this.currentUtterance.onstart = () => {
        this.isPlaying = true;
        this.isPaused = false;
      };

      // 재생 시작
      this.synthesis.speak(this.currentUtterance);
    });
  }

  // 재생 일시정지
  pause(): void {
    if (this.isPlaying && !this.isPaused) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }

  // 재생 재개
  resume(): void {
    if (this.isPaused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }

  // 재생 중지
  stop(): void {
    this.synthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterance = null;
  }

  // 재생 상태 확인
  getPlayingState(): { isPlaying: boolean; isPaused: boolean } {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused
    };
  }

  // 재생 완료 콜백 설정
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  // 음성용 텍스트 정리
  private cleanTextForSpeech(text: string): string {
    return text
      // 마크다운 헤더 제거
      .replace(/^#+\s*/gm, '')
      // 마크다운 볼드/이탤릭 제거
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // 괄호 안 내용 제거 (시간 표시 등)
      .replace(/\([^)]*\)/g, '')
      // 연속된 공백 정리
      .replace(/\s+/g, ' ')
      // 줄바꿈을 자연스러운 쉼표로 변환
      .replace(/\n+/g, ', ')
      .trim();
  }

  // 브라우저 지원 확인
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // 음성 로딩 대기 (일부 브라우저에서 필요)
  static waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      speechSynthesis.addEventListener('voiceschanged', function handler() {
        speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(speechSynthesis.getVoices());
      });
    });
  }
}

// 전역 TTS 인스턴스
export const webTTS = new WebSpeechTTS();