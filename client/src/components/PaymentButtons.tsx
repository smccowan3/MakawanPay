import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useGooglePay } from "@/hooks/useGooglePay";

interface PaymentButtonsProps {
  currentCount: number;
}

export default function PaymentButtons({ currentCount }: PaymentButtonsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { processPayment, isGooglePayReady } = useGooglePay();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const addPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payment-counter/default/add");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-counter/default"] });
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
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "支払い追加に失敗しました",
        variant: "destructive",
      });
    },
  });

  const makePaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payment-counter/default/pay", {
        amount: 100, // Default amount - in real app this would be configurable
        currency: "JPY",
        paymentData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-counter/default"] });
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
    },
    onError: (error: any) => {
      toast({
        title: "お支払いエラー",
        description: error.message || "お支払い処理に失敗しました",
        variant: "destructive",
      });
    },
  });

  const handleAddPayment = () => {
    addPaymentMutation.mutate();
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
        makePaymentMutation.mutate(paymentData);
      }
    } catch (error) {
      toast({
        title: "お支払いエラー",
        description: "Google Pay での支払いに失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const isAddPaymentLoading = addPaymentMutation.isPending;
  const isMakePaymentDisabled = currentCount <= 0 || isPaymentProcessing || makePaymentMutation.isPending || !isGooglePayReady;

  return (
    <div className="space-y-4">
      {/* Add Payment Button */}
      <Button
        onClick={handleAddPayment}
        disabled={isAddPaymentLoading}
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-4 px-6 rounded-lg button-elevation japanese-text text-lg h-auto"
        data-testid="button-add-payment"
      >
        <div className="flex items-center justify-center gap-3">
          {isAddPaymentLoading ? (
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
          {(isPaymentProcessing || makePaymentMutation.isPending) ? (
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
