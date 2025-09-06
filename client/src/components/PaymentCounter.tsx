import { CreditCard } from "lucide-react";

interface PaymentCounterProps {
  count: number;
}

export default function PaymentCounter({ count }: PaymentCounterProps) {
  return (
    <div className="text-center mb-8">
      <div className="mb-4">
        <CreditCard className="h-16 w-16 mx-auto text-primary" data-testid="counter-icon" />
      </div>
      <div 
        className="payment-counter text-6xl font-black mb-2" 
        data-testid="payment-counter-display"
      >
        {count}
      </div>
      <div className="text-2xl japanese-text text-muted-foreground font-medium" data-testid="counter-unit">
        回数
      </div>
      <div className="text-sm text-muted-foreground mt-2 japanese-text" data-testid="counter-description">
        残りのお支払い回数
      </div>
    </div>
  );
}
