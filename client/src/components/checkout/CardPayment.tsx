import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Loader2, 
  CheckCircle, 
  CreditCard, 
  ShieldCheck,
  AlertCircle,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardPaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
  cartId: number;
}

type PaymentPhase = 'initial' | 'processing' | 'complete' | 'error';

export function CardPayment({ 
  onSuccess, 
  onCancel,
  amount,
  cartId
}: CardPaymentProps) {
  const { toast } = useToast();
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>('initial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  // Detect card type
  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
  };

  const validateForm = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast({ title: "Invalid card number", variant: "destructive" });
      return false;
    }
    if (expiryDate.length < 5) {
      toast({ title: "Invalid expiry date", variant: "destructive" });
      return false;
    }
    if (cvv.length < 3) {
      toast({ title: "Invalid CVV", variant: "destructive" });
      return false;
    }
    if (cardholderName.length < 3) {
      toast({ title: "Please enter cardholder name", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate card payment processing
      // In production, this would integrate with Flutterwave or DPO
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPaymentPhase('complete');
      toast({
        title: "Payment Successful!",
        description: "Your card payment has been processed.",
      });
      
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setPaymentPhase('error');
      toast({
        title: "Payment Failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardType = getCardType(cardNumber);

  // Processing Screen
  if (isProcessing) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-purple-100 p-3">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold">Processing Payment</h3>
          <p className="text-muted-foreground">
            Please wait while we process your card payment...
          </p>
          <p className="text-xs text-muted-foreground">
            Do not close this window
          </p>
        </CardContent>
      </Card>
    );
  }

  // Success Screen
  if (paymentPhase === 'complete') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold">Payment Successful!</h3>
          <p className="text-muted-foreground">
            Your card payment has been processed.
          </p>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg w-full max-w-md text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium text-green-600">ZMW {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card:</span>
              <span className="font-mono">**** {cardNumber.slice(-4)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error Screen
  if (paymentPhase === 'error') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold">Payment Failed</h3>
          <p className="text-muted-foreground">
            {error || "Your card payment could not be processed."}
          </p>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onCancel?.()}>
              Cancel
            </Button>
            <Button onClick={() => setPaymentPhase('initial')}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card Form
  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-50">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Card Payment</CardTitle>
              <CardDescription>Pay with Visa or Mastercard</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {cardType === 'visa' && (
                  <span className="text-blue-600 font-bold text-sm">VISA</span>
                )}
                {cardType === 'mastercard' && (
                  <span className="text-orange-600 font-bold text-sm">MC</span>
                )}
                {cardType === 'unknown' && (
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="JOHN DOE"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  type="password"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount to pay:</span>
              <span className="font-semibold">ZMW {amount.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-4 w-4 text-green-600" />
              <span>Encrypted</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onCancel?.()}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Pay ZMW {amount.toFixed(2)}
          </Button>
        </CardFooter>
      </Card>
      
      <p className="text-xs text-center text-muted-foreground">
        Card payments are processed securely. Your card details are never stored.
      </p>
    </div>
  );
}

