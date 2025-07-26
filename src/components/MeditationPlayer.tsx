import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Square, FileText, Timer } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {getPhaseText()} 단계
            </Badge>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
              나만의 명상
            </h1>
            <p className="text-lg text-muted-foreground">
              {meditationData.duration}분 명상 세션
            </p>
          </div>
        </div>

        {/* 메인 플레이어 */}
        <Card className="border shadow-notion mb-8 animate-fade-in">
          <CardContent className="p-12 text-center">
            {/* 시간 표시 */}
            <div className="mb-12">
              <div className="text-6xl font-bold text-foreground mb-2 tracking-tight">
                {formatTime(remainingTime)}
              </div>
              <p className="text-muted-foreground">
                남은 시간
              </p>
            </div>

            {/* 프로그레스 바 */}
            <div className="space-y-4 mb-12">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* 페이즈 표시 */}
            <div className="flex justify-center space-x-2 mb-12">
              {['intro', 'core', 'outro'].map((phase) => (
                <div
                  key={phase}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentPhase === phase
                      ? 'bg-primary text-primary-foreground'
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
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="w-12 h-12 rounded-full"
              >
                <Square className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full text-xl"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowScript(!showScript)}
                className="w-12 h-12 rounded-full"
              >
                <FileText className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 스크립트 표시 */}
        {showScript && (
          <Card className="border shadow-notion animate-fade-in">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                현재 가이드 ({getPhaseText()} 단계)
              </h3>
              
              <div className="bg-muted/50 p-6 rounded-lg mb-8">
                <p className="text-foreground leading-relaxed text-lg">
                  {getCurrentScript()}
                </p>
              </div>
              
              {/* 전체 스크립트 미리보기 */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-notion list-none">
                  <div className="flex items-center gap-2">
                    <span>전체 스크립트 보기</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="mt-6 space-y-6">
                  {Object.entries(meditationData.script).map(([phase, text]) => (
                    <div key={phase} className="border border-border rounded-lg p-6">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        {phase === 'intro' && <span>🌅 시작</span>}
                        {phase === 'core' && <span>🧘‍♀️ 명상</span>}
                        {phase === 'outro' && <span>🌟 마무리</span>}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}