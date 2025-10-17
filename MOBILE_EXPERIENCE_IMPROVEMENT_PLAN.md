# 📱 GreenUpp Mobile Experience Improvement Plan

## Executive Summary

This document outlines a comprehensive strategy to enhance the mobile experience for GreenUpp users. The platform currently uses Capacitor to wrap a React/Vite PWA for native mobile deployment. This plan focuses on optimizing the mobile web experience across performance, UI/UX, and functionality to create a seamless, native-like experience for farmers in the field.

---

## 🎯 Goals & Objectives

### Primary Goals

1. **Performance**: Achieve sub-3-second load times on 3G networks
2. **Usability**: Create intuitive, thumb-friendly interfaces
3. **Offline-First**: Enable 80%+ functionality without internet
4. **Native Feel**: Deliver app-like experience via web technologies
5. **Accessibility**: Meet WCAG 2.1 AA standards for mobile

### Target Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 500KB (gzipped initial load)

---

## 📊 Current State Analysis

### ✅ What's Working

- Capacitor integration for Android deployment
- Basic responsive design with Tailwind CSS
- Mobile detection hooks (`use-mobile`, `use-media-query`)
- PWA setup with service workers
- Push notification infrastructure
- Firebase integration

### ⚠️ Areas for Improvement

- Bundle size optimization needed
- Limited offline functionality
- Desktop-first navigation patterns
- No touch gesture support
- Minimal mobile-specific components
- Performance not optimized for low-end devices
- Limited native feature integration
- No app-like transitions/animations

---

## 🛠️ Implementation Phases

## Phase 1: Performance Foundation (Week 1-2)

### 1.1 Bundle Size Optimization

#### Code Splitting & Lazy Loading

```typescript
// Implement route-based code splitting
// client/src/App.tsx

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingScreen from "@/components/mobile/LoadingScreen";

// Lazy load page components
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const FarmerFieldsPage = lazy(() => import("@/pages/farmer/FieldsPage"));
const MarketplacePage = lazy(() => import("@/pages/PublicMarketplacePage"));
const ChatPage = lazy(() => import("@/pages/StreamChatPage"));

// Preload critical routes
const preloadRoutes = () => {
  import("@/pages/dashboard-page");
  import("@/pages/farmer/FieldsPage");
};

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fields/*" element={<FarmerFieldsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Suspense>
  );
}
```

#### Component-Level Splitting

```typescript
// client/src/components/mobile/DynamicComponents.tsx

import { lazy, ComponentType } from "react";

// Heavy components loaded on demand
export const WeatherChart = lazy(
  () => import("@/components/farmer/WeatherChart")
);
export const CropAnalytics = lazy(
  () => import("@/components/farmer/CropAnalytics")
);
export const MarketplaceFilters = lazy(
  () => import("@/components/marketplace/AdvancedFilters")
);
export const ChatInterface = lazy(
  () => import("@/components/chat/StreamChatComponent")
);

// Wrapper for lazy components with loading state
export const LazyComponent = ({
  component: Component,
  fallback = <div>Loading...</div>,
}: {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback}>
    <Component />
  </Suspense>
);
```

#### Vite Configuration Updates

```typescript
// vite.config.ts - Enhanced mobile optimization

export default defineConfig({
  plugins: [
    react(),
    // Visualize bundle size
    visualizer({
      filename: "./dist/stats.html",
      gzipSize: true,
    }),
    // PWA plugin for better offline support
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: "es2015",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "framer-motion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
          ],
          "form-vendor": ["react-hook-form", "zod"],
          "chart-vendor": ["recharts"],
          "stream-chat": ["stream-chat", "stream-chat-react"],

          // Feature chunks
          farmer: [
            "./client/src/pages/farmer/FieldsPage.tsx",
            "./client/src/pages/farmer/CropDetailPage.tsx",
          ],
          marketplace: [
            "./client/src/pages/PublicMarketplacePage.tsx",
            "./client/src/components/marketplace/ListingCard.tsx",
          ],
          auth: [
            "./client/src/pages/auth-page.tsx",
            "./client/src/components/auth/OAuthButtons.tsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
```

### 1.2 Image Optimization

#### Responsive Images Component

