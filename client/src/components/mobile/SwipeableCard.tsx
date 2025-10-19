import { useRef, useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Trash2, Archive, Star, Check } from "lucide-react";

export interface SwipeAction {
  icon: React.ElementType;
  color: string;
  backgroundColor: string;
  onAction: () => void;
  label?: string;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  threshold = 100,
  disabled = false,
}: SwipeableCardProps) {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleDragStart = () => {
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    const distance = info.offset.x;
    
    // Determine swipe direction
    if (Math.abs(distance) > 10) {
      setSwipeDirection(distance > 0 ? 'right' : 'left');
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(false);
    const swipeDistance = info.offset.x;

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0 && leftAction) {
        // Swipe right - complete/approve action
        controls.start({ x: 300, opacity: 0 });
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        setTimeout(() => {
          leftAction.onAction();
          controls.set({ x: 0, opacity: 1 });
        }, 200);
      } else if (swipeDistance < 0 && rightAction) {
        // Swipe left - delete/archive action
        controls.start({ x: -300, opacity: 0 });
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 10, 30]);
        }
        
        setTimeout(() => {
          rightAction.onAction();
          controls.set({ x: 0, opacity: 1 });
        }, 200);
      } else {
        controls.start({ x: 0 });
      }
    } else {
      controls.start({ x: 0 });
      setSwipeDirection(null);
    }
  };

  return (
    <div className="relative overflow-hidden touch-manipulation">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {/* Left action (swipe right) */}
        {leftAction && (
          <div
            className={`flex items-center gap-2 ${leftAction.color} transition-opacity`}
            style={{ opacity: swipeDirection === 'right' ? 1 : 0.3 }}
          >
            <leftAction.icon className="w-6 h-6" />
            {leftAction.label && (
              <span className="text-sm font-medium">{leftAction.label}</span>
            )}
          </div>
        )}
        
        {/* Right action (swipe left) */}
        {rightAction && (
          <div
            className={`flex items-center gap-2 ${rightAction.color} transition-opacity`}
            style={{ opacity: swipeDirection === 'left' ? 1 : 0.3 }}
          >
            {rightAction.label && (
              <span className="text-sm font-medium">{rightAction.label}</span>
            )}
            <rightAction.icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Card content */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: rightAction ? -150 : 0, right: leftAction ? 150 : 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative bg-background cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Pre-built swipe actions for common use cases
export const SwipeActions = {
  complete: {
    icon: Check,
    color: "text-green-600",
    backgroundColor: "bg-green-100",
    label: "Complete",
  },
  delete: {
    icon: Trash2,
    color: "text-red-600",
    backgroundColor: "bg-red-100",
    label: "Delete",
  },
  archive: {
    icon: Archive,
    color: "text-orange-600",
    backgroundColor: "bg-orange-100",
    label: "Archive",
  },
  favorite: {
    icon: Star,
    color: "text-yellow-600",
    backgroundColor: "bg-yellow-100",
    label: "Favorite",
  },
};

// Usage example component
export function SwipeableTaskCard({ task, onComplete, onDelete }: any) {
  return (
    <SwipeableCard
      leftAction={{
        ...SwipeActions.complete,
        onAction: () => onComplete(task.id),
      }}
      rightAction={{
        ...SwipeActions.delete,
        onAction: () => onDelete(task.id),
      }}
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">{task.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
      </div>
    </SwipeableCard>
  );
}


