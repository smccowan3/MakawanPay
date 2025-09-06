import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGooglePay } from "@/hooks/useGooglePay";
import { localStorageService } from "@/lib/localStorage";

interface PaymentButtonsProps {
  currentCount: number;
  onCountUpdate: (newCount: number) => void;
}

export default function PaymentButtons({ currentCount, onCountUpdate }: PaymentButtonsProps) {
  const { toast } = useToast();
  const { processPayment, isGooglePayReady } = useGooglePay();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const handleAddPayment = async () => {
    setIsAddingPayment(true);
    
    try {
      const newCount = localStorageService.incrementPaymentCount();
      onCountUpdate(newCount);
      
      toast({
        title: "支払い追加完了",
        description: "支払い回数が追加されました",
      });
      
      // Play add payment jingle
      const audio = document.getElementById("addPaymentJingle") as HTMLAudioElement;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          console.log("Audio playback prevented by browser policy");
        });
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "支払い追加に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleMakePayment = async () => {
    if (currentCount <= 0 || isPaymentProcessing) return;

    setIsPaymentProcessing(true);
    
    try {
      const paymentData = await processPayment({
        amount: 100,
        currency: "JPY",
      });
      
      if (paymentData) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newCount = localStorageService.decrementPaymentCount();
        onCountUpdate(newCount);
        
        toast({
          title: "お支払い完了",
          description: "お支払いが正常に処理されました",
        });
        
        // Play payment success jingle
        const audio = document.getElementById("paymentSuccessJingle") as HTMLAudioElement;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {
            console.log("Audio playback prevented by browser policy");
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "お支払いエラー",
        description: error.message || "Google Pay での支払いに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const isMakePaymentDisabled = currentCount <= 0 || isPaymentProcessing || !isGooglePayReady;

  return (
    <div className="space-y-4">
      {/* Add Payment Button */}
      <Button
        onClick={handleAddPayment}
        disabled={isAddingPayment}
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-4 px-6 rounded-lg button-elevation japanese-text text-lg h-auto"
        data-testid="button-add-payment"
      >
        <div className="flex items-center justify-center gap-3">
          {isAddingPayment ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          <span>支払い追加</span>
        </div>
      </Button>

      {/* Make Payment Button */}
      <Button
        onClick={handleMakePayment}
        disabled={isMakePaymentDisabled}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-lg button-elevation japanese-text text-lg h-auto disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="button-make-payment"
      >
        <div className="flex items-center justify-center gap-3">
          {isPaymentProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>処理中...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>お支払い実行</span>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}
