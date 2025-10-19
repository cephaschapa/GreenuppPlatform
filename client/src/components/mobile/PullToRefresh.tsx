import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing || disabled) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      // Apply resistance - harder to pull as you go further
      const resistance = 0.5;
      const adjustedDistance = distance * resistance;
      setPullDistance(Math.min(adjustedDistance, threshold * 1.5));
      
      // Prevent default scrolling when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error("Error refreshing:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    if (isRefreshing) {
      controls.start({
        rotate: 360,
        transition: { duration: 1, repeat: Infinity, ease: "linear" },
      });
    } else {
      controls.stop();
      controls.set({ rotate: 0 });
    }
  }, [isRefreshing, controls]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = progress >= 1;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10"
        style={{
          height: `${pullDistance}px`,
          opacity: progress,
        }}
      >
        <motion.div
          animate={controls}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            shouldTrigger ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isPulling || isRefreshing ? pullDistance : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}


