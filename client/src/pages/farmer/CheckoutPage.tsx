import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StripePayment } from '@/components/checkout/StripePayment';
import { MetatronPayment } from '@/components/checkout/MetatronPayment';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { formatCurrency } from '@/lib/utils';

// Load Stripe outside of component to avoid recreating on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type PaymentMethod = 'stripe' | 'metatron';

export default function CheckoutPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { cart, isLoading: isLoadingCart, createStripePayment, refetchCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Check if we're on the confirmation page
  const isConfirmationPage = location.includes('/payment/confirmation');
  
  // Calculate total items and amount
  const cartItems = cart?.items || [];
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const totalAmount = cart?.total ? parseFloat(cart.total.toString()) : 0;
  
  console.log('Current cart state:', { cartStatus: cart?.status, cartId: cart?.id, itemCount: cartItems.length, isConfirmationPage, location });

  // Query parameters for payment confirmation
  const searchParams = new URLSearchParams(window.location.search);
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentStatus = searchParams.get('redirect_status');

  // Handle Stripe payment checkout
  const stripePaymentMutation = useMutation({
    mutationFn: async () => {
      return await createStripePayment();
    },
  });

  // Handle checkout confirmation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cart/checkout");
      return await res.json();
    },
  });

  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setClientSecret(null); // Reset client secret when changing payment method
  };

  // Initialize Stripe payment when Stripe is selected
  useEffect(() => {
    if (paymentMethod === 'stripe' && !clientSecret && !paymentComplete) {
      stripePaymentMutation.mutate(undefined, {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret);
        },
        onError: (error: any) => {
          toast({
            title: "Payment Error",
            description: error.message || "Unable to initialize payment",
            variant: "destructive",
          });
        },
      });
    }
  }, [paymentMethod, clientSecret, paymentComplete]);

  // Handle confirmation page logic
  useEffect(() => {
    if (isConfirmationPage && paymentIntentId && paymentStatus === 'succeeded') {
      setPaymentComplete(true);
      refetchCart();
    }
  }, [isConfirmationPage, paymentIntentId, paymentStatus]);

  // Handlers
  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    refetchCart();
  };

  const handleCancel = () => {
    setLocation('/dashboard/marketplace/cart');
  };

  // Loading state
  if (isLoadingCart || checkoutMutation.isPending) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart?.id || cartItems.length === 0 && !paymentComplete) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to your cart to checkout</p>
          <Button asChild>
            <Link href="/dashboard/marketplace">Browse Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Payment success state
  if (paymentComplete) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your order has been placed successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>Thank you for your purchase.</p>
            <p>You will receive a confirmation email shortly with your order details.</p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/dashboard/marketplace">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 flex items-center gap-2" 
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold mt-3">Checkout</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left side - Order summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart items summary */}
              <div className="space-y-3">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.listing?.title || 'Product'}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">ZMW {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Order totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>ZMW {(cart?.subtotal || 0).toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>ZMW {(cart?.shipping || 0).toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>ZMW {(cart?.tax || 0).toString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>ZMW {(cart?.total || 0).toString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Payment */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>
                Complete your purchase by selecting a payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment method selector */}
              <PaymentMethodSelector 
                onSelect={handlePaymentMethodChange} 
                defaultMethod={paymentMethod}
              />
              
              <Separator />
              
              {/* Payment component */}
              {paymentMethod === 'stripe' && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePayment 
                    onSuccess={handlePaymentSuccess}
                    onCancel={handleCancel}
                    amount={totalAmount}
                  />
                </Elements>
              ) : paymentMethod === 'stripe' && stripePaymentMutation.isPending ? (
                <div className="py-10 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Initializing payment...</p>
                </div>
              ) : paymentMethod === 'metatron' ? (
                <MetatronPayment 
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancel}
                  amount={totalAmount}
                  cartId={cart?.id as number}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}