# 📱 Mobile Components - Usage Guide

## 🎯 Overview

Complete guide for using all the mobile components and hooks we've built. All components are touch-optimized, responsive, and work seamlessly on mobile devices.

---

## 📦 What's Available

### Components
- `PullToRefresh` - Pull down to refresh
- `SwipeableCard` - Swipe gestures for actions
- `MobileHeader` - Mobile-optimized page header
- `NetworkStatus` - Online/offline indicator
- `InstallPrompt` - PWA install prompt
- `LoadingScreen` - Full-screen loader
- `Skeleton` components - Loading placeholders
- `CloudinaryImage` - Optimized image display

### Hooks
- `useCamera` - Camera access
- `useGeolocation` - GPS/location
- `useHaptics` - Vibration feedback
- `useShare` - Native sharing
- `useNetworkStatus` - Network state
- `useIsMobile` - Mobile detection

---

## 🔨 Component Usage

### 1. Pull-to-Refresh

Add pull-to-refresh to any scrollable list:

```tsx
import { PullToRefresh } from "@/components/mobile";

function MyListPage() {
  const { refetch } = useQuery(...);

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div>
        {/* Your list content */}
        {items.map(item => <ItemCard key={item.id} {...item} />)}
      </div>
    </PullToRefresh>
  );
}
```

**Features**:
- ✅ Pull down to refresh
- ✅ Haptic feedback on trigger
- ✅ Loading animation
- ✅ Automatic threshold detection

---

### 2. Swipeable Cards

Add swipe actions to list items:

```tsx
import { SwipeableCard, SwipeActions } from "@/components/mobile";
import { Trash2, Check } from "lucide-react";

function TaskList({ tasks, onComplete, onDelete }: any) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <SwipeableCard
          key={task.id}
          leftAction={{
            icon: Check,
            color: "text-green-600",
            backgroundColor: "bg-green-100",
            label: "Complete",
            onAction: () => onComplete(task.id),
          }}
          rightAction={{
            icon: Trash2,
            color: "text-red-600",
            backgroundColor: "bg-red-100",
            label: "Delete",
            onAction: () => onDelete(task.id),
          }}
        >
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
        </SwipeableCard>
      ))}
    </div>
  );
}

// Or use pre-built actions
<SwipeableCard
  leftAction={{
    ...SwipeActions.complete,
    onAction: () => handleComplete(),
  }}
  rightAction={{
    ...SwipeActions.delete,
    onAction: () => handleDelete(),
  }}
>
  {/* Your content */}
</SwipeableCard>
```

**Pre-built Actions**:
- `SwipeActions.complete` - Green checkmark
- `SwipeActions.delete` - Red trash
- `SwipeActions.archive` - Orange archive
- `SwipeActions.favorite` - Yellow star

---

### 3. Mobile Header

Add a mobile-optimized header to your pages:

```tsx
import { MobileHeader } from "@/components/mobile";
import { Share, Edit, Trash } from "lucide-react";

function ProductDetailPage() {
  const [, navigate] = useLocation();
  const { share } = useShare();

  const actions = [
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: () => navigate("/edit"),
    },
    {
      label: "Share",
      icon: <Share className="w-4 h-4" />,
      onClick: () => share({ title: "Product", url: window.location.href }),
    },
    {
      label: "Delete",
      icon: <Trash className="w-4 h-4" />,
      onClick: () => handleDelete(),
      variant: "destructive",
    },
  ];

  return (
    <div>
      <MobileHeader
        title="Product Details"
        subtitle="Fresh Tomatoes"
        showBack
        actions={actions}
        searchable
        onSearchClick={() => console.log("Search")}
      />
      
      {/* Page content */}
    </div>
  );
}
```

**Props**:
- `title` - Page title (required)
- `subtitle` - Optional subtitle
- `showBack` - Show back button
- `onMenuClick` - Menu button handler
- `actions` - Dropdown menu actions
- `searchable` - Show search button
- `onSearchClick` - Search handler

---

### 4. Loading States

Replace spinners with skeleton loaders:

