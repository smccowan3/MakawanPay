import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings, Upload, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/lib/localStorage";

export default function AudioManager() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [addPaymentAudioUrl, setAddPaymentAudioUrl] = useState("");
  const [paymentSuccessAudioUrl, setPaymentSuccessAudioUrl] = useState("");

  const addPaymentFileRef = useRef<HTMLInputElement>(null);
  const paymentSuccessFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load audio settings from localStorage on component mount
    const audioSettings = localStorageService.getAudioSettings();
    setAddPaymentAudioUrl(audioSettings.addPaymentAudioUrl || "");
    setPaymentSuccessAudioUrl(audioSettings.paymentSuccessAudioUrl || "");
  }, []);

  const handleFileUpload = (file: File, type: 'add' | 'success') => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "ファイルエラー",
        description: "音声ファイルを選択してください",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (type === 'add') {
        setAddPaymentAudioUrl(url);
        localStorageService.setAddPaymentAudio(url);
      } else {
        setPaymentSuccessAudioUrl(url);
        localStorageService.setPaymentSuccessAudio(url);
      }
      toast({
        title: "音声ファイル更新",
        description: "音声ファイルが更新されました",
      });
    };
    reader.readAsDataURL(file);
  };

  const testAudio = (audioId: string) => {
    const audio = document.getElementById(audioId) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        toast({
          title: "再生エラー",
          description: "音声の再生に失敗しました",
          variant: "destructive",
        });
      });
    }
  };

  return (
    <>
      {/* Audio elements for jingles */}
      <audio 
        id="addPaymentJingle" 
        preload="auto"
        data-testid="audio-add-payment"
        src={addPaymentAudioUrl}
      />
      
      <audio 
        id="paymentSuccessJingle" 
        preload="auto"
        data-testid="audio-payment-success"
        src={paymentSuccessAudioUrl}
      />

      {/* Audio Settings Dialog */}
      <div className="fixed bottom-4 right-4">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg"
              data-testid="button-audio-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="japanese-text">音声設定</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Add Payment Sound */}
              <div className="space-y-3">
                <Label className="text-sm font-medium japanese-text">
                  支払い追加音
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPaymentFileRef.current?.click()}
                    className="flex-1"
                    data-testid="button-upload-add-sound"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    ファイル選択
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => testAudio('addPaymentJingle')}
                    data-testid="button-test-add-sound"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={addPaymentFileRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'add');
                  }}
                />
              </div>

              {/* Payment Success Sound */}
              <div className="space-y-3">
                <Label className="text-sm font-medium japanese-text">
                  支払い完了音
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => paymentSuccessFileRef.current?.click()}
                    className="flex-1"
                    data-testid="button-upload-success-sound"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    ファイル選択
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => testAudio('paymentSuccessJingle')}
                    data-testid="button-test-success-sound"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={paymentSuccessFileRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'success');
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
