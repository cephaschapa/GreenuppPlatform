import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Trash2,
  ShoppingBag,
  ChevronLeft,
  Plus,
  Minus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRoleNavigation } from "@/hooks/use-role-navigation";

export default function CartPage() {
  const {
    cart,
    isLoading,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    startCheckout,
  } = useCart();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const { getUrl } = useRoleNavigation();

  const handleUpdateQuantity = (
    itemId: number,
    currentQuantity: number,
    increment: number,
  ) => {
    const newQuantity = currentQuantity + increment;
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const [, setLocation] = useLocation();

  const handleCheckout = async () => {
    if (itemCount === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      // Start checkout process and redirect to checkout page
      await startCheckout();
      // Use Link navigation instead of window.location to avoid full page reload
      setLocation(getUrl("marketplace/checkout"));
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description:
          "There was a problem starting the checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Shopping Cart" description="Review your cart items">
        <div className="container py-10 flex flex-col items-center justify-center min-h-[60vh] w-full mx-auto">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          <p className="mt-4 text-muted-foreground">Loading your cart...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <DashboardLayout title="Shopping Cart" description="Your cart is empty">
        <div className="container py-10 space-y-6 w-full mx-auto">
          <div className="flex items-center gap-2">
            <Link href={getUrl("marketplace")}>
              <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Back to Marketplace
              </a>
            </Link>
          </div>

          <Card className="border-dashed border-2">
            <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Looks like you haven't added any items to your cart yet. Explore
                our marketplace to find agricultural products and services.
              </p>
              <Link href={getUrl("marketplace")}>
                <Button>Browse Marketplace</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Shopping Cart" description={`${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}>
      <div className="container py-10 space-y-6 w-full mx-auto">
        <div className="flex items-center gap-2">
          <Link href={getUrl("marketplace")}>
            <a className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Marketplace
            </a>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>Shopping Cart</span>
                  <span className="text-muted-foreground text-sm font-normal">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                </CardTitle>
                <CardDescription>
                  Review your items before checkout
                </CardDescription>
              </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Product</TableHead>
                    <TableHead className="w-[20%]">Price</TableHead>
                    <TableHead className="w-[20%]">Quantity</TableHead>
                    <TableHead className="w-[20%] text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {item.listing?.title || "Unknown Product"}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {item.listing?.category || "Unknown Category"}
                          </span>
                          {item.notes && (
                            <span className="text-sm italic mt-1">
                              Note: {item.notes}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(item.price))}
                        {item.priceUnit && (
                          <span className="text-sm text-muted-foreground ml-1">
                            /{item.priceUnit}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity, -1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity, 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            <CardFooter className="flex justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-muted-foreground"
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
              <Link href={getUrl("marketplace")}>
                <Button variant="secondary" size="sm">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
          </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">To be calculated</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">To be calculated</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-semibold">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <Alert className="mt-4 bg-primary/5 border border-primary/20">
                <AlertTitle className="text-sm font-medium">
                  Important
                </AlertTitle>
                <AlertDescription className="text-xs">
                  Shipping costs and taxes will be calculated during checkout
                  based on your location.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={processing || itemCount === 0}
              >
                {processing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
