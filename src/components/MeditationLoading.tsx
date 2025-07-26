import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { analyzeEmotion, generateMeditationScript } from "@/services/meditationService";

interface MeditationLoadingProps {
  onComplete: (meditationData: any) => void;
  inputData: { name: string; text: string; duration: number; image?: File; };
}

export default function MeditationLoading({ onComplete, inputData }: MeditationLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [emotionAnalysis, setEmotionAnalysis] = useState<string>("");

  const steps = [
    { 
      title: "감정 분석 중", 
      description: "AI가 당신의 마음 상태를 분석하고 있습니다", 
      icon: Brain,
      action: "emotion"
    },
    { 
      title: "명상 스크립트 생성", 
      description: "맞춤형 명상 가이드를 작성하고 있습니다", 
      icon: FileText,
      action: "script"
    },
    { 
      title: "텍스트 포맷 준비", 
      description: "TTS를 위한 자연스러운 스크립트로 변환하고 있습니다", 
      icon: Volume2,
      action: "text"
    },
    { 
      title: "최종 준비", 
      description: "당신만의 명상이 거의 완성되었습니다", 
      icon: Sparkles,
      action: "complete"
    }
  ];

  useEffect(() => {
    const runMeditationGeneration = async () => {
      try {
        // 1단계: 감정 분석
        setCurrentStep(0);
        setProgress(0);
        
        const analysisResult = await analyzeEmotion(inputData);
        setEmotionAnalysis(analysisResult);
        setProgress(100);
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 2단계: 명상 스크립트 생성
        setCurrentStep(1);
        setProgress(0);
        
        const scriptResult = await generateMeditationScript(inputData);
        setProgress(100);
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3단계: 텍스트 포맷 준비
        setCurrentStep(2);
        setProgress(0);
        
        // 텍스트 포맷 처리 (이미 API에서 텍스트 형식으로 받음)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress(100);

        // 4단계: 완료
        setCurrentStep(3);
        setProgress(0);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(100);

        // 최종 데이터 생성
        const finalData = {
          emotionAnalysis,
          meditation: scriptResult,
          inputData
        };
        console.log('명상 생성 완료:', finalData);
        onComplete(finalData);

      } catch (error) {
        console.error('명상 생성 중 오류:', error);
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      }
    };

    runMeditationGeneration();
  }, [inputData, onComplete]);

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    window.location.reload(); // 간단한 재시도
  };

  const handleUseDemo = () => {
    // 데모 데이터로 진행
    const demoData = {
      emotionAnalysis: "오늘 하루의 스트레스와 피로가 느껴지시네요. 깊은 호흡과 함께하는 이완 명상을 추천드립니다.",
      meditation: {
        textContent: `**도입부**
안녕하세요, ${inputData.name}님. 오늘 함께 명상하는 시간을 가져보겠습니다... (3초 호흡)

편안한 자세로 앉아서... 천천히 눈을 감아주세요. (호흡)

**본 명상**
지금 이 순간, 깊고 천천히 숨을 들이마셔보세요... (10초 동안 조용히)

**마무리**
천천히 눈을 뜨시면서... 오늘 명상을 마무리하겠습니다.`
      },
      inputData
    };
    
    onComplete(demoData);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="border shadow-notion max-w-md w-full animate-scale-in">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full mx-auto mb-8 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-3">
              오류가 발생했습니다
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {error}
            </p>
            
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                다시 시도
              </Button>
              <Button variant="outline" onClick={handleUseDemo} className="w-full">
                데모 버전으로 계속
              </Button>
            </div>
            
            {error.includes('OpenAI API 키') && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left">
                <p className="text-sm text-muted-foreground">
                  <strong>참고:</strong> OpenAI API 키가 필요합니다. 
                  실제 사용을 위해서는 API 키를 설정해주세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {currentStepData?.description}
          </p>

          {/* 감정 분석 결과 표시 */}
          {emotionAnalysis && currentStep > 0 && (
            <div className="mb-8 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>감정 분석:</strong> {emotionAnalysis}
              </p>
            </div>
          )}

          {/* 프로그레스 바 */}
          <div className="space-y-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
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

          {/* 현재 진행 상태 */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {currentStep < 2 && "AI 분석 진행 중..."}
              {currentStep === 2 && "텍스트 포맷 준비 중..."}
              {currentStep === 3 && "완료!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}