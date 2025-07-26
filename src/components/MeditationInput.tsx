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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleGenerate = () => {
    if (text.trim()) {
      onGenerate({
        text: text.trim(),
        duration: selectedDuration,
        image: selectedFile || undefined
      });
    }
  };
  const isValid = text.trim().length > 0;
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

        {/* 명상 시간 선택 */}
        <Card className="mb-8 shadow-notion border animate-fade-in">
          <CardHeader className="pb-4">
            
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

        {/* ChatGPT 스타일 입력창 */}
        <div className="mb-8">
          <div className="border border-border rounded-2xl bg-card shadow-sm">
            <div className="relative">
              <Textarea placeholder="오늘 되돌아보고 싶은 생각과 감정을 작성하세요..." value={text} onChange={e => setText(e.target.value)} className="min-h-24 resize-none border-0 focus-visible:ring-0 text-base p-4 rounded-2xl" maxLength={500} />
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-upload-inline" />
                  <label htmlFor="image-upload-inline">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" asChild>
                      <div className="cursor-pointer">
                        <Image className="w-4 h-4" />
                      </div>
                    </Button>
                  </label>
                  {selectedFile && <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📎 {selectedFile.name}</span>
                      <button onClick={() => setSelectedFile(null)} className="text-xs hover:text-foreground">
                        ×
                      </button>
                    </div>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {text.length}/500
                  </span>
                  <Button size="sm" onClick={handleGenerate} disabled={!isValid} className="h-8 px-3 text-sm">
                    전송
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}