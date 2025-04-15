import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
}

export function StripePayment({ 
  onSuccess, 
  onCancel,
  amount 
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment error",
        description: "Stripe has not been loaded properly.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/dashboard/marketplace/payment/confirmation',
        },
        redirect: 'if_required'
      });

      if (error) {
        setPaymentError(error.message || 'An unexpected error occurred.');
        toast({
          title: "Payment failed",
          description: error.message || "Your payment could not be processed.",
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        if (onSuccess) {
          onSuccess();
        }
        toast({
          title: "Payment successful",
          description: "Your payment has been processed successfully!",
        });
      }
    } catch (err: any) {
      setPaymentError(err.message || 'An unexpected error occurred.');
      toast({
        title: "Payment error",
        description: err.message || "There was a problem processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          }
        }}
      />
      
      {paymentError && (
        <div className="text-destructive text-sm mt-2">
          {paymentError}
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
          type="submit" 
          disabled={!stripe || isProcessing}
          className="min-w-[150px]"
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
    </form>
  );
}