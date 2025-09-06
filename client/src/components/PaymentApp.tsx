import { useState, useEffect } from "react";
import PaymentCounter from "./PaymentCounter";
import PaymentButtons from "./PaymentButtons";
import AudioManager from "./AudioManager";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Shield } from "lucide-react";
import { localStorageService } from "@/lib/localStorage";

export default function PaymentApp() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load count from localStorage on app start
    const savedCount = localStorageService.getPaymentCount();
    setCount(savedCount);
    setIsLoading(false);
  }, []);

  const updateCount = (newCount: number) => {
    setCount(newCount);
    localStorageService.setPaymentCount(newCount);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold japanese-text mb-2 text-primary">マカワンペイ</h1>
          <p className="text-muted-foreground japanese-text">簡単お支払いアプリ</p>
        </div>
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4"></div>
              <div className="h-8 w-24 bg-muted rounded mx-auto mb-2"></div>
              <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-8" data-testid="payment-app">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold japanese-text mb-2 text-primary" data-testid="app-title">
          マカワンペイ
        </h1>
        <p className="text-muted-foreground japanese-text" data-testid="app-subtitle">
          簡単お支払いアプリ
        </p>
      </div>

      {/* Main Payment Card */}
      <Card className="rounded-xl card-shadow border border-border">
        <CardContent className="p-8">
          {/* Payment Counter Display */}
          <PaymentCounter count={count} onCountUpdate={updateCount} />

          {/* Payment Status */}
          <div className="mb-6 p-3 bg-muted rounded-lg text-center" data-testid="payment-status">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="japanese-text text-sm">準備完了</span>
            </div>
          </div>

          {/* Action Buttons */}
          <PaymentButtons currentCount={count} onCountUpdate={updateCount} />

          {/* Google Pay Info */}
          <div className="mt-6 p-4 bg-muted rounded-lg" data-testid="payment-method-info">
            <div className="flex items-center gap-3">
              <div className="text-2xl text-primary font-bold">G</div>
              <div className="flex-1">
                <div className="text-sm font-medium japanese-text">Google Pay</div>
                <div className="text-xs text-muted-foreground">安全なお支払い</div>
              </div>
              <Shield className="h-5 w-5 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Manager */}
      <AudioManager />
    </div>
  );
}
