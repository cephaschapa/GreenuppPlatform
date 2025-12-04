import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, 
  CheckCircle, 
  Phone, 
  ShieldCheck, 
  AlertCircle,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from './PaymentMethodSelector';

interface MobileMoneyPaymentProps {
  provider: 'mtn_momo' | 'airtel_money' | 'zamtel_kwacha';
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
  cartId: number;
}

type PaymentPhase = 'initial' | 'pending_approval' | 'processing' | 'complete' | 'error' | 'timeout';

const providerConfig = {
  mtn_momo: {
    name: 'MTN Mobile Money',
    shortName: 'MTN MoMo',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
    prefix: '+260 97',
    placeholder: 'X XXX XXX',
    ussdCode: '*303#',
    logo: '🟡',
  },
  airtel_money: {
    name: 'Airtel Money',
    shortName: 'Airtel Money',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    buttonColor: 'bg-red-500 hover:bg-red-600',
    prefix: '+260 97',
    placeholder: 'X XXX XXX',
    ussdCode: '*778#',
    logo: '🔴',
  },
  zamtel_kwacha: {
    name: 'Zamtel Kwacha',
    shortName: 'Zamtel Kwacha',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    buttonColor: 'bg-green-500 hover:bg-green-600',
    prefix: '+260 95',
    placeholder: 'X XXX XXX',
    ussdCode: '*422#',
    logo: '🟢',
  },
};

export function MobileMoneyPayment({ 
  provider,
  onSuccess, 
  onCancel,
  amount,
  cartId
}: MobileMoneyPaymentProps) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>('initial');
  const [progress, setProgress] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120); // 2 minutes timeout

  const config = providerConfig[provider];

  // Generate transaction ID on mount
  useEffect(() => {
    const prefix = provider === 'mtn_momo' ? 'MTN' : provider === 'airtel_money' ? 'AIR' : 'ZMT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setTransactionId(`${prefix}${timestamp}${random}`);
  }, [provider]);

  // Countdown timer for pending approval
  useEffect(() => {
    if (paymentPhase === 'pending_approval' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && paymentPhase === 'pending_approval') {
      setPaymentPhase('timeout');
    }
  }, [paymentPhase, countdown]);

  // Progress simulation during processing
  useEffect(() => {
    if (paymentPhase === 'processing') {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
      return () => clearInterval(timer);
    }
  }, [paymentPhase]);

  // Complete payment when progress reaches 100%
  useEffect(() => {
    if (progress === 100 && paymentPhase === 'processing') {
      setTimeout(() => {
        setPaymentPhase('complete');
        toast({
          title: "Payment Successful!",
          description: `Your ${config.name} payment has been confirmed.`,
        });
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }, 500);
    }
  }, [progress, paymentPhase]);

  const validatePhone = (phone: string) => {
    // Remove spaces and validate Zambian phone number
    const cleaned = phone.replace(/\s/g, '');
    return cleaned.length >= 7 && cleaned.length <= 9 && /^\d+$/.test(cleaned);
  };

  const initiatePayment = async () => {
    if (!validatePhone(phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate API call to initiate mobile money payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to pending approval state
      setPaymentPhase('pending_approval');
      setCountdown(120);
      
      toast({
        title: "Payment Request Sent",
        description: `Please approve the payment on your ${config.shortName} app or dial ${config.ussdCode}`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
      toast({
        title: "Payment Error",
        description: err.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPaymentReceived = () => {
    // User confirms they approved - simulate processing
    setPaymentPhase('processing');
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pending Approval Screen
  if (paymentPhase === 'pending_approval') {
    return (
      <Card className={cn("w-full border-2", config.borderColor)}>
        <CardHeader className="text-center pb-2">
          <div className={cn("mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2", config.bgColor)}>
            <Smartphone className={cn("h-8 w-8", config.color)} />
          </div>
          <CardTitle className="text-lg">Approve Payment on Your Phone</CardTitle>
          <CardDescription>
            A payment request of <span className="font-semibold text-foreground">ZMW {amount.toFixed(2)}</span> has been sent to your phone
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={cn("p-4 rounded-lg text-center", config.bgColor)}>
            <p className="text-sm font-medium mb-1">Check your {config.shortName} app</p>
            <p className="text-xs text-muted-foreground">
              Or dial <span className="font-mono font-bold">{config.ussdCode}</span> to approve
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-mono font-bold">
              {formatTime(countdown)}
            </div>
            <p className="text-xs text-muted-foreground">
              Time remaining to approve
            </p>
            <Progress value={(countdown / 120) * 100} className="h-1" />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-mono">{config.prefix} {phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">ZMW {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono text-xs">{transactionId}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={confirmPaymentReceived} 
            className={cn("w-full", config.buttonColor)}
          >
            I've Approved the Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setPaymentPhase('initial');
              onCancel?.();
            }}
            className="w-full"
          >
            Cancel Payment
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Processing Screen
  if (paymentPhase === 'processing') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className={cn("rounded-full p-3", config.bgColor)}>
            <Loader2 className={cn("h-10 w-10 animate-spin", config.color)} />
          </div>
          <h3 className="text-xl font-semibold">Confirming Payment</h3>
          <p className="text-muted-foreground">
            Please wait while we confirm your {config.shortName} payment...
          </p>
          
          <div className="w-full max-w-md space-y-2 py-4">
            <Progress value={progress} className="h-2 w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Verifying</span>
              <span>Processing</span>
              <span>Confirming</span>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg w-full max-w-md text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span>ZMW {amount.toFixed(2)}</span>
            </div>
          </div>
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
            Your {config.shortName} payment has been confirmed.
          </p>
          
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg w-full max-w-md text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium text-green-600">ZMW {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-green-600 font-medium">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Timeout Screen
  if (paymentPhase === 'timeout') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-orange-100 p-3">
            <AlertCircle className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold">Payment Timed Out</h3>
          <p className="text-muted-foreground">
            The payment request expired. Please try again.
          </p>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onCancel?.()}>
              Back to Cart
            </Button>
            <Button onClick={() => {
              setPaymentPhase('initial');
              setCountdown(120);
            }}>
              Try Again
            </Button>
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
            {error || "Something went wrong. Please try again."}
          </p>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onCancel?.()}>
              Back to Cart
            </Button>
            <Button onClick={() => setPaymentPhase('initial')}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial Form
  return (
    <div className="space-y-6">
      <Card className={cn("border-2", config.borderColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-xl", config.bgColor)}>
              {config.logo}
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription>Pay directly from your mobile wallet</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Money Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {config.prefix}
              </span>
              <Input
                id="phone"
                placeholder={config.placeholder}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                className="pl-20"
                inputMode="numeric"
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the number registered with {config.shortName}
            </p>
          </div>
          
          <div className="rounded-lg border p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount to pay:</span>
              <span className="font-semibold">ZMW {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction fee:</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <p className="text-xs text-muted-foreground">
              Secure payment powered by {config.name}
            </p>
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
            onClick={initiatePayment} 
            disabled={isProcessing || !phoneNumber}
            className={cn("flex-1", config.buttonColor, "text-white")}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>Pay ZMW {amount.toFixed(2)}</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