```typescript
// client/src/components/mobile/OptimizedImage.tsx

import { useState, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  sizes = "100vw",
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(priority ? src : "");

  useEffect(() => {
    if (!priority) {
      // Lazy load non-priority images
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(src);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "50px" }
      );

      const element = document.getElementById(`img-${src}`);
      if (element) observer.observe(element);

      return () => observer.disconnect();
    }
  }, [src, priority]);

  return (
    <div
      id={`img-${src}`}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder blur */}
      {!isLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};

// WebP with fallback
export const WebPImage = ({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, ".webp");

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} className={className} loading="lazy" />
    </picture>
  );
};
```

### 1.3 Service Worker Enhancements

```typescript
// client/src/service-worker.ts - Enhanced offline support

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { BackgroundSyncPlugin } from "workbox-background-sync";

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// API requests - Network first with background sync fallback
const bgSyncPlugin = new BackgroundSyncPlugin("api-queue", {
  maxRetentionTime: 24 * 60, // 24 hours
});

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
      bgSyncPlugin,
    ],
  })
);

// Images - Cache first
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Fonts - Cache first
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Static assets - Stale while revalidate
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);

// App shell - Cache first for offline support
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: "app-shell",
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
      ],
    })
  )
);

// Offline fallback page
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline.html");
      })
    );
  }
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

---

## Phase 2: Mobile-First UI/UX (Week 3-4)

### 2.1 Mobile Navigation System

#### Bottom Navigation Bar

```typescript
// client/src/components/mobile/BottomNav.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { Home, Leaf, ShoppingBag, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Leaf, label: "Fields", path: "/fields" },
    { icon: ShoppingBag, label: "Market", path: "/marketplace" },
    { icon: MessageCircle, label: "Chat", path: "/chat", badge: 3 },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-inset-bottom">
      <nav className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full",
                "transition-colors duration-200",
                "active:bg-muted touch-manipulation min-h-[44px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />

                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
```

#### Mobile Header

```typescript
// client/src/components/mobile/MobileHeader.tsx

import { ArrowLeft, Menu, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
}

export const MobileHeader = ({
  title,
  showBack = false,
  showMenu = false,
  actions = [],
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              className="touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Center */}
        <h1 className="text-lg font-semibold truncate">{title}</h1>

        {/* Right */}
        <div>
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="touch-manipulation min-h-[44px] min-w-[44px]"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.onClick}
                    className="min-h-[44px]"
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
```

### 2.2 Touch-Optimized Components

#### Swipeable Cards

```typescript
// client/src/components/mobile/SwipeableCard.tsx

import { useRef, useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Trash2, Archive, Star } from "lucide-react";

interface SwipeAction {
  icon: React.ElementType;
  color: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
}

export const SwipeableCard = ({
  children,
  leftAction,
  rightAction,
  threshold = 100,
}: SwipeableCardProps) => {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);

    const swipeDistance = info.offset.x;

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0 && leftAction) {
        // Swipe right
        controls.start({ x: 300, opacity: 0 });
        setTimeout(() => leftAction.onAction(), 200);
      } else if (swipeDistance < 0 && rightAction) {
        // Swipe left
        controls.start({ x: -300, opacity: 0 });
        setTimeout(() => rightAction.onAction(), 200);
      } else {
        controls.start({ x: 0 });
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        {leftAction && (
          <div className={`flex items-center gap-2 ${leftAction.color}`}>
            <leftAction.icon className="w-5 h-5" />
          </div>
        )}
        {rightAction && (
          <div className={`flex items-center gap-2 ${rightAction.color}`}>
            <rightAction.icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: rightAction ? -150 : 0,
          right: leftAction ? 150 : 0,
        }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Usage example
export const TaskCard = ({ task, onDelete, onComplete }: any) => (
  <SwipeableCard
    leftAction={{
      icon: Star,
      color: "text-green-600",
      onAction: () => onComplete(task.id),
    }}
    rightAction={{
      icon: Trash2,
      color: "text-red-600",
      onAction: () => onDelete(task.id),
    }}
  >
    <div className="p-4 border-b border-border">
      <h3 className="font-medium">{task.title}</h3>
      <p className="text-sm text-muted-foreground">{task.description}</p>
    </div>
  </SwipeableCard>
);
```

#### Pull to Refresh

```typescript
// client/src/components/mobile/PullToRefresh.tsx

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
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
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: progress,
        }}
      >
        <motion.div
          animate={controls}
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            shouldTrigger ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Content */}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
};
```

### 2.3 Mobile-Optimized Forms

```typescript
// client/src/components/mobile/MobileForm.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mobile-optimized input with proper keyboard
export const MobileInput = ({
  label,
  type = "text",
  inputMode,
  ...props
}: any) => (
  <div className="space-y-2">
    {label && (
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
    )}
    <input
      type={type}
      inputMode={inputMode}
      className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
      {...props}
    />
  </div>
);

