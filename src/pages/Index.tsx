import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import MeditationInput from "@/components/MeditationInput";
import MeditationLoading from "@/components/MeditationLoading";
import MeditationPlayer from "@/components/MeditationPlayer";

type AppState = 'splash' | 'input' | 'loading' | 'player';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('splash');
  const [inputData, setInputData] = useState<any>(null);
  const [meditationData, setMeditationData] = useState<any>(null);

  const handleSplashComplete = () => {
    setCurrentState('input');
  };

  const handleGenerate = (data: any) => {
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
