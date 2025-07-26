import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, FileText, Volume2, Sparkles } from "lucide-react";

interface MeditationLoadingProps {
  onComplete: (meditationData: any) => void;
  inputData: {
    text: string;
    duration: number;
    image?: File;
  };
}

export default function MeditationLoading({ onComplete, inputData }: MeditationLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { 
      title: "감정 분석 중", 
      description: "AI가 당신의 마음 상태를 분석하고 있습니다", 
      icon: Brain,
      duration: 3000 
    },
    { 
      title: "명상 스크립트 생성", 
      description: "맞춤형 명상 가이드를 작성하고 있습니다", 
      icon: FileText,
      duration: 4000 
    },
    { 
      title: "음성 변환 준비", 
      description: "intro, core, outro 파트를 준비하고 있습니다", 
      icon: Volume2,
      duration: 2000 
    },
    { 
      title: "최종 준비", 
      description: "당신만의 명상이 거의 완성되었습니다", 
      icon: Sparkles,
      duration: 1000 
    }
  ];

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= steps.length) {
        // 모든 단계 완료 - 가짜 명상 데이터 생성
        const fakeMeditationData = {
          script: {
            intro: "깊게 숨을 들이마시고, 천천히 내쉬어보세요. 이제 당신만의 명상 시간이 시작됩니다.",
            core: `${inputData.text}에 대한 마음의 평화를 찾아보겠습니다. 모든 걱정을 내려놓고 현재에 집중해보세요.`,
            outro: "명상을 마무리하며, 새로운 에너지로 가득 찬 자신을 느껴보세요. 천천히 눈을 뜨셔도 좋습니다."
          },
          duration: inputData.duration,
          audioUrls: {
            intro: null, // TTS 연동 시 실제 URL
            core: null,
            outro: null
          }
        };
        
        setTimeout(() => onComplete(fakeMeditationData), 500);
        return;
      }

      setCurrentStep(stepIndex);
      setProgress(0);

      // 프로그레스 바 애니메이션
      const step = steps[stepIndex];
      const progressInterval = 50;
      const progressIncrement = 100 / (step.duration / progressInterval);

      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + progressIncrement;
          if (newProgress >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return newProgress;
        });
      }, progressInterval);

      // 다음 단계로 이동
      stepTimer = setTimeout(() => {
        runStep(stepIndex + 1);
      }, step.duration);
    };

    runStep(0);

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, [inputData, onComplete]);

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="border shadow-notion max-w-md w-full animate-scale-in">
        <CardContent className="p-12 text-center">
          {/* 로딩 아이콘 */}
          <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-8 flex items-center justify-center">
            {currentStepData && (
              <currentStepData.icon className="w-10 h-10 text-foreground animate-pulse" />
            )}
          </div>

          {/* 현재 단계 */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {currentStepData?.title}
          </h2>
          <p className="text-muted-foreground mb-12 leading-relaxed">
            {currentStepData?.description}
          </p>

          {/* 프로그레스 바 */}
          <div className="space-y-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* 단계 표시 */}
            <div className="flex justify-between items-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 예상 시간 */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              예상 완료 시간: {Math.ceil((steps.length - currentStep) * 2.5)}초
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}