import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Settings } from "lucide-react";

interface MeditationInputProps {
  onGenerate: (data: { name: string; text: string; duration: number }) => void;
  onGoToSettings?: () => void;
}

export default function MeditationInput({ onGenerate, onGoToSettings }: MeditationInputProps) {
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const durations = [
    {
      value: 10,
      label: "10분",
      description: "간단한 휴식"
    },
    {
      value: 20,
      label: "20분", 
      description: "깊은 명상"
    },
    {
      value: 30,
      label: "30분",
      description: "완전한 이완"
    }
  ];

  const handleGenerate = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!text.trim()) {
      alert("일기를 작성해주세요.");
      return;
    }
    onGenerate({ name: name.trim(), text: text.trim(), duration: selectedDuration });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12 relative">
          {onGoToSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoToSettings}
              className="absolute right-0 top-0"
            >
              <Settings className="w-4 h-4 mr-2" />
              API 키 설정
            </Button>
          )}
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            명상 만들기
          </h1>
          <p className="text-lg text-muted-foreground">
            당신의 마음 상태를 알려주세요
          </p>
        </div>

        {/* 명상 시간 선택 */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            {durations.map(duration => (
              <Button 
                key={duration.value}
                variant={selectedDuration === duration.value ? "default" : "outline"}
                className="flex flex-col gap-2 h-auto py-6"
                onClick={() => setSelectedDuration(duration.value)}
              >
                <span className="text-xl font-bold">{duration.label}</span>
                <span className="text-sm opacity-80">{duration.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* 이름 입력 */}
        <div className="mb-8">
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-3">
            이름
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
            className="text-base"
            maxLength={20}
          />
        </div>

        {/* 일기 입력창 */}
        <div className="mb-8">
          <label htmlFor="diary" className="block text-sm font-medium text-foreground mb-3">
            오늘의 일기
          </label>
          <Textarea
            id="diary"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="오늘 하루 어떠셨나요? 지금 느끼는 감정이나 생각을 자유롭게 적어보세요..."
            className="min-h-[200px] text-base leading-relaxed resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-muted-foreground">
              일기를 바탕으로 개인화된 명상을 만들어드립니다
            </p>
            <span className="text-sm text-muted-foreground">
              {text.length}/1000
            </span>
          </div>
        </div>

        {/* 생성 버튼 */}
        <Button 
          size="lg" 
          onClick={handleGenerate}
          disabled={!name.trim() || !text.trim()}
          className="w-full text-lg py-6"
        >
          명상 만들기
        </Button>
      </div>
    </div>
  );
}