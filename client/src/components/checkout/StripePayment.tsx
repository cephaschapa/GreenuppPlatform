import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
}

export function StripePayment({ onSuccess, onCancel, amount }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check for payment intent status on return from redirect
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;
      
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          onSuccess && onSuccess();
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/marketplace/payment/confirmation`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.message || "An unexpected error occurred"
        });
      } else {
        setMessage("An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: "An unexpected error occurred"
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Card Payment</h3>
        <div className="p-4 bg-card border rounded-md">
          <PaymentElement id="payment-element" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Billing Address</h3>
        <div className="p-4 bg-card border rounded-md">
          <AddressElement options={{ mode: 'billing' }} />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Total amount:</span>
          <span className="font-medium">ZMW {amount.toFixed(2)}</span>
        </div>

        <Button 
          disabled={isLoading || !stripe || !elements} 
          type="submit"
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            `Pay ZMW ${amount.toFixed(2)}`
          )}
        </Button>

        <Button 
          variant="outline" 
          type="button" 
          onClick={onCancel}
          className="w-full"
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-secondary rounded-md text-sm">
          {message}
        </div>
      )}
    </form>
  );
}