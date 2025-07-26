import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MeditationInputProps {
  onGenerate: (data: { text: string; duration: number; image?: File }) => void;
}

export default function MeditationInput({ onGenerate }: MeditationInputProps) {
  const [text, setText] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<'text' | 'diary' | 'image'>('text');

  const durations = [
    { value: 10, label: "10분", description: "간단한 휴식" },
    { value: 20, label: "20분", description: "깊은 명상" },
    { value: 30, label: "30분", description: "완전한 이완" }
  ];

  const inputTypes = [
    { type: 'text' as const, label: '감정 텍스트', icon: '✍️' },
    { type: 'diary' as const, label: '일기', icon: '📖' },
    { type: 'image' as const, label: '이미지', icon: '🖼️' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleGenerate = () => {
    if ((inputType !== 'image' && text.trim()) || (inputType === 'image' && selectedFile)) {
      onGenerate({
        text: text.trim(),
        duration: selectedDuration,
        image: selectedFile || undefined
      });
    }
  };

  const isValid = (inputType !== 'image' && text.trim().length > 0) || (inputType === 'image' && selectedFile);

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            명상 만들기
          </h1>
          <p className="text-muted-foreground">
            당신의 마음 상태를 알려주세요
          </p>
        </div>

        {/* 입력 타입 선택 */}
        <Card className="bg-gradient-card shadow-card-soft border-0 mb-6 animate-scale-up">
          <CardHeader>
            <CardTitle className="text-center text-lg">무엇을 공유하고 싶나요?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {inputTypes.map((type) => (
                <Button
                  key={type.type}
                  variant={inputType === type.type ? "meditation" : "soft"}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setInputType(type.type)}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 내용 입력 */}
        <Card className="bg-gradient-card shadow-card-soft border-0 mb-6 animate-scale-up">
          <CardHeader>
            <CardTitle className="text-lg">
              {inputType === 'text' && '지금 어떤 기분인가요?'}
              {inputType === 'diary' && '오늘의 일기를 적어보세요'}
              {inputType === 'image' && '마음을 담은 이미지를 선택해주세요'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inputType !== 'image' ? (
              <Textarea
                placeholder={
                  inputType === 'text' 
                    ? "예: 오늘 일이 너무 많아서 스트레스를 받고 있어요. 마음이 복잡하고 피곤해요."
                    : "오늘 하루 어떤 일이 있었는지, 어떤 감정을 느꼈는지 자유롭게 적어보세요."
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-32 resize-none border-0 bg-background/50 focus:bg-background transition-smooth"
                maxLength={500}
              />
            ) : (
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-smooth bg-background/50">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="text-green-600 text-4xl">✓</div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">클릭하여 다른 이미지 선택</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl">🖼️</div>
                        <p className="text-sm font-medium">이미지를 선택해주세요</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG 파일 지원</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
            {inputType !== 'image' && (
              <div className="flex justify-end mt-2">
                <span className="text-xs text-muted-foreground">
                  {text.length}/500
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 명상 시간 선택 */}
        <Card className="bg-gradient-card shadow-card-soft border-0 mb-8 animate-scale-up">
          <CardHeader>
            <CardTitle className="text-lg">명상 시간을 선택하세요</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {durations.map((duration) => (
                <Button
                  key={duration.value}
                  variant={selectedDuration === duration.value ? "meditation" : "soft"}
                  className="flex flex-col gap-2 h-auto py-6"
                  onClick={() => setSelectedDuration(duration.value)}
                >
                  <span className="text-2xl font-bold">{duration.label}</span>
                  <span className="text-xs opacity-80">{duration.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 생성 버튼 */}
        <div className="text-center">
          <Button
            variant="meditation"
            size="lg"
            onClick={handleGenerate}
            disabled={!isValid}
            className="text-lg px-12 py-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🧘‍♀️ 명상 생성하기
          </Button>
          {!isValid && (
            <p className="text-sm text-muted-foreground mt-3">
              {inputType === 'image' ? '이미지를 선택해주세요' : '내용을 입력해주세요'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}