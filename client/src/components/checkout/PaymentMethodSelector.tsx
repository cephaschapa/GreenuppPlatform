import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { SiStripe, SiSimpleanalytics } from "react-icons/si";

type PaymentMethod = 'stripe' | 'metatron';

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  defaultMethod?: PaymentMethod;
}

export function PaymentMethodSelector({ 
  onSelect, 
  defaultMethod = 'stripe' 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(defaultMethod);

  const handleChange = (value: string) => {
    const method = value as PaymentMethod;
    setSelectedMethod(method);
    onSelect(method);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Payment Method</h3>
      
      <RadioGroup 
        defaultValue={defaultMethod}
        onValueChange={handleChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="relative">
          <RadioGroupItem 
            value="stripe" 
            id="stripe" 
            className="peer sr-only" 
          />
          <Label 
            htmlFor="stripe" 
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center justify-center mb-2">
              <SiStripe className="h-10 w-10 text-[#635BFF]" />
            </div>
            <div className="w-full text-center space-y-1">
              <p className="text-sm font-medium leading-none">Stripe</p>
              <p className="text-sm text-muted-foreground">Pay securely with credit/debit card</p>
            </div>
            {selectedMethod === 'stripe' && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </Label>
        </div>

        <div className="relative">
          <RadioGroupItem 
            value="metatron" 
            id="metatron" 
            className="peer sr-only" 
          />
          <Label 
            htmlFor="metatron" 
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <div className="flex items-center justify-center mb-2">
              <SiSimpleanalytics className="h-10 w-10 text-[#27ae60]" />
            </div>
            <div className="w-full text-center space-y-1">
              <p className="text-sm font-medium leading-none">Metatron Pay</p>
              <p className="text-sm text-muted-foreground">Pay with Metatron Pay account</p>
            </div>
            {selectedMethod === 'metatron' && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}