import { useState } from "react";
import { CreditCard, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PaymentCounterProps {
  count: number;
  onCountUpdate: (newCount: number) => void;
}

export default function PaymentCounter({ count, onCountUpdate }: PaymentCounterProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCount, setNewCount] = useState(count.toString());
  const { toast } = useToast();

  const handleUpdateCounter = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(newCount);
    if (isNaN(value) || value < 0) {
      toast({
        title: "入力エラー",
        description: "0以上の数値を入力してください",
        variant: "destructive",
      });
      return;
    }
    
    onCountUpdate(value);
    toast({
      title: "カウンター更新完了",
      description: "支払い回数が更新されました",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="text-center mb-8">
      <div className="mb-4">
        <CreditCard className="h-16 w-16 mx-auto text-primary" data-testid="counter-icon" />
      </div>
      <div className="relative">
        <div 
          className="payment-counter text-6xl font-black mb-2" 
          data-testid="payment-counter-display"
        >
          {count}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-2 top-2 h-8 w-8 p-0 hover:bg-muted"
              data-testid="button-edit-counter"
              onClick={() => setNewCount(count.toString())}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="japanese-text">回数を編集</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCounter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="counter-value" className="japanese-text">
                  新しい回数
                </Label>
                <Input
                  id="counter-value"
                  type="number"
                  min="0"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  data-testid="input-counter-value"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 japanese-text"
                  data-testid="button-save-counter"
                >
                  更新
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 japanese-text"
                  data-testid="button-cancel-counter"
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
