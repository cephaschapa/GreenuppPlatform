import { ArrowLeft, Menu, MoreVertical, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface HeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onMenuClick?: () => void;
  actions?: HeaderAction[];
  searchable?: boolean;
  onSearchClick?: () => void;
  subtitle?: string;
  className?: string;
}

export function MobileHeader({
  title,
  showBack = false,
  onMenuClick,
  actions = [],
  searchable = false,
  onSearchClick,
  subtitle,
  className,
}: MobileHeaderProps) {
  const [, navigate] = useLocation();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="touch-manipulation min-h-[44px] min-w-[44px] flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="touch-manipulation min-h-[44px] min-w-[44px] flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* Title section */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {searchable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className="touch-manipulation min-h-[44px] min-w-[44px]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}

          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-manipulation min-h-[44px] min-w-[44px]"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {actions.map((action, index) => (
                  <div key={index}>
                    <DropdownMenuItem
                      onClick={action.onClick}
                      className={cn(
                        "min-h-[44px] cursor-pointer",
                        action.variant === "destructive" && "text-destructive focus:text-destructive"
                      )}
                    >
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </DropdownMenuItem>
                    {index < actions.length - 1 && 
                      action.variant === "destructive" && 
                      actions[index + 1]?.variant !== "destructive" && (
                      <DropdownMenuSeparator />
                    )}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}


