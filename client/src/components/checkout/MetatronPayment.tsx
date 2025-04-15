import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePayClick = async () => {
    try {
      setIsLoading(true);
      
      // Call backend to create Metatron payment intent
      const response = await apiRequest(
        'POST',
        '/api/cart/payment/metatron'
      );
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const data = await response.json();
      setIsLoading(false);
      setProcessing(true);
      
      // In a real implementation, this would redirect to Metatron's payment page
      // For now, we'll simulate the payment process
      simulatePaymentProcess(data.paymentId);
      
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment"
      });
    }
  };
  
  // This is a placeholder function that simulates the payment process
  // In a real implementation, this would be replaced with a redirect to Metatron's payment page
  const simulatePaymentProcess = (paymentId: string) => {
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully",
      });
      onSuccess && onSuccess();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Metatron Pay</h3>
        <div className="p-6 bg-card border rounded-md flex flex-col items-center text-center space-y-4">
          <div className="bg-[#27ae60]/10 p-4 rounded-full">
            <div className="w-16 h-16 flex items-center justify-center text-[#27ae60] text-2xl font-bold">MP</div>
          </div>
          <p className="font-medium">Metatron Pay</p>
          <p className="text-sm text-muted-foreground">
            Secure, fast payments powered by Metatron Technologies
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Total amount:</span>
          <span className="font-medium">ZMW {amount.toFixed(2)}</span>
        </div>

        <Button 
          disabled={isLoading || processing} 
          onClick={handlePayClick}
          className="w-full bg-[#27ae60] hover:bg-[#219653]"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initiating payment...
            </span>
          ) : processing ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing payment...
            </span>
          ) : (
            `Pay with Metatron Pay`
          )}
        </Button>

        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full"
          disabled={isLoading || processing}
        >
          Cancel
        </Button>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-4">
        <p>Secured by Metatron Technologies Ltd.</p>
        <p>© {new Date().getFullYear()} Metatron Pay. All rights reserved.</p>
      </div>
    </div>
  );
}