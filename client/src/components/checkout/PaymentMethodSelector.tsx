import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Factory } from "lucide-react";

interface PaymentMethodSelectorProps {
  onSelect: (method: 'stripe' | 'metatron') => void;
  defaultMethod?: 'stripe' | 'metatron';
}

export function PaymentMethodSelector({ 
  onSelect, 
  defaultMethod = 'stripe'
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'metatron'>(defaultMethod);

  const handleMethodChange = (value: 'stripe' | 'metatron') => {
    setSelectedMethod(value);
    onSelect(value);
  };

  return (
    <RadioGroup 
      value={selectedMethod} 
      onValueChange={(value: 'stripe' | 'metatron') => handleMethodChange(value)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`cursor-pointer border-2 hover:border-primary/50 transition-colors ${selectedMethod === 'stripe' ? 'border-primary' : 'border-border'}`}>
          <CardContent className="p-6">
            <RadioGroupItem value="stripe" id="stripe" className="hidden" />
            <Label 
              htmlFor="stripe" 
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Credit Card</p>
                <p className="text-sm text-muted-foreground">Pay with Stripe</p>
              </div>
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                {selectedMethod === 'stripe' && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
            </Label>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer border-2 hover:border-primary/50 transition-colors ${selectedMethod === 'metatron' ? 'border-primary' : 'border-border'}`}>
          <CardContent className="p-6">
            <RadioGroupItem value="metatron" id="metatron" className="hidden" />
            <Label 
              htmlFor="metatron" 
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Factory className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Metatron Pay</p>
                <p className="text-sm text-muted-foreground">Pay with Metatron</p>
              </div>
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                {selectedMethod === 'metatron' && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
            </Label>
          </CardContent>
        </Card>
      </div>
    </RadioGroup>
  );
}