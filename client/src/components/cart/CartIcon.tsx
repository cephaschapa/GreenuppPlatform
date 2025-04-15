import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface CartIconProps {
  variant?: "default" | "sidebar" | "mobile";
  showLabel?: boolean;
}

export function CartIcon({
  variant = "default",
  showLabel = false,
}: CartIconProps) {
  const { itemCount } = useCart();
  const hasItems = itemCount > 0;

  return (
    <Link href="/dashboard/marketplace/cart">
      <a className={cn(
        "flex items-center gap-2 relative",
        variant === "mobile" && "flex-col text-xs",
        variant === "sidebar" && "w-full p-3 hover:bg-primary/10 rounded-md"
      )}>
        <div className="relative">
          <ShoppingCart className={cn(
            "h-5 w-5",
            variant === "sidebar" && "h-6 w-6",
            variant === "mobile" && "h-7 w-7"
          )} />
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