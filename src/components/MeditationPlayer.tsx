import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MeditationPlayerProps {
  meditationData: {
    script: {
      intro: string;
      core: string;
      outro: string;
    };
    duration: number;
    audioUrls?: {
      intro: string | null;
      core: string | null;
      outro: string | null;
    };
  };
  onBack: () => void;
}

export default function MeditationPlayer({ meditationData, onBack }: MeditationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'core' | 'outro'>('intro');
  const [showScript, setShowScript] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = meditationData.duration * 60; // 분을 초로 변환

  // 페이즈별 시간 분배 (intro: 10%, core: 80%, outro: 10%)
  const phaseTimings = {
    intro: totalDuration * 0.1,
    core: totalDuration * 0.8,
    outro: totalDuration * 0.1
  };

  const getCurrentPhase = (time: number) => {
    if (time < phaseTimings.intro) return 'intro';
    if (time < phaseTimings.intro + phaseTimings.core) return 'core';
    return 'outro';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // 일시정지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // 재생 시작
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newPhase = getCurrentPhase(newTime);
          
          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);
          }
          
          if (newTime >= totalDuration) {
            // 명상 완료
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsPlaying(false);
            return totalDuration;
          }
          
          return newTime;
        });
      }, 1000);
    }
  };

  const handleReset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentPhase('intro');
  };

  const progress = (currentTime / totalDuration) * 100;
  const remainingTime = totalDuration - currentTime;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'intro': return '시작';
      case 'core': return '명상';
      case 'outro': return '마무리';
      default: return '';
    }
  };

  const getCurrentScript = () => {
    return meditationData.script[currentPhase];
  };

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="soft" onClick={onBack} className="rounded-full">
              ← 돌아가기
            </Button>
            <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
              {getPhaseText()} 단계
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            나만의 명상
          </h1>
          <p className="text-muted-foreground">
            {meditationData.duration}분 명상 세션
          </p>
        </div>

        {/* 메인 플레이어 */}
        <Card className="bg-gradient-card shadow-card-soft border-0 mb-6 animate-scale-up">
          <CardContent className="p-8 text-center">
            {/* 시간 표시 */}
            <div className="mb-8">
              <div className="text-5xl font-bold text-foreground mb-2">
                {formatTime(remainingTime)}
              </div>
              <p className="text-sm text-muted-foreground">
                남은 시간
              </p>
            </div>

            {/* 프로그레스 바 */}
            <div className="space-y-4 mb-8">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-smooth"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* 페이즈 표시 */}
            <div className="flex justify-center space-x-2 mb-8">
              {['intro', 'core', 'outro'].map((phase) => (
                <div
                  key={phase}
                  className={`px-3 py-1 rounded-full text-xs transition-smooth ${
                    currentPhase === phase
                      ? 'bg-gradient-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {phase === 'intro' && '시작'}
                  {phase === 'core' && '명상'}
                  {phase === 'outro' && '마무리'}
                </div>
              ))}
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="soft"
                size="lg"
                onClick={handleReset}
                className="rounded-full w-14 h-14"
              >
                ⏹️
              </Button>
              <Button
                variant="meditation"
                size="lg"
                onClick={handlePlayPause}
                className="rounded-full w-16 h-16 text-2xl"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>
              <Button
                variant="soft"
                size="lg"
                onClick={() => setShowScript(!showScript)}
                className="rounded-full w-14 h-14"
              >
                📝
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 스크립트 표시 */}
        {showScript && (
          <Card className="bg-gradient-card shadow-card-soft border-0 animate-scale-up">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                현재 가이드 ({getPhaseText()} 단계)
              </h3>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-foreground leading-relaxed">
                  {getCurrentScript()}
                </p>
              </div>
              
              {/* 전체 스크립트 미리보기 */}
              <div className="mt-6 space-y-3">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
                    전체 스크립트 보기
                  </summary>
                  <div className="mt-3 space-y-4">
                    {Object.entries(meditationData.script).map(([phase, text]) => (
                      <div key={phase} className="bg-background/30 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          {phase === 'intro' && '🌅 시작'}
                          {phase === 'core' && '🧘‍♀️ 명상'}
                          {phase === 'outro' && '🌟 마무리'}
                        </h4>
                        <p className="text-sm text-muted-foreground">{text}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}