// Number input with +/- buttons
export const NumberInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
}: any) => {
  const handleIncrement = () => {
    if (value < max) onChange(value + step);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - step);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-12 w-12 touch-manipulation"
        >
          -
        </Button>
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 h-12 text-center text-lg font-semibold border border-input rounded-md bg-background"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-12 w-12 touch-manipulation"
        >
          +
        </Button>
      </div>
    </div>
  );
};
```

---

## Phase 3: Native Feature Integration (Week 5-6)

### 3.1 Camera Integration

```typescript
// client/src/hooks/use-camera.ts

import { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: "uri" | "base64";
  source?: "camera" | "photos" | "prompt";
}

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const takePicture = async (options: CameraOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isNative) {
        // Web fallback - use native file input
        return await webCameraFallback();
      }

      const image = await Camera.getPhoto({
        quality: options.quality || 80,
        allowEditing: options.allowEditing || false,
        resultType:
          options.resultType === "base64"
            ? CameraResultType.Base64
            : CameraResultType.Uri,
        source: getCameraSource(options.source || "prompt"),
      });

      return {
        uri: image.webPath,
        base64: image.base64String,
        format: image.format,
      };
    } catch (err: any) {
      setError(err.message || "Failed to capture image");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCameraSource = (source: string) => {
    switch (source) {
      case "camera":
        return CameraSource.Camera;
      case "photos":
        return CameraSource.Photos;
      default:
        return CameraSource.Prompt;
    }
  };

  const webCameraFallback = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";

      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              uri: event.target?.result as string,
              base64: null,
              format: file.type,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else {
          reject(new Error("No file selected"));
        }
      };

      input.click();
    });
  };

  return {
    takePicture,
    isLoading,
    error,
    isNative,
  };
};
```

### 3.2 Geolocation Integration

```typescript
// client/src/hooks/use-geolocation.ts

import { useState, useEffect } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const getCurrentPosition = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request permissions
      const permissions = await Geolocation.requestPermissions();

      if (permissions.location === "denied") {
        throw new Error("Location permission denied");
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 0,
      });

      setPosition(position);
      return position;
    } catch (err: any) {
      setError(err.message || "Failed to get location");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const watchPosition = (callback: (position: Position) => void) => {
    let watchId: string;

    (async () => {
      try {
        watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: options.enableHighAccuracy ?? true,
            timeout: options.timeout ?? 10000,
            maximumAge: options.maximumAge ?? 5000,
          },
          (position, err) => {
            if (err) {
              setError(err.message);
            } else if (position) {
              setPosition(position);
              callback(position);
            }
          }
        );
      } catch (err: any) {
        setError(err.message);
      }
    })();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  };

  return {
    position,
    getCurrentPosition,
    watchPosition,
    isLoading,
    error,
    isNative,
  };
};
```

### 3.3 Haptic Feedback

```typescript
// client/src/hooks/use-haptics.ts

