import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/meditation-hero.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState(0);
  const [showPermissions, setShowPermissions] = useState(false);

  const features = [
    {
      title: "마음의 평화",
      description: "AI가 당신의 감정을 분석하여 맞춤형 명상을 제공합니다"
    },
    {
      title: "개인화된 경험",
      description: "텍스트, 이미지, 일기를 통해 당신만의 명상을 만들어보세요"
    },
    {
      title: "즉시 시작",
      description: "10분, 20분, 30분 중 선택하여 바로 명상을 시작하세요"
    }
  ];

  const handleGetStarted = async () => {
    setShowPermissions(true);
    // 마이크 권한 요청 (추후 TTS 기능을 위해)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // 5초 후 자동 진입
      setTimeout(onComplete, 5000);
    } catch (error) {
      console.log("오디오 권한이 거부되었습니다:", error);
      // 권한이 없어도 5초 후 진입
      setTimeout(onComplete, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background flex flex-col">
      {!showPermissions ? (
        <>
          {/* 히어로 섹션 */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="relative mb-8">
              <img 
                src={heroImage} 
                alt="Re:Mind 명상" 
                className="w-80 h-48 object-cover rounded-3xl shadow-meditation animate-float"
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-3xl"></div>
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 animate-scale-up">
              Re:Mind
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-md animate-scale-up">
              AI가 만드는 나만의 명상 경험
            </p>

            {/* 기능 소개 */}
            <div className="grid gap-6 mb-12 max-w-2xl">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-gradient-card p-6 rounded-2xl shadow-card-soft animate-scale-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <Button 
              variant="meditation" 
              size="lg" 
              onClick={handleGetStarted}
              className="text-lg px-12 py-6 rounded-full animate-pulse-soft"
            >
              시작하기
            </Button>
          </div>
        </>
      ) : (
        // 권한 요청 및 로딩
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-gradient-card p-8 rounded-3xl shadow-card-soft max-w-md animate-scale-up">
            <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-soft">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              설정 중...
            </h2>
            <p className="text-muted-foreground mb-6">
              더 나은 명상 경험을 위해 오디오 권한을 확인하고 있습니다.
            </p>
            
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div className="bg-gradient-primary h-2 rounded-full transition-smooth animate-pulse-soft" style={{ width: '60%' }}></div>
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