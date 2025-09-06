import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings, Upload, Play, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { hybridStorageService } from "@/lib/hybridStorage";
import donaldDuckCharge from "@assets/donald-duck-1-104310_1757122214346.mp3";
import quackingSound from "@assets/quacking-sound-for-duck-96140_1757122228535.mp3";

export default function AudioManager() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [addPaymentAudioUrl, setAddPaymentAudioUrl] = useState(donaldDuckCharge);
  const [paymentSuccessAudioUrl, setPaymentSuccessAudioUrl] = useState(quackingSound);

  const addPaymentFileRef = useRef<HTMLInputElement>(null);
  const paymentSuccessFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Default Donald Duck sounds
  const defaultSounds = {
    addPayment: donaldDuckCharge,
    paymentSuccess: quackingSound,
  };

  useEffect(() => {
    // Load audio settings from hybrid storage or use Donald Duck defaults
    const loadAudioSettings = async () => {
      try {
        const audioSettings = await hybridStorageService.getAudioSettings();
        setAddPaymentAudioUrl(audioSettings.addPaymentAudioUrl || defaultSounds.addPayment);
        setPaymentSuccessAudioUrl(audioSettings.paymentSuccessAudioUrl || defaultSounds.paymentSuccess);
        
        // Set defaults if nothing is stored
        if (!audioSettings.addPaymentAudioUrl) {
          await hybridStorageService.setAddPaymentAudio(defaultSounds.addPayment);
        }
        if (!audioSettings.paymentSuccessAudioUrl) {
          await hybridStorageService.setPaymentSuccessAudio(defaultSounds.paymentSuccess);
        }
      } catch (error) {
        console.error('Failed to load audio settings:', error);
        // Fallback to defaults
        setAddPaymentAudioUrl(defaultSounds.addPayment);
        setPaymentSuccessAudioUrl(defaultSounds.paymentSuccess);
      }
    };
    
    loadAudioSettings();
  }, []);

  const handleFileUpload = async (file: File, type: 'add' | 'success') => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "ファイルエラー",
        description: "音声ファイルを選択してください",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      try {
        if (type === 'add') {
          setAddPaymentAudioUrl(url);
          await hybridStorageService.setAddPaymentAudio(url);
        } else {
          setPaymentSuccessAudioUrl(url);
          await hybridStorageService.setPaymentSuccessAudio(url);
        }
        toast({
          title: "音声ファイル更新",
          description: "音声ファイルが更新されました",
        });
      } catch (error) {
        toast({
          title: "エラー",
          description: "音声ファイルの保存に失敗しました",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const resetToDefaults = async () => {
    try {
      setAddPaymentAudioUrl(defaultSounds.addPayment);
      setPaymentSuccessAudioUrl(defaultSounds.paymentSuccess);
      await hybridStorageService.setAddPaymentAudio(defaultSounds.addPayment);
      await hybridStorageService.setPaymentSuccessAudio(defaultSounds.paymentSuccess);
      toast({
        title: "デフォルト音声に復元",
        description: "ドナルドダック音声に戻しました",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "デフォルト音声の復元に失敗しました",
        variant: "destructive",
      });
    }
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
              {/* Reset to Defaults Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="gap-2 japanese-text"
                  data-testid="button-reset-audio"
                >
                  <RotateCcw className="h-4 w-4" />
                  ドナルドダック音声に戻す
                </Button>
              </div>

              {/* Add Payment Sound */}
              <div className="space-y-3">
                <Label className="text-sm font-medium japanese-text">
                  支払い追加音 (現在: ドナルドダック)
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
                  支払い完了音 (現在: ガーガー音)
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