import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const impact = async (style: "light" | "medium" | "heavy" = "medium") => {
    if (!isNative) return;

    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  const notification = async (
    type: "success" | "warning" | "error" = "success"
  ) => {
    if (!isNative) return;

    try {
      await Haptics.notification({
        type: type.toUpperCase() as any,
      });
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  const vibrate = async (duration: number = 100) => {
    if (!isNative) {
      // Web fallback
      if ("vibrate" in navigator) {
        navigator.vibrate(duration);
      }
      return;
    }

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  const selectionStart = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  const selectionEnd = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    isSupported: isNative,
  };
};
```

### 3.4 Native Share

```typescript
// client/src/hooks/use-share.ts

import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
  files?: string[];
}

export const useShare = () => {
  const isNative = Capacitor.isNativePlatform();

  const share = async (options: ShareOptions) => {
    try {
      if (!isNative) {
        // Web Share API fallback
        if (navigator.share) {
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url,
          });
          return { success: true };
        } else {
          // Fallback to copying link
          if (options.url) {
            await navigator.clipboard.writeText(options.url);
            return { success: true, message: "Link copied to clipboard" };
          }
          throw new Error("Share not supported");
        }
      }

      // Native share
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || "Share",
      });

      return { success: true };
    } catch (error: any) {
      if (error.message === "Share canceled") {
        return { success: false, canceled: true };
      }
      throw error;
    }
  };

  const canShare = async () => {
    if (isNative) return true;
    return "share" in navigator;
  };

  return {
    share,
    canShare,
    isSupported: isNative || "share" in navigator,
  };
};
```

---

## Phase 4: Offline Functionality (Week 7-8)

### 4.1 IndexedDB Wrapper

```typescript
// client/src/lib/offline-storage.ts

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface GreenuppDB extends DBSchema {
  fields: {
    key: string;
    value: any;
    indexes: { "by-user": string };
  };
  crops: {
    key: string;
    value: any;
    indexes: { "by-field": string };
  };
  tasks: {
    key: string;
    value: any;
    indexes: { "by-date": string };
  };
  sync_queue: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      timestamp: number;
      retries: number;
    };
  };
  cache: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<GreenuppDB> | null = null;
  private dbName = "greenupp-offline";
  private version = 1;

  async init() {
    this.db = await openDB<GreenuppDB>(this.dbName, this.version, {
      upgrade(db) {
        // Fields store
        if (!db.objectStoreNames.contains("fields")) {
          const fieldStore = db.createObjectStore("fields", { keyPath: "id" });
          fieldStore.createIndex("by-user", "userId");
        }

        // Crops store
        if (!db.objectStoreNames.contains("crops")) {
          const cropStore = db.createObjectStore("crops", { keyPath: "id" });
          cropStore.createIndex("by-field", "fieldId");
        }

        // Tasks store
        if (!db.objectStoreNames.contains("tasks")) {
          const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
          taskStore.createIndex("by-date", "dueDate");
        }

        // Sync queue
        if (!db.objectStoreNames.contains("sync_queue")) {
          db.createObjectStore("sync_queue", { keyPath: "id" });
        }

        // Generic cache
        if (!db.objectStoreNames.contains("cache")) {
          db.createObjectStore("cache", { keyPath: "key" });
        }
      },
    });
  }

  async setItem(store: keyof GreenuppDB, item: any) {
    if (!this.db) await this.init();
    await this.db!.put(store as any, item);
  }

  async getItem(store: keyof GreenuppDB, key: string) {
    if (!this.db) await this.init();
    return await this.db!.get(store as any, key);
  }

  async getAllItems(store: keyof GreenuppDB) {
    if (!this.db) await this.init();
    return await this.db!.getAll(store as any);
  }

  async deleteItem(store: keyof GreenuppDB, key: string) {
    if (!this.db) await this.init();
    await this.db!.delete(store as any, key);
  }

  async clear(store: keyof GreenuppDB) {
    if (!this.db) await this.init();
    await this.db!.clear(store as any);
  }

  // Cache with expiration
  async cacheData(key: string, data: any, ttl: number = 3600000) {
    // ttl in ms, default 1 hour
    await this.setItem("cache", {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  async getCachedData(key: string) {
    const cached = await this.getItem("cache", key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      await this.deleteItem("cache", key);
      return null;
    }

    return cached.data;
  }

  // Sync queue operations
  async addToSyncQueue(type: string, data: any) {
    const id = `${type}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    await this.setItem("sync_queue", {
      id,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    });
    return id;
  }

  async getSyncQueue() {
    return await this.getAllItems("sync_queue");
  }

  async removeSyncItem(id: string) {
    await this.deleteItem("sync_queue", id);
  }

  async updateSyncItem(id: string, updates: Partial<any>) {
    const item = await this.getItem("sync_queue", id);
    if (item) {
      await this.setItem("sync_queue", { ...item, ...updates });
    }
  }
}

export const offlineStorage = new OfflineStorage();
```

### 4.2 Offline Sync Manager

```typescript
// client/src/lib/sync-manager.ts

import { offlineStorage } from "./offline-storage";

type SyncHandler = (data: any) => Promise<void>;

class SyncManager {
  private handlers: Map<string, SyncHandler> = new Map();
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  registerHandler(type: string, handler: SyncHandler) {
    this.handlers.set(type, handler);
  }

  async addToQueue(type: string, data: any) {
    await offlineStorage.addToSyncQueue(type, data);

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.sync();
    }
  }

  async sync() {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;

    try {
      const queue = await offlineStorage.getSyncQueue();

      for (const item of queue) {
        const handler = this.handlers.get(item.type);

        if (!handler) {
          console.warn(`No handler registered for sync type: ${item.type}`);
          continue;
        }

        try {
          await handler(item.data);
          await offlineStorage.removeSyncItem(item.id);
        } catch (error) {
          console.error(`Sync failed for ${item.type}:`, error);

          // Increment retry count
          await offlineStorage.updateSyncItem(item.id, {
            retries: item.retries + 1,
          });

          // Remove after 5 failed attempts
          if (item.retries >= 5) {
            await offlineStorage.removeSyncItem(item.id);
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  startAutoSync(intervalMs: number = 60000) {
    // Sync every minute by default
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, intervalMs);

    // Sync when coming back online
    window.addEventListener("online", () => {
      this.sync();
    });
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getSyncQueueSize() {
    return offlineStorage.getSyncQueue().then((queue) => queue.length);
  }
}

export const syncManager = new SyncManager();
```

### 4.3 Offline-Aware API Wrapper

```typescript
// client/src/lib/offline-api.ts

import { offlineStorage } from "./offline-storage";
import { syncManager } from "./sync-manager";

interface ApiOptions extends RequestInit {
  offline?: {
    cache?: boolean;
    ttl?: number;
    fallback?: any;
  };
}

export class OfflineApi {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `api_${endpoint}`;

    // Check if offline
    if (!navigator.onLine) {
      // Try to get cached data
      if (options.offline?.cache) {
        const cached = await offlineStorage.getCachedData(cacheKey);
        if (cached) {
          return cached as T;
        }
      }

      // Return fallback if provided
      if (options.offline?.fallback !== undefined) {
        return options.offline.fallback;
      }

      throw new Error("Offline and no cached data available");
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful response
      if (options.offline?.cache) {
        await offlineStorage.cacheData(cacheKey, data, options.offline.ttl);
      }

      return data;
    } catch (error) {
      // If request fails and we're online, try cache
      if (navigator.onLine && options.offline?.cache) {
        const cached = await offlineStorage.getCachedData(cacheKey);
        if (cached) {
          return cached as T;
        }
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T> {
    // If offline, queue for later
    if (!navigator.onLine) {
      await syncManager.addToQueue("POST", {
        endpoint,
        data,
        options,
      });

      // Return optimistic response
      return data;
    }

    return this.fetch<T>(endpoint, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, options?: ApiOptions): Promise<T> {
    if (!navigator.onLine) {
      await syncManager.addToQueue("PUT", {
        endpoint,
        data,
        options,
      });
      return data;
    }

    return this.fetch<T>(endpoint, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    if (!navigator.onLine) {
      await syncManager.addToQueue("DELETE", {
        endpoint,
        options,
      });
      return {} as T;
    }

    return this.fetch<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

export const api = new OfflineApi();
```

---

## Phase 5: Enhanced Mobile Features (Week 9-10)

### 5.1 Install Prompt (PWA)

```typescript
// client/src/components/mobile/InstallPrompt.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 30 seconds or on second visit
      const installPromptShown = localStorage.getItem("installPromptShown");
      if (!installPromptShown) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      localStorage.setItem("installPromptShown", "true");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("installPromptShown", "true");
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Install GreenUpp</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add to your home screen for quick access and offline use
              </p>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstall} className="flex-1">
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
```

### 5.2 Network Status Indicator

```typescript
// client/src/components/mobile/NetworkStatus.tsx

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { syncManager } from "@/lib/sync-manager";

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
      // Trigger sync
      syncManager.sync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Update sync queue size periodically
    const interval = setInterval(async () => {
      const size = await syncManager.getSyncQueueSize();
      setSyncQueue(size);
    }, 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && showOffline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>You're offline</span>
            {syncQueue > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {syncQueue} pending
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### 5.3 Loading States

```typescript
// client/src/components/mobile/LoadingScreen.tsx

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingScreen = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </motion.div>
  </div>
);

// Skeleton loader
export const SkeletonCard = () => (
  <div className="p-4 border border-border rounded-lg">
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded animate-pulse" />
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
    </div>
  </div>
);

// Inline loader
export const InlineLoader = () => (
  <div className="flex items-center justify-center py-4">
    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
);
```

---

## 📈 Success Metrics & Monitoring

### Key Performance Indicators

1. **Performance Metrics**

   - Lighthouse mobile score > 90
   - Core Web Vitals all green
   - Bundle size < 500KB initial load
   - API response caching > 80%

2. **User Experience Metrics**

   - Mobile bounce rate < 40%
   - Session duration increase > 30%
   - Task completion rate > 85%
   - User satisfaction score > 4.5/5

3. **Technical Metrics**
   - Offline functionality success rate > 95%
   - Sync success rate > 98%
   - Error rate < 1%
   - Crash rate < 0.5%

### Monitoring Tools

```typescript
// client/src/lib/performance-monitor.ts

export class PerformanceMonitor {
  static trackPageLoad() {
    if (!window.performance) return;

    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0] as any;

      // Track metrics
      console.log({
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        ttfb: perfData.responseStart - perfData.requestStart,
        download: perfData.responseEnd - perfData.responseStart,
        domInteractive: perfData.domInteractive,
        domComplete: perfData.domComplete,
        loadComplete: perfData.loadEventEnd,
      });
    });
  }

  static trackWebVitals() {
    // Implement CLS, FID, LCP tracking
    // Use web-vitals library
  }

  static trackUserActions() {
    // Track key user interactions
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.track) {
        console.log("User action:", target.dataset.track);
      }
    });
  }
}
```

---

## 🚀 Deployment & Rollout Strategy

### Phase Rollout

1. **Beta Testing (Week 11)**

   - Internal testing with team
   - Bug fixes and optimization
   - Performance testing on real devices

2. **Soft Launch (Week 12)**

   - Release to 10% of mobile users
   - Monitor metrics closely
   - Gather feedback

3. **Gradual Rollout (Week 13-14)**

   - Increase to 50% of users
   - Address any issues
   - Continue optimization

4. **Full Launch (Week 15)**
   - 100% rollout
   - Marketing push
   - User education materials

---

## 📚 Documentation Requirements

### Developer Documentation

- Component API documentation
- Hook usage guidelines
- Performance best practices
- Offline sync patterns

### User Documentation

- Mobile app installation guide
- Offline usage guide
- Feature tutorials
- FAQ section

---

## 🔧 Maintenance & Updates

### Regular Tasks

- **Weekly**: Performance monitoring review
- **Bi-weekly**: Security updates
- **Monthly**: Dependency updates
- **Quarterly**: Major feature releases

### Long-term Roadmap

1. **Q1 2026**: AR features for crop diagnosis
2. **Q2 2026**: Voice interface integration
3. **Q3 2026**: IoT sensor integration
4. **Q4 2026**: ML-powered recommendations

---

## 📊 Budget & Resources

### Development Time

- **Phase 1-2**: 4 weeks (1 developer)
- **Phase 3-4**: 4 weeks (1 developer)
- **Phase 5**: 2 weeks (1 developer)
- **Testing & Polish**: 2 weeks
- **Total**: 12 weeks

### Infrastructure

- CDN for static assets
- Image optimization service
- Analytics platform
- Error tracking (Sentry)

---

## ✅ Checklist for Each Phase

### Phase 1: Performance

- [ ] Implement code splitting
- [ ] Optimize bundle size
- [ ] Add lazy loading
- [ ] Enhance service worker
- [ ] Optimize images
- [ ] Test on 3G network

### Phase 2: UI/UX

- [ ] Create bottom navigation
- [ ] Build mobile header
- [ ] Implement swipe gestures
- [ ] Add pull-to-refresh
- [ ] Optimize forms
- [ ] Test touch interactions

### Phase 3: Native Features

- [ ] Integrate camera
- [ ] Add geolocation
- [ ] Implement haptics
- [ ] Add native share
- [ ] Test on real devices

### Phase 4: Offline

- [ ] Setup IndexedDB
- [ ] Build sync manager
- [ ] Create offline API
- [ ] Test offline scenarios
- [ ] Handle edge cases

### Phase 5: Polish

- [ ] Add install prompt
- [ ] Create loading states
- [ ] Add network indicator
- [ ] Performance testing
- [ ] User acceptance testing

---

## 🎯 Conclusion

This comprehensive plan transforms the GreenUpp platform into a best-in-class mobile experience. By focusing on performance, native-like interactions, and offline capabilities, we'll create an app that farmers can rely on in the field, regardless of network conditions.

**Next Steps**: Begin Phase 1 implementation with bundle optimization and code splitting.
