import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Type, BookOpen, Image, Clock } from "lucide-react";
interface MeditationInputProps {
  onGenerate: (data: {
    text: string;
    duration: number;
    image?: File;
  }) => void;
}
export default function MeditationInput({
  onGenerate
}: MeditationInputProps) {
  const [text, setText] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<'text' | 'diary' | 'image'>('text');
  const durations = [{
    value: 10,
    label: "10분",
    description: "간단한 휴식"
  }, {
    value: 20,
    label: "20분",
    description: "깊은 명상"
  }, {
    value: 30,
    label: "30분",
    description: "완전한 이완"
  }];
  const inputTypes = [{
    type: 'text' as const,
    label: '감정 텍스트',
    icon: Type
  }, {
    type: 'diary' as const,
    label: '일기',
    icon: BookOpen
  }, {
    type: 'image' as const,
    label: '이미지',
    icon: Image
  }];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleGenerate = () => {
    if (inputType !== 'image' && text.trim() || inputType === 'image' && selectedFile) {
      onGenerate({
        text: text.trim(),
        duration: selectedDuration,
        image: selectedFile || undefined
      });
    }
  };
  const isValid = inputType !== 'image' && text.trim().length > 0 || inputType === 'image' && selectedFile;
  return <div className="min-h-screen bg-background">
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
            <CardTitle className="text-xl font-semibold">오늘 되돌아 보고 싶은 생각과 감정이 무엇인가요?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {inputTypes.map(type => <Button key={type.type} variant={inputType === type.type ? "default" : "outline"} className="flex flex-col gap-3 h-auto py-6" onClick={() => setInputType(type.type)}>
                  <type.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{type.label}</span>
                </Button>)}
            </div>
          </CardContent>
        </Card>

        {/* ChatGPT 스타일 입력창 */}
        <div className="mb-8">
          <div className="border border-border rounded-2xl bg-card shadow-sm">
            {inputType !== 'image' ? (
              <div className="relative">
                <Textarea 
                  placeholder={inputType === 'text' 
                    ? "오늘 되돌아보고 싶은 생각과 감정을 작성하세요..." 
                    : "오늘 하루 어떤 일이 있었는지, 어떤 감정을 느꼈는지 자유롭게 적어보세요..."
                  }
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="min-h-24 resize-none border-0 focus-visible:ring-0 text-base p-4 rounded-2xl"
                  maxLength={500}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      id="image-upload-inline" 
                    />
                    <label htmlFor="image-upload-inline">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" asChild>
                        <div className="cursor-pointer">
                          <Image className="w-4 h-4" />
                        </div>
                      </Button>
                    </label>
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>📎 {selectedFile.name}</span>
                        <button 
                          onClick={() => setSelectedFile(null)}
                          className="text-xs hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {text.length}/500
                    </span>
                    <Button 
                      size="sm" 
                      onClick={handleGenerate} 
                      disabled={!isValid}
                      className="h-8 px-3 text-sm"
                    >
                      전송
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-upload" />
                <label htmlFor="image-upload">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-smooth">
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
                {selectedFile && (
                  <div className="mt-4 flex justify-center">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={!isValid}
                      className="px-6"
                    >
                      명상 생성하기
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

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
              {durations.map(duration => <Button key={duration.value} variant={selectedDuration === duration.value ? "default" : "outline"} className="flex flex-col gap-2 h-auto py-6" onClick={() => setSelectedDuration(duration.value)}>
                  <span className="text-xl font-bold">{duration.label}</span>
                  <span className="text-sm opacity-80">{duration.description}</span>
                </Button>)}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>;
}