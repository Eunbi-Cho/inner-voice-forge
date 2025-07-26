import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import ApiKeySettings from "@/components/ApiKeySettings";
import MeditationInput from "@/components/MeditationInput";
import MeditationLoading from "@/components/MeditationLoading";
import MeditationPlayer from "@/components/MeditationPlayer";

type AppState = 'splash' | 'apiKey' | 'input' | 'loading' | 'player';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('splash');
  const [inputData, setInputData] = useState<any>(null);
  const [meditationData, setMeditationData] = useState<any>(null);

  const handleSplashComplete = () => {
    // API 키가 이미 설정되어 있는지 확인
    const existingApiKey = localStorage.getItem('openai_api_key');
    if (existingApiKey) {
      setCurrentState('input');
    } else {
      setCurrentState('apiKey');
    }
  };

  const handleApiKeySave = (apiKey: string) => {
    setCurrentState('input');
  };

  const handleApiKeySkip = () => {
    setCurrentState('input');
  };

  const handleGenerate = (data: { name: string; text: string; duration: number }) => {
    setInputData(data);
    setCurrentState('loading');
  };

  const handleLoadingComplete = (data: any) => {
    setMeditationData(data);
    setCurrentState('player');
  };

  const handleBack = () => {
    setCurrentState('input');
    setInputData(null);
    setMeditationData(null);
  };

  return (
    <div className="min-h-screen">
      {currentState === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {currentState === 'apiKey' && (
        <ApiKeySettings 
          onSave={handleApiKeySave} 
          onSkip={handleApiKeySkip}
        />
      )}
      
      {currentState === 'input' && (
        <MeditationInput onGenerate={handleGenerate} />
      )}
      
      {currentState === 'loading' && inputData && (
        <MeditationLoading 
          inputData={inputData} 
          onComplete={handleLoadingComplete} 
        />
      )}
      
      {currentState === 'player' && meditationData && (
        <MeditationPlayer 
          meditationData={meditationData} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
};

export default Index;
