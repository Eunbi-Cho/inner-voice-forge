import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Square, FileText, Timer, Brain } from "lucide-react";

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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = meditationData.inputData.duration * 60; // 분을 초로 변환

  // 페이즈별 시간 분배 (intro: 15%, core: 70%, outro: 15%)
  const phaseTimings = {
    intro: totalDuration * 0.15,
    core: totalDuration * 0.7,
    outro: totalDuration * 0.15
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
      case 'intro': return '도입';
      case 'core': return '명상';
      case 'outro': return '마무리';
      default: return '';
    }
  };

  const getCurrentScript = () => {
    return meditationData.meditation.textContent;
  };

  const parseTextContent = (text: string) => {
    if (!text) {
      return {
        intro: '도입부 내용이 없습니다.',
        core: '본 명상 내용이 없습니다.',
        outro: '마무리 내용이 없습니다.'
      };
    }

    // Try to split by **headers** first
    let sections = text.split(/\*\*[^*]+\*\*/);
    
    // If that doesn't work, try splitting by common Korean meditation section words
    if (sections.length < 4) {
      sections = text.split(/(도입부|본 명상|마무리)/);
    }
    
    // If still no sections, treat the whole text as core content
    if (sections.length < 4) {
      const thirdLength = Math.floor(text.length / 3);
      return {
        intro: text.substring(0, thirdLength) || '도입부 내용이 없습니다.',
        core: text.substring(thirdLength, thirdLength * 2) || '본 명상 내용이 없습니다.',
        outro: text.substring(thirdLength * 2) || '마무리 내용이 없습니다.'
      };
    }
    
    return {
      intro: sections[1]?.trim() || '도입부 내용이 없습니다.',
      core: sections[2]?.trim() || '본 명상 내용이 없습니다.',
      outro: sections[3]?.trim() || '마무리 내용이 없습니다.'
    };
  };

  const parsedContent = parseTextContent(meditationData.meditation.textContent);

  const getCurrentPhaseText = () => {
    switch (currentPhase) {
      case 'intro': return parsedContent.intro;
      case 'core': return parsedContent.core;
      case 'outro': return parsedContent.outro;
      default: return '';
    }
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
            <div className="flex items-center gap-2">
              {meditationData.emotionAnalysis && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="flex items-center gap-1"
                >
                  <Brain className="w-3 h-3" />
                  분석결과
                </Button>
              )}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {getPhaseText()} 단계
              </Badge>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
              나만의 명상
            </h1>
            <p className="text-lg text-muted-foreground">
              {meditationData.inputData.duration}분 개인화된 명상 세션
            </p>
          </div>
        </div>

        {/* 감정 분석 결과 */}
        {showAnalysis && meditationData.emotionAnalysis && (
          <Card className="border shadow-notion mb-8 animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                감정 분석 결과
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-foreground leading-relaxed">
                  {meditationData.emotionAnalysis}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {phase === 'intro' && '도입'}
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
                <p className="text-foreground leading-relaxed text-lg whitespace-pre-line">
                  {getCurrentPhaseText()}
                </p>
              </div>
              
              {/* 전체 스크립트 미리보기 */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary transition-smooth list-none">
                  <div className="flex items-center gap-2">
                    <span>전체 스크립트 보기</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="mt-6 space-y-6">
                  <div className="border border-border rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span>🌱 도입부</span>
                    </h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{parsedContent.intro}</p>
                  </div>
                  <div className="border border-border rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span>🧘‍♀️ 본 명상</span>
                    </h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{parsedContent.core}</p>
                  </div>
                  <div className="border border-border rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span>🌟 마무리</span>
                    </h4>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{parsedContent.outro}</p>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}