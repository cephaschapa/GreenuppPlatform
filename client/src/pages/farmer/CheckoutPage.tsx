import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle, ShoppingBag, Package, Truck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodSelector, type PaymentMethod } from '@/components/checkout/PaymentMethodSelector';
import { DeliveryMethodSelector, type DeliveryMethod } from '@/components/checkout/DeliveryMethodSelector';
import { MobileMoneyPayment } from '@/components/checkout/MobileMoneyPayment';
import { BankTransferPayment } from '@/components/checkout/BankTransferPayment';
import { CardPayment } from '@/components/checkout/CardPayment';
import { formatCurrency } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRoleNavigation } from '@/hooks/use-role-navigation';

type CheckoutStep = 'delivery' | 'payment' | 'complete';

export default function CheckoutPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { cart, isLoading: isLoadingCart, refetchCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('drop_express');
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [deliveryCost, setDeliveryCost] = useState(35); // Default DROP Express cost
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { getUrl } = useRoleNavigation();

  // Ensure items are properly extracted from the cart
  const cartItems = cart?.items || [];
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const subtotal = cart?.subtotal ? parseFloat(cart.subtotal.toString()) : 0;
  const tax = cart?.tax ? parseFloat(cart.tax.toString()) : 0;
  const totalAmount = subtotal + tax + deliveryCost;

  // Handle delivery method change
  const handleDeliverySelect = (method: DeliveryMethod, address?: any) => {
    setDeliveryMethod(method);
    setDeliveryAddress(address);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  // Handle delivery cost change
  const handleDeliveryCostChange = (cost: number) => {
    setDeliveryCost(cost);
  };

  // Proceed to payment
  const handleProceedToPayment = () => {
    // Validate delivery address if needed
    if (deliveryMethod !== 'self_pickup') {
      if (!deliveryAddress?.fullName || !deliveryAddress?.phone || !deliveryAddress?.address || !deliveryAddress?.city) {
        toast({
          title: "Missing delivery information",
          description: "Please fill in all required delivery fields",
          variant: "destructive",
        });
        return;
      }
    }
    setCurrentStep('payment');
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    const newOrderId = `ORD-${Date.now().toString().slice(-8)}`;
    setOrderId(newOrderId);
    setPaymentComplete(true);
    setCurrentStep('complete');
    refetchCart();
  };

  // Handle cancel/back
  const handleCancel = () => {
    if (currentStep === 'payment') {
      setCurrentStep('delivery');
    } else {
      setLocation(getUrl('marketplace/cart'));
    }
  };

  // Get delivery method display name
  const getDeliveryMethodName = () => {
    const methods: Record<DeliveryMethod, string> = {
      'drop_express': 'DROP Express (2-4 hours)',
      'drop_standard': 'DROP Standard (1-2 days)',
      'seller_delivery': 'Seller Delivery',
      'self_pickup': 'Self Pickup'
    };
    return methods[deliveryMethod];
  };

  // Loading state
  if (isLoadingCart) {
    return (
      <DashboardLayout title="Checkout" description="Processing...">
        <div className="container max-w-4xl mx-auto py-10 px-4">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading checkout...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Empty cart state
  if ((!cart?.id || cartItems.length === 0) && !paymentComplete) {
    return (
      <DashboardLayout title="Checkout" description="Your cart is empty">
        <div className="container max-w-4xl mx-auto py-10 px-4">
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to your cart to checkout</p>
            <Button asChild>
              <Link href={getUrl('marketplace')}>Browse Marketplace</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Order complete state
  if (currentStep === 'complete' && paymentComplete) {
    return (
      <DashboardLayout title="Order Complete" description="Payment successful">
        <div className="container max-w-2xl mx-auto py-10 px-4">
          <Card className="w-full">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
              <CardDescription>Thank you for your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {orderId && (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <p className="text-2xl font-mono font-bold">{orderId}</p>
                </div>
              )}

              {/* Delivery Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5 text-orange-600" />
                  <p className="font-medium">Delivery Details</p>
                </div>
                <p className="text-sm text-muted-foreground">{getDeliveryMethodName()}</p>
                {deliveryAddress && deliveryMethod !== 'self_pickup' && (
                  <p className="text-sm mt-1">
                    {deliveryAddress.address}, {deliveryAddress.city}
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">What happens next?</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">1</Badge>
                    <p>You'll receive an order confirmation via SMS and email</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">2</Badge>
                    <p>
                      {deliveryMethod.startsWith('drop_') 
                        ? 'DROP will pick up your order from the seller'
                        : deliveryMethod === 'self_pickup'
                        ? 'The seller will contact you to arrange pickup'
                        : 'The seller will prepare your order for delivery'
                      }
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">3</Badge>
                    <p>You'll be notified when your order is ready or on its way</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href={getUrl('orders')}>
                  <Package className="h-4 w-4 mr-2" />
                  View My Orders
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href={getUrl('marketplace')}>Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Checkout form
  return (
    <DashboardLayout title="Checkout" description="Complete your purchase">
      <div className="container max-w-5xl mx-auto py-6 px-4">
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="pl-0 flex items-center gap-2" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 'payment' ? 'Back to Delivery' : 'Back to Cart'}
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <StepIndicator 
              step={1} 
              label="Delivery" 
              active={currentStep === 'delivery'} 
              completed={currentStep === 'payment'}
            />
            <div className="w-12 h-0.5 bg-muted" />
            <StepIndicator 
              step={2} 
              label="Payment" 
              active={currentStep === 'payment'} 
              completed={false}
            />
          </div>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'delivery' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Options
                  </CardTitle>
                  <CardDescription>
                    Choose how you'd like to receive your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeliveryMethodSelector 
                    onSelect={handleDeliverySelect}
                    defaultMethod={deliveryMethod}
                    onDeliveryCostChange={handleDeliveryCostChange}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleProceedToPayment}
                    className="w-full sm:w-auto ml-auto"
                  >
                    Continue to Payment
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {currentStep === 'payment' && (
              <>
                {/* Delivery Summary */}
                <Card className="bg-muted/30">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <Truck className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{getDeliveryMethodName()}</p>
                          {deliveryAddress && deliveryMethod !== 'self_pickup' && (
                            <p className="text-xs text-muted-foreground">
                              {deliveryAddress.address}, {deliveryAddress.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCurrentStep('delivery')}
                      >
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                      Choose how you'd like to pay
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PaymentMethodSelector 
                      onSelect={handlePaymentMethodChange} 
                      defaultMethod={paymentMethod}
                    />
                  </CardContent>
                </Card>
                
                {/* Payment Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Payment</CardTitle>
                    <CardDescription>
                      Enter your payment details below
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(paymentMethod === 'mtn_momo' || 
                      paymentMethod === 'airtel_money' || 
                      paymentMethod === 'zamtel_kwacha') && (
                      <MobileMoneyPayment
                        provider={paymentMethod}
                        onSuccess={handlePaymentSuccess}
                        onCancel={handleCancel}
                        amount={totalAmount}
                        cartId={cart?.id as number}
                      />
                    )}
                    
                    {paymentMethod === 'bank_transfer' && (
                      <BankTransferPayment
                        onSuccess={handlePaymentSuccess}
                        onCancel={handleCancel}
                        amount={totalAmount}
                        cartId={cart?.id as number}
                      />
                    )}
                    
                    {paymentMethod === 'card' && (
                      <CardPayment
                        onSuccess={handlePaymentSuccess}
                        onCancel={handleCancel}
                        amount={totalAmount}
                        cartId={cart?.id as number}
                      />
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Right side - Order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
                <CardDescription>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart items summary */}
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.listing?.title || 'Product'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-sm shrink-0">
                        ZMW {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Order totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>ZMW {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    {deliveryCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>ZMW {deliveryCost.toFixed(2)}</span>
                    )}
                  </div>
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>ZMW {tax.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">ZMW {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery badge */}
                {deliveryMethod.startsWith('drop_') && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">D</span>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-orange-900">DROP Delivery</p>
                      <p className="text-orange-700">Swift. Secure.</p>
                    </div>
                  </div>
                )}

                {/* Trust badges */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span>🔒 Secure</span>
                    <span>✓ Protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StepIndicator({ 
  step, 
  label, 
  active, 
  completed 
}: { 
  step: number; 
  label: string; 
  active: boolean; 
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${completed ? 'bg-green-500 text-white' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
      `}>
        {completed ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={`text-sm font-medium ${active || completed ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