```tsx
import { SkeletonList, SkeletonCard, LoadingScreen, InlineLoader } from "@/components/mobile";

// Full page loading
if (isLoading) {
  return <LoadingScreen message="Loading your fields..." />;
}

// List loading
if (isLoading) {
  return <SkeletonList count={5} />;
}

// Card loading
if (isLoading) {
  return <SkeletonCard />;
}

// Inline loading
{isLoading && <InlineLoader message="Fetching data..." />}
```

**Available**:
- `LoadingScreen` - Full screen with logo
- `SkeletonList` - Multiple skeleton cards
- `SkeletonCard` - Single card skeleton
- `SkeletonTable` - Table row skeletons
- `SkeletonPage` - Full page skeleton
- `InlineLoader` - Small inline spinner
- `Spinner` - Just the spinner icon

---

### 5. Network Status

Automatically show online/offline status:

```tsx
// Already added to App.tsx - works globally!
// Shows banner at top when offline

// For inline status in components:
import { InlineNetworkStatus, useNetworkStatus } from "@/components/mobile";

function MyComponent() {
  const { isOnline, isOffline, wasOffline } = useNetworkStatus();

  return (
    <div>
      <InlineNetworkStatus />
      
      {isOffline && (
        <div>Working offline - changes will sync later</div>
      )}
      
      {wasOffline && (
        <div>Just reconnected! Syncing...</div>
      )}
    </div>
  );
}
```

---

### 6. PWA Install Prompt

Automatically shows after 30 seconds or on second visit:

```tsx
// Already added to App.tsx - works automatically!
// Users will see prompt to install app

// Manually trigger (optional):
import { InstallPrompt } from "@/components/mobile";

// The component handles everything automatically
<InstallPrompt />
```

**Features**:
- ✅ Auto-shows on Android/Desktop
- ✅ iOS-specific instructions
- ✅ Remembers dismissal
- ✅ Visit counter

---

### 7. Cloudinary Images

Display optimized images with loading states:

```tsx
import { CloudinaryImage, MarketplaceImage, CloudinaryAvatar } from "@/components/mobile";

// Product/listing images
<MarketplaceImage
  src={listing.images[0]}
  alt={listing.title}
  priority={index === 0} // Prioritize first image
/>

// User avatars
<CloudinaryAvatar
  src={user.profileImage}
  alt={user.username}
  size={40}
  fallback={user.username[0]}
/>

// General images
<CloudinaryImage
  src={post.imageUrl}
  alt="Post image"
  width={600}
  height={400}
  thumbnail={false}
/>
```

**Features**:
- ✅ Auto-optimizes Cloudinary URLs
- ✅ Loading placeholders
- ✅ Error handling
- ✅ Works with local URLs too
- ✅ CDN indicator on hover

---

## 🎣 Hook Usage

### 1. useCamera

Capture photos from camera or gallery:

```tsx
import { useCamera } from "@/hooks/use-mobile-features";

function AddPhotoButton() {
  const { takePicture, isLoading, error } = useCamera();

  const handleTakePhoto = async () => {
    const result = await takePicture({
      quality: 80,
      source: "prompt", // Shows camera/gallery choice
      resultType: "uri",
    });

    if (result) {
      console.log("Photo captured:", result.uri);
      // Upload to server or use directly
    }
  };

  return (
    <button onClick={handleTakePhoto} disabled={isLoading}>
      {isLoading ? "Processing..." : "Take Photo"}
    </button>
  );
}
```

**Options**:
- `quality`: 0-100 (default: 80)
- `source`: "camera" | "photos" | "prompt"
- `resultType`: "uri" | "base64"
- `allowEditing`: boolean

---

### 2. useGeolocation

Get user's location:

```tsx
import { useGeolocation } from "@/hooks/use-mobile-features";

function FieldLocationPicker() {
  const { getCurrentPosition, coordinates, isLoading, error } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  const handleGetLocation = async () => {
    const coords = await getCurrentPosition();
    if (coords) {
      console.log(`Lat: ${coords.latitude}, Lng: ${coords.longitude}`);
      // Save to field
    }
  };

  return (
    <div>
      <button onClick={handleGetLocation} disabled={isLoading}>
        {isLoading ? "Getting location..." : "Use My Location"}
      </button>
      
      {coordinates && (
        <div>
          Location: {coordinates.latitude}, {coordinates.longitude}
          {coordinates.accuracy && (
            <span> (±{coordinates.accuracy.toFixed(0)}m)</span>
          )}
        </div>
      )}
      
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
```

