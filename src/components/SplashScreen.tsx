import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Clock } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState(0);
  const [showPermissions, setShowPermissions] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "AI 기반 감정 분석",
      description: "당신의 마음 상태를 분석하여 맞춤형 명상을 제공합니다"
    },
    {
      icon: Sparkles,
      title: "개인화된 경험",
      description: "텍스트, 이미지, 일기를 통해 당신만의 명상을 만들어보세요"
    },
    {
      icon: Clock,
      title: "유연한 시간 선택",
      description: "10분, 20분, 30분 중 선택하여 바로 명상을 시작하세요"
    }
  ];

  const handleGetStarted = async () => {
    setShowPermissions(true);
    // 마이크 권한 요청 (추후 TTS 기능을 위해)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // 3초 후 자동 진입
      setTimeout(onComplete, 3000);
    } catch (error) {
      console.log("오디오 권한이 거부되었습니다:", error);
      // 권한이 없어도 3초 후 진입
      setTimeout(onComplete, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {!showPermissions ? (
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-8 flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-6xl font-bold text-foreground mb-4 tracking-tight">
              Re:Mind
            </h1>
            <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
              AI가 만드는 나만의 명상 경험
            </p>
          </div>

          {/* 기능 소개 */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-lg p-8 shadow-notion hover:shadow-notion-hover transition-notion animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className="w-8 h-8 text-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* 시작 버튼 */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-8 py-6 h-auto animate-scale-in"
            >
              시작하기
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              5초 이내로 바로 시작할 수 있습니다
            </p>
          </div>
        </div>
      ) : (
        // 권한 요청 및 로딩
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="bg-card border border-border rounded-lg p-12 max-w-md w-full shadow-notion animate-scale-in text-center">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              설정 중
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              더 나은 명상 경험을 위해 시스템을 준비하고 있습니다.
            </p>
            
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: '70%' }}></div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              곧 명상 공간으로 이동합니다...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}