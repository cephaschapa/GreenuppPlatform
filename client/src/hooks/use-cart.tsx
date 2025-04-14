import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { Cart, CartItem, MarketplaceListing } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Type for cart with items and listing details
interface CartWithItems extends Cart {
  items: (CartItem & { listing: MarketplaceListing })[];
}

// Context type
interface CartContextType {
  cart: CartWithItems | null;
  isLoading: boolean;
  error: Error | null;
  itemCount: number;
  subtotal: number;
  addToCart: (listingId: number, quantity?: number, notes?: string) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  startCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  // Fetch user's cart
  const {
    data: cartData,
    error,
    isLoading,
    refetch: refetchCart
  } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/cart");
      const data = await res.json();
      return data as CartWithItems;
    },
    enabled: !!user, // Only fetch if user is logged in
  });

  // Update derived state when cart data changes
  useEffect(() => {
    if (cartData?.items) {
      let count = 0;
      let total = 0;
      cartData.items.forEach((item) => {
        count += item.quantity;
        total += Number(item.price) * item.quantity;
      });
      setItemCount(count);
      setSubtotal(total);
    }
  }, [cartData]);

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ 
      listingId, 
      quantity = 1, 
      notes = "" 
    }: { 
      listingId: number; 
      quantity?: number; 
      notes?: string; 
    }) => {
      const res = await apiRequest("POST", "/api/cart/items", {
        listingId,
        quantity,
        notes
      });
      return await res.json();
    },
    onSuccess: () => {
      refetchCart();
      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add item",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/items/${itemId}`, {
        quantity,
      });
      return await res.json();
    },
    onSuccess: () => {
      refetchCart();
      toast({
        title: "Cart updated",
        description: "Your cart has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update cart",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("DELETE", `/api/cart/items/${itemId}`);
      return await res.json();
    },
    onSuccess: () => {
      refetchCart();
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove item",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/cart/clear");
      return await res.json();
    },
    onSuccess: () => {
      refetchCart();
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to clear cart",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Start checkout process
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cart/checkout");
      return await res.json();
    },
    onSuccess: () => {
      refetchCart();
      toast({
        title: "Checkout started",
        description: "Proceeding to checkout...",
      });
      // In a real app, we would redirect to checkout page here
    },
    onError: (error: any) => {
      toast({
        title: "Failed to checkout",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Wrapper functions with error handling
  const addToCart = async (listingId: number, quantity = 1, notes = "") => {
    try {
      await addToCartMutation.mutateAsync({ listingId, quantity, notes });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateQuantityMutation.mutateAsync({ itemId, quantity });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await removeFromCartMutation.mutateAsync(itemId);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      await clearCartMutation.mutateAsync();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const startCheckout = async () => {
    try {
      await checkoutMutation.mutateAsync();
      // Navigate to checkout page (to be implemented)
    } catch (error) {
      console.error("Error starting checkout:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: cartData || null,
        isLoading,
        error: error as Error | null,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        startCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}