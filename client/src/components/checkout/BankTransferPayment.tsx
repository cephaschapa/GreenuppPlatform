import { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  CheckCircle, 
  Building2, 
  Copy,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BankTransferPaymentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  amount: number;
  cartId: number;
}

type PaymentPhase = 'initial' | 'pending' | 'confirmed' | 'error';

const zambianBanks = [
  { id: 'zanaco', name: 'Zanaco Bank' },
  { id: 'fnb', name: 'First National Bank (FNB)' },
  { id: 'stanbic', name: 'Stanbic Bank' },
  { id: 'absa', name: 'Absa Bank Zambia' },
  { id: 'boa', name: 'Bank of Africa' },
  { id: 'access', name: 'Access Bank Zambia' },
  { id: 'atlasmara', name: 'Atlas Mara' },
  { id: 'indo', name: 'Indo Zambia Bank' },
  { id: 'investrust', name: 'Investrust Bank' },
  { id: 'ab', name: 'AB Bank Zambia' },
];

// GreenUpp bank details (these would come from config in production)
const greenuppBankDetails = {
  bankName: 'Zanaco Bank',
  accountName: 'GreenUpp Technologies Ltd',
  accountNumber: '0012345678901',
  branchCode: '001',
  swiftCode: 'ZABORLX',
};

export function BankTransferPayment({ 
  onSuccess, 
  onCancel,
  amount,
  cartId
}: BankTransferPaymentProps) {
  const { toast } = useToast();
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>('initial');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique reference number
  useEffect(() => {
    const ref = `GU${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
    setReferenceNumber(ref);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSubmitConfirmation = async () => {
    if (!selectedBank) {
      toast({
        title: "Select your bank",
        description: "Please select the bank you transferred from",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to confirm bank transfer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentPhase('pending');
      
      toast({
        title: "Transfer Confirmation Received",
        description: "We'll verify your payment and process your order shortly.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit confirmation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pending Verification Screen
  if (paymentPhase === 'pending') {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center pt-8 pb-8 text-center space-y-4">
          <div className="rounded-full bg-blue-100 p-4">
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold">Payment Pending Verification</h3>
          <p className="text-muted-foreground max-w-md">
            We've received your transfer confirmation. Our team will verify the payment 
            and process your order within 1-2 hours during business hours.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg w-full max-w-md text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-mono font-medium">{referenceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">ZMW {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-blue-600 font-medium">Awaiting Verification</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            You'll receive an email and SMS once your payment is confirmed.
          </p>
          
          <Button onClick={() => onSuccess?.()} className="mt-4">
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Confirmed Screen
  if (paymentPhase === 'confirmed') {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex flex-col items-center justify-center pt-6 pb-8 text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold">Payment Confirmed!</h3>
          <p className="text-muted-foreground">
            Your bank transfer has been verified.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Initial Form
  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Bank Transfer</CardTitle>
              <CardDescription>Transfer directly from your bank account</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Amount to pay */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount to Transfer</p>
            <p className="text-3xl font-bold text-blue-600">ZMW {amount.toFixed(2)}</p>
          </div>

          {/* Bank Details */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Transfer to these bank details:</p>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <DetailRow 
                label="Bank Name" 
                value={greenuppBankDetails.bankName}
                onCopy={() => copyToClipboard(greenuppBankDetails.bankName, 'Bank name')}
              />
              <DetailRow 
                label="Account Name" 
                value={greenuppBankDetails.accountName}
                onCopy={() => copyToClipboard(greenuppBankDetails.accountName, 'Account name')}
              />
              <DetailRow 
                label="Account Number" 
                value={greenuppBankDetails.accountNumber}
                onCopy={() => copyToClipboard(greenuppBankDetails.accountNumber, 'Account number')}
                highlight
              />
              <DetailRow 
                label="Branch Code" 
                value={greenuppBankDetails.branchCode}
                onCopy={() => copyToClipboard(greenuppBankDetails.branchCode, 'Branch code')}
              />
            </div>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Payment Reference (IMPORTANT)</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => copyToClipboard(referenceNumber, 'Reference')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-center">
              <p className="font-mono text-lg font-bold">{referenceNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Include this reference in your transfer description
              </p>
            </div>
          </div>

          {/* Confirmation Form */}
          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium">After transferring, confirm here:</p>
            
            <div className="space-y-2">
              <Label htmlFor="bank">Your Bank</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {zambianBanks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-700">
              Please ensure you include the reference number in your transfer. 
              Orders are processed within 1-2 hours after payment verification.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onCancel?.()}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitConfirmation} 
            disabled={isSubmitting || !selectedBank}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "I've Made the Transfer"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function DetailRow({ 
  label, 
  value, 
  onCopy,
  highlight = false 
}: { 
  label: string; 
  value: string; 
  onCopy: () => void;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between py-1",
      highlight && "bg-white rounded px-2 -mx-2"
    )}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          "font-mono text-sm",
          highlight && "font-bold"
        )}>
          {value}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={onCopy}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