**Watch position** (continuous tracking):
```tsx
useEffect(() => {
  const unwatch = watchPosition((coords) => {
    console.log("Position updated:", coords);
    updateMapMarker(coords);
  });

  return () => unwatch();
}, []);
```

---

### 3. useHaptics

Add tactile feedback:

```tsx
import { useHaptics } from "@/hooks/use-mobile-features";

function InteractiveButton() {
  const { impact, notification } = useHaptics();

  const handleClick = () => {
    impact("light"); // Light vibration
    // Do action
  };

  const handleSuccess = () => {
    notification("success"); // Success pattern
    // Show success message
  };

  const handleError = () => {
    notification("error"); // Error pattern
    // Show error message
  };

  return (
    <>
      <button onClick={handleClick}>
        Tap me (feels good!)
      </button>
      <button onClick={handleSuccess}>
        Complete
      </button>
    </>
  );
}
```

**Methods**:
- `impact("light" | "medium" | "heavy")` - Quick tap feedback
- `notification("success" | "warning" | "error")` - Event feedback
- `vibrate(100)` or `vibrate([100, 50, 100])` - Custom pattern

**Use Cases**:
- Button taps → `impact("light")`
- Form submission → `notification("success")`
- Error → `notification("error")`
- Swipe actions → `impact("medium")`
- Long press → `impact("heavy")`

---

### 4. useShare

Share content natively:

```tsx
import { useShare } from "@/hooks/use-mobile-features";

function ShareButton({ product }: any) {
  const { share, canShare, isSupported } = useShare();

  const handleShare = async () => {
    const result = await share({
      title: product.title,
      text: `Check out ${product.title} on GreenUpp!`,
      url: window.location.href,
    });

    if (result.success) {
      console.log(`Shared via ${result.method}`);
      // Show success toast
    } else if (result.canceled) {
      // User canceled
    }
  };

  if (!isSupported) return null;

  return (
    <button onClick={handleShare}>
      Share Product
    </button>
  );
}
```

**Fallbacks**:
- Native share → Web Share API → Clipboard copy

---

### 5. useNetworkStatus

React to network changes:

```tsx
import { useNetworkStatus } from "@/components/mobile";

function DataSyncIndicator() {
  const { isOnline, isOffline, wasOffline } = useNetworkStatus();

  useEffect(() => {
    if (wasOffline) {
      // Just came back online - sync data
      syncPendingChanges();
    }
  }, [wasOffline]);

  return (
    <div>
      {isOffline && (
        <div className="text-amber-600">
          Offline - Changes saved locally
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Complete Examples

### Example 1: Task List with Swipe and Pull-to-Refresh

```tsx
import { PullToRefresh, SwipeableCard, SwipeActions } from "@/components/mobile";
import { useHaptics } from "@/hooks/use-mobile-features";

function TasksPage() {
  const { data: tasks, refetch } = useQuery(["/api/tasks"]);
  const { impact, notification } = useHaptics();
  const completeMutation = useMutation(...);
  const deleteMutation = useMutation(...);

  const handleRefresh = async () => {
    await refetch();
    impact("light");
  };

  const handleComplete = async (taskId: string) => {
    await completeMutation.mutateAsync(taskId);
    notification("success");
  };

  const handleDelete = async (taskId: string) => {
    await deleteMutation.mutateAsync(taskId);
    notification("warning");
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-2 p-4">
        {tasks?.map((task) => (
          <SwipeableCard
            key={task.id}
            leftAction={{
              ...SwipeActions.complete,
              onAction: () => handleComplete(task.id),
            }}
            rightAction={{
              ...SwipeActions.delete,
              onAction: () => handleDelete(task.id),
            }}
          >
            <div className="p-4 bg-card border rounded-lg">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          </SwipeableCard>
        ))}
      </div>
    </PullToRefresh>
  );
}
```

---

### Example 2: Photo Upload with Camera

```tsx
import { useCamera, useHaptics } from "@/hooks/use-mobile-features";
import { MobileHeader } from "@/components/mobile";

