import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

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
  const { createMetatronPayment, confirmPayment } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

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
      // Call our API to create a Metatron payment intent
      const paymentData = await createMetatronPayment();
      
      // For this custom payment system, we'd need to either:
      // 1. Redirect to an external payment page, or
      // 2. Simulate the payment flow for demo/placeholder purposes
      
      // Here we'll simulate option 2 for the placeholder/demo
      // In a real implementation, you might redirect to paymentData.redirectUrl
      
      setRedirectUrl(paymentData.redirectUrl);
      
      // Simulate processing
      setTimeout(() => {
        // Confirm the payment
        confirmPayment(paymentData.paymentId, 'metatron')
          .then(result => {
            if (result.success) {
              toast({
                title: "Payment Successful",
                description: "Your payment has been processed successfully with Metatron Pay.",
              });
              onSuccess?.();
            } else {
              setError("Payment verification failed. Please try again.");
              toast({
                title: "Payment Failed",
                description: "Payment verification failed. Please try again.",
                variant: "destructive",
              });
            }
            setIsProcessing(false);
          })
          .catch(err => {
            setError(err.message || "Payment processing failed");
            toast({
              title: "Payment Error",
              description: err.message || "Payment processing failed",
              variant: "destructive",
            });
            setIsProcessing(false);
          });
      }, 2000); // Simulate a 2-second payment process
      
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
      toast({
        title: "Payment Error",
        description: err.message || "Failed to initialize payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // If we have a redirect URL and want to simulate a redirect
  if (redirectUrl && !error && isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="rounded-full bg-primary/10 p-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Processing your payment</h3>
        <p className="text-muted-foreground">Please wait while we process your payment with Metatron Pay...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-md">
        <p className="text-sm text-muted-foreground">
          You'll be charged <span className="font-semibold">ZMW {amount.toFixed(2)}</span> for this purchase. 
          Your payment will be securely processed by Metatron Pay.
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-primary-foreground border rounded-md p-6 space-y-4">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-xl">
            MP
          </div>
        </div>
        
        <h3 className="text-center font-semibold">Metatron Pay</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">ZMW {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment method:</span>
            <span className="font-medium">Metatron Pay</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel?.()}
          disabled={isProcessing}
        >
          Back
        </Button>
        
        <Button onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay with Metatron Pay`
          )}
        </Button>
      </div>
    </div>
  );
}