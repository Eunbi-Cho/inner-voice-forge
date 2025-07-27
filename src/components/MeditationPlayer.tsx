import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Square, FileText, Timer, Brain, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MeditationPlayerProps {
  meditationData: {
    emotionAnalysis: string;
    meditation: {
      textContent: string;
    };
    inputData: {
      name: string;
      text: string;
      duration: number;
    };
  };
  onBack: () => void;
}

export default function MeditationPlayer({ meditationData, onBack }: MeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'core' | 'outro'>('intro');
  const [showScript, setShowScript] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [audioUrls, setAudioUrls] = useState<{
    intro?: string;
    core?: string;
    outro?: string;
  }>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = meditationData.inputData.duration * 60; // 분을 초로 변환

  // 단계별 시간 계산 (1/3씩 분할)
  const phaseTimings = {
    intro: Math.floor(totalDuration / 3),
    core: Math.floor(totalDuration / 3),
    outro: totalDuration - (Math.floor(totalDuration / 3) * 2)
  };

  const getCurrentPhase = (time: number): 'intro' | 'core' | 'outro' => {
    if (time < phaseTimings.intro) return 'intro';
    if (time < phaseTimings.intro + phaseTimings.core) return 'core';
    return 'outro';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // OpenAI TTS로 오디오 생성
  const generateAudioForPhase = async (phase: 'intro' | 'core' | 'outro'): Promise<string | null> => {
    const phaseText = getCurrentPhaseText(phase);
    if (!phaseText) return null;

    try {
      console.log(`${phase} 오디오 생성 중...`);
      
      const { data, error } = await supabase.functions.invoke('generate-meditation', {
        body: {
          action: 'generate-tts',
          text: phaseText
        }
      });

      if (error) {
        console.error(`${phase} TTS 생성 오류:`, error);
        return null;
      }

      if (data?.audioContent) {
        // Base64를 Blob으로 변환하여 오디오 URL 생성
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log(`${phase} 오디오 생성 완료`);
        return audioUrl;
      }

      return null;
    } catch (error) {
      console.error(`${phase} TTS 생성 실패:`, error);
      return null;
    }
  };

  // 현재 단계 재생
  const playCurrentPhase = async (phase?: 'intro' | 'core' | 'outro') => {
    const targetPhase = phase || currentPhase;
    
    // 기존 오디오가 있으면 사용, 없으면 생성
    let audioUrl = audioUrls[targetPhase];
    
    if (!audioUrl) {
      setIsLoadingTTS(true);
      audioUrl = await generateAudioForPhase(targetPhase);
      
      if (audioUrl) {
        setAudioUrls(prev => ({ ...prev, [targetPhase]: audioUrl }));
      }
      setIsLoadingTTS(false);
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      try {
        await audioRef.current.play();
        console.log(`${targetPhase} 재생 시작`);
      } catch (error) {
        console.error(`${targetPhase} 재생 오류:`, error);
      }
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      // 일시정지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // 재생 시작
      setIsPlaying(true);
      
      try {
        await playCurrentPhase();
        
        // 타이머 시작
        timerRef.current = setInterval(() => {
          setCurrentTime(prev => {
            const newTime = prev + 1;
            const newPhase = getCurrentPhase(newTime);
            
            // 단계 변경 시 새로운 오디오 재생
            if (newPhase !== currentPhase) {
              setCurrentPhase(newPhase);
              setTimeout(() => playCurrentPhase(newPhase), 100);
            }
            
            // 시간 종료 시 정지
            if (newTime >= totalDuration) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              if (audioRef.current) {
                audioRef.current.pause();
              }
              setIsPlaying(false);
              return totalDuration;
            }
            
            return newTime;
          });
        }, 1000);
      } catch (error) {
        console.error('재생 실패:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentPhase('intro');
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // 생성된 오디오 URL 정리
      Object.values(audioUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [audioUrls]);

  const progress = (currentTime / totalDuration) * 100;
  const remainingTime = totalDuration - currentTime;

  const getPhaseText = (phase: 'intro' | 'core' | 'outro'): string => {
    const phaseNames = {
      intro: '도입부',
      core: '본 명상',
      outro: '마무리'
    };
    return phaseNames[phase];
  };

  const getCurrentScript = (): string => {
    return meditationData.meditation.textContent;
  };

  // 스크립트에서 단계별 텍스트 추출
  const parseTextContent = (text: string) => {
    const sections = {
      intro: '',
      core: '',
      outro: ''
    };

    // **도입부**, **본 명상**, **마무리** 섹션으로 분리
    const introMatch = text.match(/\*\*도입부\*\*([\s\S]*?)(?=\*\*본 명상\*\*|\*\*마무리\*\*|$)/);
    const coreMatch = text.match(/\*\*본 명상\*\*([\s\S]*?)(?=\*\*마무리\*\*|$)/);
    const outroMatch = text.match(/\*\*마무리\*\*([\s\S]*?)$/);

    if (introMatch) {
      sections.intro = introMatch[1].trim();
    }
    if (coreMatch) {
      sections.core = coreMatch[1].trim();
    }
    if (outroMatch) {
      sections.outro = outroMatch[1].trim();
    }

    // 섹션이 비어있으면 전체 텍스트를 3등분
    if (!sections.intro && !sections.core && !sections.outro) {
      const words = text.split(' ');
      const wordsPerSection = Math.ceil(words.length / 3);
      sections.intro = words.slice(0, wordsPerSection).join(' ');
      sections.core = words.slice(wordsPerSection, wordsPerSection * 2).join(' ');
      sections.outro = words.slice(wordsPerSection * 2).join(' ');
    }

    return sections;
  };

  const getCurrentPhaseText = (phase?: 'intro' | 'core' | 'outro'): string => {
    const targetPhase = phase || currentPhase;
    const sections = parseTextContent(meditationData.meditation.textContent);
    return sections[targetPhase] || '';
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto">
      {/* 숨겨진 오디오 엘리먼트 */}
      <audio ref={audioRef} />
      
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {meditationData.inputData.name}님의 명상
          </h1>
          <p className="text-muted-foreground">
            {meditationData.inputData.duration}분 개인 맞춤 명상
          </p>
        </div>
        
        <div className="w-20" /> {/* 헤더 균형을 위한 빈 공간 */}
      </div>

      {/* 메인 플레이어 카드 */}
      <Card className="border shadow-notion mb-6">
        <CardContent className="p-8">
          {/* 진행 상황 표시 */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              {getPhaseText(currentPhase)}
            </Badge>
            
            {/* 진행 바 */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* 시간 정보 */}
            <div className="flex justify-between text-sm text-muted-foreground mb-6">
              <span>{formatTime(currentTime)}</span>
              <span>남은 시간: {formatTime(remainingTime)}</span>
            </div>
          </div>

          {/* 플레이어 컨트롤 */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              disabled={isLoadingTTS}
            >
              <Square className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={handlePlayPause}
              disabled={isLoadingTTS}
              className="gap-2 px-8"
            >
              {isLoadingTTS ? (
                <>
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  TTS 로딩 중...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  일시정지
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  재생
                </>
              )}
            </Button>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-center items-center gap-6 mt-8">
            {(['intro', 'core', 'outro'] as const).map((phase, index) => (
              <div
                key={phase}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentPhase === phase 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${
                    currentPhase === phase 
                      ? 'bg-primary' 
                      : getCurrentPhase(currentTime) === phase || currentTime > phaseTimings[phase]
                        ? 'bg-primary/50'
                        : 'bg-muted'
                  }`}
                />
                <span className="text-sm font-medium">
                  {getPhaseText(phase)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 스크립트 및 감정 분석 버튼 */}
      <div className="flex gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => setShowScript(!showScript)}
          className="flex-1 gap-2"
        >
          <FileText className="w-4 h-4" />
          {showScript ? '스크립트 숨기기' : '스크립트 보기'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="flex-1 gap-2"
        >
          <Brain className="w-4 h-4" />
          {showAnalysis ? '분석 숨기기' : '감정 분석 보기'}
        </Button>
      </div>

      {/* 감정 분석 카드 */}
      {showAnalysis && (
        <Card className="border shadow-notion mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">감정 분석</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {meditationData.emotionAnalysis}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 스크립트 카드 */}
      {showScript && (
        <Card className="border shadow-notion">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">명상 스크립트</h3>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {getCurrentScript()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}