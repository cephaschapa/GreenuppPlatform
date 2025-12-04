import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Truck, 
  Package, 
  MapPin,
  Clock,
  CheckCircle2,
  Zap,
  Store,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeliveryMethod = 
  | 'drop_express'
  | 'drop_standard'
  | 'self_pickup'
  | 'seller_delivery';

interface DeliveryOption {
  id: DeliveryMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  price: number | 'Free' | 'Varies';
  estimatedTime: string;
  popular?: boolean;
  provider?: string;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'drop_express',
    name: 'DROP Express',
    description: 'Swift same-day delivery',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    price: 35,
    estimatedTime: '2-4 hours',
    popular: true,
    provider: 'DROP'
  },
  {
    id: 'drop_standard',
    name: 'DROP Standard',
    description: 'Secure next-day delivery',
    icon: <Truck className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    price: 20,
    estimatedTime: '1-2 days',
    provider: 'DROP'
  },
  {
    id: 'seller_delivery',
    name: 'Seller Delivery',
    description: 'Delivered by the seller',
    icon: <Navigation className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    price: 'Varies',
    estimatedTime: 'Contact seller',
  },
  {
    id: 'self_pickup',
    name: 'Self Pickup',
    description: 'Collect from seller location',
    icon: <Store className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    price: 'Free',
    estimatedTime: 'Arrange with seller',
  },
];

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  landmark: string;
  instructions: string;
}

interface DeliveryMethodSelectorProps {
  onSelect: (method: DeliveryMethod, address?: DeliveryAddress) => void;
  defaultMethod?: DeliveryMethod;
  disabled?: boolean;
  onDeliveryCostChange?: (cost: number) => void;
}

export function DeliveryMethodSelector({ 
  onSelect, 
  defaultMethod = 'drop_express',
  disabled = false,
  onDeliveryCostChange
}: DeliveryMethodSelectorProps) {
  const [selected, setSelected] = useState<DeliveryMethod>(defaultMethod);
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    landmark: '',
    instructions: ''
  });

  const selectedOption = deliveryOptions.find(opt => opt.id === selected);
  const needsAddress = selected !== 'self_pickup';

  useEffect(() => {
    // Calculate delivery cost
    const cost = selectedOption?.price === 'Free' || selectedOption?.price === 'Varies' 
      ? 0 
      : (selectedOption?.price || 0);
    onDeliveryCostChange?.(cost);
  }, [selected, selectedOption, onDeliveryCostChange]);

  const handleChange = (value: DeliveryMethod) => {
    setSelected(value);
    onSelect(value, needsAddress ? address : undefined);
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    const newAddress = { ...address, [field]: value };
    setAddress(newAddress);
    if (needsAddress) {
      onSelect(selected, newAddress);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delivery Method Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">Delivery Method</h3>
        </div>
        
        <RadioGroup 
          defaultValue={selected} 
          value={selected}
          onValueChange={(value) => handleChange(value as DeliveryMethod)}
          className="space-y-3"
          disabled={disabled}
        >
          {/* DROP Delivery Options */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                DROP Delivery — Swift. Secure.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliveryOptions.filter(opt => opt.provider === 'DROP').map((option) => (
                <DeliveryOptionCard 
                  key={option.id} 
                  option={option} 
                  isSelected={selected === option.id}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>

          {/* Other Delivery Options */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Other Options
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliveryOptions.filter(opt => !opt.provider).map((option) => (
                <DeliveryOptionCard 
                  key={option.id} 
                  option={option} 
                  isSelected={selected === option.id}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        </RadioGroup>
      </div>
      
      {/* Selected Method Info */}
      {selectedOption && (
        <div className={cn("p-4 border-2 rounded-lg", selectedOption.bgColor)}>
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg bg-white/80")}>
              <span className={selectedOption.color}>{selectedOption.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{selectedOption.name}</p>
                {selectedOption.provider === 'DROP' && (
                  <Badge className="bg-orange-500 text-white text-[10px]">
                    DROP
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{selectedOption.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{selectedOption.estimatedTime}</span>
                </div>
                <div className="font-medium">
                  {selectedOption.price === 'Free' ? (
                    <span className="text-green-600">Free</span>
                  ) : selectedOption.price === 'Varies' ? (
                    <span className="text-muted-foreground">Price varies</span>
                  ) : (
                    <span>ZMW {selectedOption.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address Form */}
      {needsAddress && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-base font-medium">Delivery Address</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Mwanza"
                value={address.fullName}
                onChange={(e) => handleAddressChange('fullName', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+260 97X XXX XXX"
                value={address.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Cairo Road, Northmead"
              value={address.address}
              onChange={(e) => handleAddressChange('address', e.target.value)}
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City/Town</Label>
              <Input
                id="city"
                placeholder="Lusaka"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Nearby Landmark</Label>
              <Input
                id="landmark"
                placeholder="Near Manda Hill Mall"
                value={address.landmark}
                onChange={(e) => handleAddressChange('landmark', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Gate code, best time to deliver, etc."
              value={address.instructions}
              onChange={(e) => handleAddressChange('instructions', e.target.value)}
              disabled={disabled}
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Pickup Info */}
      {selected === 'self_pickup' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Self Pickup Selected</p>
              <p className="text-sm text-blue-700 mt-1">
                After placing your order, the seller will contact you to arrange pickup time and location.
                Make sure your phone number is correct.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveryOptionCard({ 
  option, 
  isSelected,
  disabled
}: { 
  option: DeliveryOption; 
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
          "flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all",
          "hover:bg-accent/50",
          isSelected 
            ? "border-primary bg-primary/5" 
            : "border-muted bg-background",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn("p-1.5 rounded-md shrink-0", option.bgColor)}>
          <span className={option.color}>{option.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm">{option.name}</p>
            {option.popular && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                Popular
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{option.estimatedTime}</p>
          <p className="text-xs font-medium mt-1">
            {option.price === 'Free' ? (
              <span className="text-green-600">Free</span>
            ) : option.price === 'Varies' ? (
              <span className="text-muted-foreground">Varies</span>
            ) : (
              <span>ZMW {option.price}</span>
            )}
          </p>
        </div>
        {isSelected && (
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        )}
      </Label>
    </div>
  );
}

