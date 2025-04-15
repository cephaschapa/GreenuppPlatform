import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';

interface MetatronPaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
  cartId: number;
}

// Payment simulation states
type PaymentPhase = 'initial' | 'otp' | 'processing' | 'complete' | 'error';

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
  const [paymentData, setPaymentData] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>('initial');
  const [progress, setProgress] = useState(0);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Simulate progress bar during processing
  useEffect(() => {
    if (paymentPhase === 'processing') {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 300);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [paymentPhase]);
  
  // Complete payment when progress reaches 100%
  useEffect(() => {
    if (progress === 100 && paymentPhase === 'processing') {
      // Simulate successful payment
      setTimeout(() => {
        completePayment();
      }, 500);
    }
  }, [progress]);

  // Generate random transaction ID
  useEffect(() => {
    const generateTransactionId = () => {
      const prefix = 'MTP';
      const randomNum = Math.floor(Math.random() * 10000000);
      return `${prefix}${randomNum.toString().padStart(7, '0')}`;
    };
    
    setTransactionId(generateTransactionId());
  }, []);

  const initiatePayment = async () => {
    if (!cartId) {
      toast({
        title: "Payment error",
        description: "Cart information is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call our API to create a Metatron payment intent
      const response = await createMetatronPayment();
      setPaymentData(response);
      
      // Show OTP dialog
      setPaymentPhase('otp');
      setShowOtpDialog(true);
      
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

  const verifyOtp = () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP code sent to your phone.",
        variant: "destructive",
      });
      return;
    }
    
    // Close OTP dialog and start processing
    setShowOtpDialog(false);
    setPaymentPhase('processing');
    setProgress(0);
  };

  const completePayment = async () => {
    if (!paymentData?.paymentId) {
      setError("Payment data is missing");
      setPaymentPhase('error');
      return;
    }
    
    try {
      // Confirm the payment
      const result = await confirmPayment(paymentData.paymentId, 'metatron');
      
      if (result.success) {
        setPaymentPhase('complete');
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully with Metatron Pay.",
        });
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setError("Payment verification failed. Please try again.");
        setPaymentPhase('error');
        toast({
          title: "Payment Failed",
          description: "Payment verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Payment processing failed");
      setPaymentPhase('error');
      toast({
        title: "Payment Error",
        description: err.message || "Payment processing failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show OTP Dialog
  if (showOtpDialog) {
    return (
      <AlertDialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter OTP Verification Code</AlertDialogTitle>
            <AlertDialogDescription>
              A one-time verification code has been sent to your phone number: 
              <span className="font-medium">{phoneNumber}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="otp">Enter 6-digit OTP code</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="text-center text-xl letter-spacing-wide"
                />
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowOtpDialog(false)}>Cancel</Button>
            <Button onClick={verifyOtp}>Verify OTP</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Processing payment indicator
  if (paymentPhase === 'processing') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Processing your payment</h3>
          <p className="text-muted-foreground">Please wait while we process your payment with Metatron Pay</p>
          
          <div className="w-full max-w-md space-y-2 py-4">
            <Progress value={progress} className="h-2 w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Verifying payment</span>
              <span>Confirming</span>
              <span>Finalizing</span>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg w-full max-w-md">
            <p className="text-xs text-muted-foreground mb-2">Transaction Details:</p>
            <div className="text-sm flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono">{transactionId}</span>
            </div>
            <div className="text-sm flex justify-between">
              <span>Amount:</span>
              <span>ZMW {amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Payment complete screen
  if (paymentPhase === 'complete') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold">Payment Successful</h3>
          <p className="text-muted-foreground">Your payment has been processed successfully!</p>
          
          <div className="bg-muted/50 p-4 rounded-lg w-full max-w-md">
            <p className="text-xs text-muted-foreground mb-2">Transaction Details:</p>
            <div className="text-sm flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-mono">{transactionId}</span>
            </div>
            <div className="text-sm flex justify-between">
              <span>Amount:</span>
              <span>ZMW {amount.toFixed(2)}</span>
            </div>
            <div className="text-sm flex justify-between">
              <span>Status:</span>
              <span className="text-green-600">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Payment error screen
  if (paymentPhase === 'error') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold">Payment Failed</h3>
          <p className="text-muted-foreground">{error || "Your payment could not be processed. Please try again."}</p>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onCancel?.()}>
              Back to cart
            </Button>
            <Button onClick={() => setPaymentPhase('initial')}>
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial payment form
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-bold text-xs">
              MP
            </div>
            <CardTitle className="text-lg">Metatron Pay</CardTitle>
          </div>
          <CardDescription>
            Fast, secure payments for Zambian customers
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="phone">Mobile Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+260</span>
                <Input
                  id="phone"
                  placeholder="97X XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-14"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll send a verification code to this number
              </p>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-medium">Payment Details</h4>
            <div className="rounded-md border p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">ZMW {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment method:</span>
                <span className="font-medium">Metatron Pay</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-2 pt-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Your payment is secure and encrypted</p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel?.()}
            disabled={isProcessing}
          >
            Back
          </Button>
          
          <Button onClick={initiatePayment} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ZMW ${amount.toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}