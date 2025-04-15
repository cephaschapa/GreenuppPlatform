import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Factory } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

interface MetatronPaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
  cartId: number;
}

export function MetatronPayment({ 
  onSuccess, 
  onCancel,
  amount,
  cartId
}: MetatronPaymentProps) {
  const { createMetatronPayment } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!cartId) {
      toast({
        title: "Payment error",
        description: "Cart information is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await createMetatronPayment();
      
      // In a production app, we would redirect to Metatron's payment page
      // using the redirectUrl from the response
      // window.location.href = response.redirectUrl;
      
      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully via Metatron Pay!",
        });
        setIsProcessing(false);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast({
        title: "Payment error",
        description: err.message || "There was a problem processing your payment.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-900">
        <div className="flex items-center gap-3 mb-3">
          <Factory className="h-5 w-5 text-green-600 dark:text-green-500" />
          <h3 className="font-medium text-green-800 dark:text-green-500">Metatron Pay</h3>
        </div>
        <p className="text-green-700 dark:text-green-400 text-sm mb-4">
          Fast, secure payments through the Metatron Technologies network.
        </p>
        <div className="bg-white dark:bg-green-950/50 p-4 rounded border border-green-200 dark:border-green-800 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">ZMW {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Payment method:</span>
            <span className="font-medium">Metatron Pay</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing fee:</span>
            <span className="font-medium">ZMW 0.00</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="text-destructive text-sm mt-2">
          {error}
        </div>
      )}
      
      <div className="flex justify-between gap-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button 
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className="min-w-[150px] bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ZMW ${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}