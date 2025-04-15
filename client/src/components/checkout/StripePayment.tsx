import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StripePaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
}

export function StripePayment({ onSuccess, onCancel, amount }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { confirmPayment } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Confirm the payment with Stripe.js
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/marketplace/payment/confirmation`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      // Show error to your customer
      setError(result.error.message || 'An error occurred with your payment');
      toast({
        title: 'Payment Failed',
        description: result.error.message || 'An error occurred with your payment',
        variant: 'destructive',
      });
      setIsProcessing(false);
    } else if (result.paymentIntent) {
      // The payment has been processed!
      try {
        const confirmResult = await confirmPayment(result.paymentIntent.id, 'stripe');
        
        if (confirmResult.success) {
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been completed successfully',
          });
          onSuccess?.();
        } else {
          setError('Payment was processed, but verification failed. Please contact support.');
          toast({
            title: 'Verification Failed',
            description: 'Payment was processed, but verification failed. Please contact support.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify payment');
        toast({
          title: 'Verification Error',
          description: err.message || 'Failed to verify payment',
          variant: 'destructive',
        });
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-md">
        <p className="text-sm text-muted-foreground">
          You'll be charged <span className="font-semibold">ZMW {amount.toFixed(2)}</span> for this purchase. 
          Your payment information is securely processed by Stripe.
        </p>
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel?.()}
            disabled={isProcessing}
          >
            Back
          </Button>
          
          <Button type="submit" disabled={!stripe || isProcessing}>
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
      </form>
    </div>
  );
}