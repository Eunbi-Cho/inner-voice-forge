import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Type, BookOpen, Image, Clock } from "lucide-react";

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
    { type: 'text' as const, label: '감정 텍스트', icon: Type },
    { type: 'diary' as const, label: '일기', icon: BookOpen },
    { type: 'image' as const, label: '이미지', icon: Image }
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            명상 만들기
          </h1>
          <p className="text-lg text-muted-foreground">
            당신의 마음 상태를 알려주세요
          </p>
        </div>

        {/* 입력 타입 선택 */}
        <Card className="mb-8 shadow-notion border animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">무엇을 공유하고 싶나요?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {inputTypes.map((type) => (
                <Button
                  key={type.type}
                  variant={inputType === type.type ? "default" : "outline"}
                  className="flex flex-col gap-3 h-auto py-6"
                  onClick={() => setInputType(type.type)}
                >
                  <type.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{type.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 내용 입력 */}
        <Card className="mb-8 shadow-notion border animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">
              {inputType === 'text' && '지금 어떤 기분인가요?'}
              {inputType === 'diary' && '오늘의 일기를 적어보세요'}
              {inputType === 'image' && '마음을 담은 이미지를 선택해주세요'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inputType !== 'image' ? (
              <div className="space-y-3">
                <Textarea
                  placeholder={
                    inputType === 'text' 
                      ? "예: 오늘 일이 너무 많아서 스트레스를 받고 있어요. 마음이 복잡하고 피곤해요."
                      : "오늘 하루 어떤 일이 있었는지, 어떤 감정을 느꼈는지 자유롭게 적어보세요."
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-32 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {text.length}/500
                  </span>
                </div>
              </div>
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
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-smooth">
                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full mx-auto flex items-center justify-center">
                          ✓
                        </div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">클릭하여 다른 이미지 선택</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Image className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="font-medium">이미지를 선택해주세요</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG 파일 지원</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 명상 시간 선택 */}
        <Card className="mb-12 shadow-notion border animate-fade-in">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              명상 시간을 선택하세요
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {durations.map((duration) => (
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
          </CardContent>
        </Card>

        {/* 생성 버튼 */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!isValid}
            className="text-lg px-10 py-6 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            명상 생성하기
          </Button>
          {!isValid && (
            <p className="text-sm text-muted-foreground mt-4">
              {inputType === 'image' ? '이미지를 선택해주세요' : '내용을 입력해주세요'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}