function AddCropPhotoPage() {
  const { takePicture, isLoading } = useCamera();
  const { impact } = useHaptics();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    impact("light");
    
    const result = await takePicture({
      quality: 85,
      source: "camera",
      resultType: "uri",
    });

    if (result) {
      setPhotoUri(result.uri);
      
      // Upload to server
      const formData = new FormData();
      const response = await fetch(result.uri);
      const blob = await response.blob();
      formData.append("file", blob, "crop-photo.jpg");
      formData.append("folder", "crops");

      const uploadRes = await fetch("/api/uploads/single", {
        method: "POST",
        body: formData,
      });

      const { fileUrl } = await uploadRes.json();
      console.log("Uploaded to:", fileUrl);
    }
  };

  return (
    <div>
      <MobileHeader
        title="Add Crop Photo"
        showBack
        actions={[
          {
            label: "Take Photo",
            onClick: handleTakePhoto,
          },
        ]}
      />

      <div className="p-4">
        {photoUri ? (
          <img src={photoUri} alt="Crop" className="w-full rounded-lg" />
        ) : (
          <button
            onClick={handleTakePhoto}
            disabled={isLoading}
            className="w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center"
          >
            {isLoading ? "Opening camera..." : "Tap to take photo"}
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### Example 3: Field Mapping with GPS

```tsx
import { useGeolocation, useHaptics } from "@/hooks/use-mobile-features";
import { InlineLoader } from "@/components/mobile";

function AddFieldPage() {
  const { getCurrentPosition, coordinates, isLoading } = useGeolocation({
    enableHighAccuracy: true,
  });
  const { notification } = useHaptics();

  const handleAutoDetect = async () => {
    const coords = await getCurrentPosition();
    
    if (coords) {
      // Save coordinates to form
      form.setValue("latitude", coords.latitude);
      form.setValue("longitude", coords.longitude);
      notification("success");
    }
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={handleAutoDetect} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? <InlineLoader /> : "📍 Use My Location"}
      </button>

      {coordinates && (
        <div className="text-sm text-muted-foreground">
          Location: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          <br />
          Accuracy: ±{coordinates.accuracy?.toFixed(0)}m
        </div>
      )}
    </div>
  );
}
```

---

### Example 4: Share Crop/Product

```tsx
import { useShare } from "@/hooks/use-mobile-features";

function ProductCard({ product }: any) {
  const { share } = useShare();

  const handleShare = async () => {
    const result = await share({
      title: product.title,
      text: `${product.title} - ${product.price} ZMW`,
      url: `${window.location.origin}/marketplace/${product.id}`,
    });

    if (result.success) {
      toast({
        title: "Shared!",
        description: result.message || "Product shared successfully",
      });
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Product content */}
        <button onClick={handleShare}>
          Share
        </button>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Best Practices

### 1. Always Use Loading States

```tsx
// ❌ Bad - blank screen while loading
if (isLoading) return null;

// ✅ Good - shows skeleton
if (isLoading) return <SkeletonList />;
```

### 2. Add Haptic Feedback to Interactive Elements

```tsx
import { useHaptics } from "@/hooks/use-mobile-features";

function InteractiveCard() {
  const { impact } = useHaptics();

  return (
    <button 
      onClick={() => {
        impact("light"); // Feels good!
        handleClick();
      }}
    >
      Tap me
    </button>
  );
}
```

### 3. Handle Offline Gracefully

```tsx
import { useNetworkStatus } from "@/components/mobile";

function FormPage() {
  const { isOffline } = useNetworkStatus();

  const handleSubmit = async (data) => {
    if (isOffline) {
      // Queue for later sync
      await saveToIndexedDB(data);
      toast({ title: "Saved offline - will sync when online" });
    } else {
      // Submit immediately
      await submitToAPI(data);
    }
  };
}
```

### 4. Use Touch-Friendly Sizes

```tsx
// All interactive elements should be min 44px
<button className="min-h-[44px] min-w-[44px] touch-manipulation">
  Tap me
</button>
```

### 5. Prevent iOS Zoom on Inputs

```tsx
// Already done in Input component!
// But for custom inputs:
<input 
  type="text"
  className="text-base md:text-sm" // 16px on mobile!
/>
```

---

## 📱 Complete Page Template

Here's a complete mobile-optimized page template:

```tsx
import {
  MobileHeader,
  PullToRefresh,
  SwipeableCard,
  SwipeActions,
  SkeletonList,
  InlineNetworkStatus,
} from "@/components/mobile";
import { useHaptics } from "@/hooks/use-mobile-features";

function OptimizedListPage() {
  const { data, isLoading, refetch } = useQuery(["/api/items"]);
  const { impact, notification } = useHaptics();
  const deleteMutation = useMutation(...);

  const handleRefresh = async () => {
    await refetch();
    impact("light");
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    notification("success");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        title="My Items"
        showBack
        searchable
        onSearchClick={() => console.log("Search")}
      />

      <div className="p-4">
        <InlineNetworkStatus />
      </div>

      {isLoading ? (
        <div className="p-4">
          <SkeletonList count={5} />
        </div>
      ) : (
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="space-y-2 p-4">
            {data?.map((item) => (
              <SwipeableCard
                key={item.id}
                rightAction={{
                  ...SwipeActions.delete,
                  onAction: () => handleDelete(item.id),
                }}
              >
                <div className="p-4 bg-card border rounded-lg">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </SwipeableCard>
            ))}
          </div>
        </PullToRefresh>
      )}
    </div>
  );
}
```

---

## 🚀 Progressive Enhancement

All components gracefully degrade:

| Feature | Native App | Web Browser | Fallback |
|---------|-----------|-------------|----------|
| Camera | Native camera | File input | ✅ |
| Geolocation | Native GPS | Web API | ✅ |
| Haptics | Native vibration | Web vibrate | Silent |
| Share | Native sheet | Web Share | Clipboard |
| Install | Native | PWA | n/a |
| Swipe | Touch gestures | Touch gestures | Click |

---

## 📊 Performance Tips

1. **Lazy load components**:
```tsx
const SwipeableCard = lazy(() => import("@/components/mobile/SwipeableCard"));
```

2. **Memoize callbacks**:
```tsx
const handleRefresh = useCallback(async () => {
  await refetch();
}, [refetch]);
```

3. **Debounce expensive operations**:
```tsx
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

---

## 🧪 Testing

### Test Pull-to-Refresh
1. Open on mobile/Chrome DevTools
2. Scroll to top
3. Pull down
4. Release when icon turns green
5. Should trigger refresh

### Test Swipe Gestures
1. Open list with swipeable cards
2. Swipe left → Delete action
3. Swipe right → Complete action
4. Should see background color and icon

### Test Camera
1. Click photo button
2. Should open camera/gallery picker
3. Take photo
4. Should receive image data

### Test Offline
1. Open Chrome DevTools → Network
2. Set to "Offline"
3. Should see offline banner
4. Test form submissions
5. Go back online → Banner shows "Back online"

---

## 📚 Related Documentation

- [Mobile Improvement Plan](./MOBILE_EXPERIENCE_IMPROVEMENT_PLAN.md)
- [Quick Start Guide](./MOBILE_QUICK_START.md)
- [Implementation Tracker](./MOBILE_IMPLEMENTATION_TRACKER.md)

---

## ✅ Quick Reference

### Import Components
```tsx
import {
  PullToRefresh,
  SwipeableCard,
  MobileHeader,
  NetworkStatus,
  InstallPrompt,
  LoadingScreen,
  SkeletonList,
} from "@/components/mobile";
```

### Import Hooks
```tsx
import {
  useCamera,
  useGeolocation,
  useHaptics,
  useShare,
} from "@/hooks/use-mobile-features";
```

### Common Patterns
```tsx
// Loading state
{isLoading ? <SkeletonList /> : <YourList />}

// Refresh
<PullToRefresh onRefresh={refetch}>...</PullToRefresh>

// Swipe actions
<SwipeableCard leftAction={...} rightAction={...}>...</SwipeableCard>

// Haptic feedback
onClick={() => { impact("light"); doAction(); }}
```

---

**All components are production-ready and fully tested!** 🚀

Start using them in your pages for a native app-like experience!


