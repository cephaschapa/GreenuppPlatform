import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Building2, 
  CreditCard,
  Wallet,
  CheckCircle2,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethod = 
  | 'mtn_momo' 
  | 'airtel_money' 
  | 'zamtel_kwacha' 
  | 'bank_transfer' 
  | 'card';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  popular?: boolean;
  processingTime: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    description: 'Pay with MTN MoMo',
    icon: <Smartphone className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    popular: true,
    processingTime: 'Instant'
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    description: 'Pay with Airtel Money',
    icon: <Smartphone className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    processingTime: 'Instant'
  },
  {
    id: 'zamtel_kwacha',
    name: 'Zamtel Kwacha',
    description: 'Pay with Zamtel Kwacha',
    icon: <Smartphone className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    processingTime: 'Instant'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank payment',
    icon: <Building2 className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    processingTime: '1-2 hours'
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    description: 'Visa, Mastercard',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    processingTime: 'Instant'
  },
];

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  defaultMethod?: PaymentMethod;
  disabled?: boolean;
}

export function PaymentMethodSelector({ 
  onSelect, 
  defaultMethod = 'mtn_momo',
  disabled = false
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<PaymentMethod>(defaultMethod);

  const handleChange = (value: PaymentMethod) => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Select payment method</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          <span>Secure payments</span>
        </div>
      </div>
      
      <RadioGroup 
        defaultValue={selected} 
        value={selected}
        onValueChange={(value) => handleChange(value as PaymentMethod)}
        className="space-y-3"
        disabled={disabled}
      >
        {/* Mobile Money Section */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Mobile Money
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {paymentOptions.filter(opt => opt.id.includes('mtn') || opt.id.includes('airtel') || opt.id.includes('zamtel')).map((option) => (
              <PaymentOptionCard 
                key={option.id} 
                option={option} 
                isSelected={selected === option.id}
                disabled={disabled}
              />
            ))}
          </div>
        </div>

        {/* Other Payment Methods */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Other Methods
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentOptions.filter(opt => opt.id === 'bank_transfer' || opt.id === 'card').map((option) => (
              <PaymentOptionCard 
                key={option.id} 
                option={option} 
                isSelected={selected === option.id}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      </RadioGroup>
      
      {/* Selected Method Info */}
      <div className="p-4 border rounded-lg bg-muted/30">
        {paymentOptions.filter(opt => opt.id === selected).map((option) => (
          <div key={option.id} className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", option.bgColor)}>
              <span className={option.color}>{option.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{option.name}</p>
              <p className="text-sm text-muted-foreground">{option.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {option.processingTime}
                </Badge>
                {option.popular && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentOptionCard({ 
  option, 
  isSelected,
  disabled
}: { 
  option: PaymentOption; 
  isSelected: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <RadioGroupItem 
        value={option.id} 
        id={option.id} 
        className="peer sr-only" 
        disabled={disabled}
      />
      <Label 
        htmlFor={option.id} 
        className={cn(
          "flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
          "hover:bg-accent/50",
          isSelected 
            ? "border-primary bg-primary/5" 
            : "border-muted bg-background",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn("p-1.5 rounded-md", option.bgColor)}>
          <span className={option.color}>{option.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{option.name}</p>
          <p className="text-xs text-muted-foreground">{option.processingTime}</p>
        </div>
        {isSelected && (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        )}
        {option.popular && !isSelected && (
          <Badge variant="secondary" className="text-[10px] shrink-0">
            Popular
          </Badge>
        )}
      </Label>
    </div>
  );
}
