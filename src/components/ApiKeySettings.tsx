import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeySettingsProps {
  onSave: (apiKey: string) => void;
  onSkip?: () => void;
}

export default function ApiKeySettings({ onSave, onSkip }: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setError('올바른 OpenAI API 키 형식이 아닙니다.');
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    onSave(apiKey);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-lg shadow-notion">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">OpenAI API 키 설정</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            개인화된 명상 경험을 위해 OpenAI API 키가 필요합니다.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              API 키는 브라우저의 로컬 저장소에만 저장되며, 외부로 전송되지 않습니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              OpenAI API 키
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              className="font-mono text-sm"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <Button 
              onClick={handleSave} 
              className="w-full"
              size="lg"
            >
              저장하고 시작하기
            </Button>
            
            {onSkip && (
              <Button 
                onClick={handleSkip} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                나중에 설정하기
              </Button>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground leading-relaxed">
              OpenAI API 키는{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI 플랫폼
              </a>
              에서 발급받을 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}