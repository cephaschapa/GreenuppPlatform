import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, PiggyBank } from 'lucide-react';

interface PaymentMethodSelectorProps {
  onSelect: (method: 'stripe' | 'metatron') => void;
  defaultMethod?: 'stripe' | 'metatron';
}

export function PaymentMethodSelector({ 
  onSelect, 
  defaultMethod = 'stripe' 
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<'stripe' | 'metatron'>(defaultMethod);

  const handleChange = (value: 'stripe' | 'metatron') => {
    setSelected(value);
    onSelect(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Select a payment method</h3>
      
      <RadioGroup 
        defaultValue={selected} 
        value={selected}
        onValueChange={(value) => handleChange(value as 'stripe' | 'metatron')}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem 
            value="stripe" 
            id="stripe" 
            className="peer sr-only" 
          />
          <Label 
            htmlFor="stripe" 
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="mb-3 rounded-full bg-primary/10 p-2">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Credit Card</p>
              <p className="text-sm text-muted-foreground">Pay with Stripe</p>
            </div>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem 
            value="metatron" 
            id="metatron" 
            className="peer sr-only" 
          />
          <Label 
            htmlFor="metatron" 
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="mb-3 rounded-full bg-primary/10 p-2">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Metatron Pay</p>
              <p className="text-sm text-muted-foreground">Fast, direct payments</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
      
      <div className="p-4 border rounded-md bg-muted/40">
        {selected === 'stripe' ? (
          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Credit Card (Stripe)</p>
              <p className="text-xs text-muted-foreground">Secure payment processing with credit or debit cards.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <PiggyBank className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Metatron Pay</p>
              <p className="text-xs text-muted-foreground">Fast direct payment method by Metatron Technologies Ltd.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}