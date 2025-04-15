import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { StripePayment } from '@/components/checkout/StripePayment';
import { MetatronPayment } from '@/components/checkout/MetatronPayment';
import { useLocation, useRoute, Link, useSearch } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Load Stripe outside of component to avoid recreating it on each render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

type PaymentMethod = 'stripe' | 'metatron';

export default function CheckoutPage() {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute('/dashboard/marketplace/payment/confirmation');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const search = useSearch();
  const successParam = new URLSearchParams(search).get('success');

  // If the URL includes success=true, mark payment as complete
  useEffect(() => {
    if (successParam === 'true' || match) {
      setPaymentComplete(true);
    }
  }, [successParam, match]);

  // Fetch the cart details
  const { data: cartData, isLoading: isLoadingCart } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !paymentComplete,
  });

  // Mutation to start checkout process
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/cart/checkout');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to start checkout');
      }
      return res.json();
    },
    onSuccess: () => {
      // After checkout is started, invalidate cart query to get latest status
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process"
      });
    }
  });

  // Mutation to create Stripe payment intent
  const stripePaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/cart/payment/stripe');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to create payment intent"
      });
    }
  });

  // Start checkout process when page loads
  useEffect(() => {
    if (cartData && !paymentComplete && cartData.cart.status === 'active') {
      checkoutMutation.mutate();
    }
  }, [cartData]);

  // When payment method changes or checkout completes, handle creating the payment intent
  useEffect(() => {
    if (cartData && cartData.cart.status === 'checkout' && paymentMethod === 'stripe' && !clientSecret) {
      stripePaymentMutation.mutate();
    }
  }, [paymentMethod, cartData]);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    // Reset client secret when changing payment methods
    setClientSecret(null);
  };

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    toast({
      title: "Payment Successful",
      description: "Your order has been placed successfully"
    });
  };

  const handleCancel = () => {
    setLocation('/dashboard/marketplace/cart');
  };

  // Calculate total items and amount
  const cartItems = cartData?.items || [];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartData?.cart?.total ? parseFloat(cartData.cart.total) : 0;

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
  if (cartItems.length === 0 && !paymentComplete) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to your cart to checkout</p>
          <Button asChild>
            <Link to="/dashboard/marketplace">Browse Marketplace</Link>
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
              <Link to="/dashboard/marketplace">Continue Shopping</Link>
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
                  <span>ZMW {(cartData?.cart?.subtotal || 0).toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>ZMW {(cartData?.cart?.shipping || 0).toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>ZMW {(cartData?.cart?.tax || 0).toString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>ZMW {(cartData?.cart?.total || 0).toString()}</span>
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
                  cartId={cartData?.cart?.id}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}