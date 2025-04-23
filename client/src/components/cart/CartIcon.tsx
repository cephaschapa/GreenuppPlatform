import { useState } from "react";
import { ShoppingCart, X, ChevronRight, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface CartIconProps {
  variant?: "default" | "sidebar" | "mobile";
  showLabel?: boolean;
}

export function CartIcon({
  variant = "default",
  showLabel = false,
}: CartIconProps) {
  const { cart, itemCount, updateQuantity, removeFromCart } = useCart();
  const hasItems = itemCount > 0;
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    } else {
      removeFromCart(itemId);
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    setLocation("/dashboard/marketplace/cart");
  };

  // For non-mobile sidebar variant, we still use the direct link approach
  if (variant === "sidebar") {
    return (
      <Link href="/dashboard/marketplace/cart">
        <a className="w-full p-3 hover:bg-primary/10 rounded-md flex items-center gap-2 relative">
          <div className="relative">
            <ShoppingCart className="h-4 w-4" />
            {hasItems && (
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-primary text-primary-foreground"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            )}
          </div>
          {showLabel && <span>Cart</span>}
        </a>
      </Link>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-full w-16 p-0",
            variant === "mobile" && "flex-col p-0"
          )}
        >
          <ShoppingCart className={cn(
            "h-5 w-5",
            variant === "mobile" && "h-7 w-7"
          )} />
          {hasItems && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-primary text-primary-foreground"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Your Cart</h3>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {!hasItems ? (
          <div className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Your cart is empty</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setOpen(false);
                setLocation("/dashboard/marketplace");
              }}
              className="mx-auto"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-60">
              <div className="flex flex-col gap-2 p-2">
                {cart?.items.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg border hover:bg-muted/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded bg-muted/80 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight truncate">{item.listing?.title || "Product"}</p>
                        <p className="text-xs text-muted-foreground mb-1">{formatCurrency(Number(item.price))}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs px-2">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="text-sm font-medium">{formatCurrency(cart?.items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0) || 0)}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">Items:</span>
                <span className="text-sm">{itemCount}</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={handleCheckout}>
                  Checkout
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/marketplace/cart" onClick={() => setOpen(false)}>
                    View Cart
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}