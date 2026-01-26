# GreenUpp Mobile Apps - Detailed Screen Specifications

## 📱 APP 1: FARMER APP - Screen Details

### **1. Dashboard Home Screen**

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Avatar] Welcome, John 👋  [🔔 3]      │
├─────────────────────────────────────────┤
│  ⚠️ Weather Alert                       │
│  "Heavy rain expected tomorrow"         │
│  [View Details →]                       │
├─────────────────────────────────────────┤
│  📊 Today's Summary                     │
│  ┌─────────────────────────────────┐   │
│  │ 📋 3 Tasks Due                 │   │
│  │ 🌾 Field 1: Watering Needed    │   │
│  │ 💬 2 New Messages              │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  🚀 Quick Actions                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 🔍   │ │ ➕    │ │ ✅   │ │ 🌤️   │ │
│  │Diag  │ │Field │ │Task  │ │Weather│ │
│  └──────┘ └──────┘ └──────┘ └──────┘ │
├─────────────────────────────────────────┤
│  🌾 My Fields                            │
│  [← Swipe →]                            │
│  ┌─────────────────────────────────┐   │
│  │ Field 1 - Maize                 │   │
│  │ 2.5 hectares                    │   │
│  │ 3 Active Crops                  │   │
│  │ [View →]                        │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  📈 Recent Activity                      │
│  • Diagnosed maize disease (2h ago)     │
│  • Added new crop (1d ago)              │
│  • Completed watering task (2d ago)     │
└─────────────────────────────────────────┘
```

**Data Requirements:**
- User name
- Unread notification count
- Active weather alerts
- Tasks due today
- Fields summary
- Recent activities

**API Endpoints:**
- `GET /api/farmer/{userId}/dashboard`
- `GET /api/notifications/unread-count`
- `GET /api/weather/alerts`

**State Management:**
```typescript
const { data: dashboard } = useQuery({
  queryKey: ['dashboard', userId],
  queryFn: () => fetchDashboard(userId),
  refetchInterval: 5 * 60 * 1000, // 5 minutes
});
```

---

### **2. Fields List Screen**

**Layout:**
```
┌─────────────────────────────────────────┐
│  My Fields              [+ Add Field]   │
│  [Search] 🔍                            │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ 🌾 Field 1 - Maize              │   │
│  │ 📍 2.5 hectares                  │   │
│  │ 🌱 3 Active Crops               │   │
│  │ 📅 Last activity: 2 days ago    │   │
│  │ [View Details →]                │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🌾 Field 2 - Groundnuts         │   │
│  │ 📍 1.0 hectares                 │   │
│  │ 🌱 1 Active Crop                │   │
│  │ 📅 Last activity: 5 days ago    │   │
│  │ [View Details →]                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features:**
- List all fields
- Search functionality
- Add new field button
- Field cards with key info
- Swipe actions (edit/delete)

**Data Model:**
```typescript
interface Field {
  id: string;
  name: string;
  size: number; // hectares
  location: {
    lat: number;
    lon: number;
    address?: string;
  };
  crops: Crop[];
  createdAt: string;
  updatedAt: string;
}
```

---

### **3. Weather Screen**

**Layout:**
```
┌─────────────────────────────────────────┐
│  📍 Farm Location, Lusaka    [Refresh]  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         ☀️                      │   │
│  │      28°C                        │   │
│  │  "Sunny, perfect for planting"   │   │
│  │                                 │   │
│  │  Humidity: 65%                  │   │
│  │  Wind: 12 km/h                   │   │
│  │  Rainfall: 0mm (today)          │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  📅 7-Day Forecast                     │
│  [← Swipe →]                           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Today│ │Mon  │ │Tue  │ │Wed  │      │
│  │ ☀️  │ │ 🌤️ │ │ 🌧️ │ │ ☀️  │      │
│  │28°C │ │26°C │ │22°C │ │27°C │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────────────┤
│  ⚠️ Weather Alerts                     │
│  • Drought warning for next week       │
│  • High temperature expected           │
├─────────────────────────────────────────┤
│  📆 Planting Calendar                   │
│  "Best time to plant maize: Next week" │
│  [View Full Calendar →]                │
└─────────────────────────────────────────┘
```

**Features:**
- Current weather
- 7-day forecast
- Weather alerts
- Planting calendar
- Historical data
- Location-based

**API Endpoints:**
- `GET /api/weather/current?lat={lat}&lon={lon}`
- `GET /api/weather/forecast?lat={lat}&lon={lon}`
- `GET /api/weather/alerts?lat={lat}&lon={lon}`

---

### **4. Diagnosis Screen**

**Layout:**
```
┌─────────────────────────────────────────┐
│  🔍 Diagnose Plant                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         📷                      │   │
│  │    [Camera Button]              │   │
│  │    (Large, 80x80px)             │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  "Take Photo of Plant"                 │
│                                         │
│  or                                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         📁                      │   │
│  │    [Gallery Button]              │   │
│  └─────────────────────────────────┘   │
│  "Choose from Gallery"                 │
├─────────────────────────────────────────┤
│  Recent Diagnoses                       │
│  ┌─────────────────────────────────┐   │
│  │ [Image] Maize - Healthy         │   │
│  │ 2 days ago                      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ [Image] Tomato - Disease        │   │
│  │ 5 days ago                      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Diagnosis Results Screen:**
```
┌─────────────────────────────────────────┐
│  Diagnosis Results                       │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [Plant Image]              │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Crop: Maize                            │
│  Status: ⚠️ Disease Detected            │
│                                         │
│  Disease: Leaf Blight                   │
│  Confidence: 87%                        │
│  Severity: Moderate                     │
│                                         │
├─────────────────────────────────────────┤
│  📋 Treatment Plan                      │
│  • Apply fungicide (Step 1)            │
│  • Remove affected leaves (Step 2)     │
│  • Monitor for 7 days (Step 3)        │
│  [View Full Plan →]                    │
│                                         │
│  Estimated Cost: K50                   │
│  Estimated Time: 2 hours               │
├─────────────────────────────────────────┤
│  💬 Need Help?                          │
│  [Chat with Expert →]                  │
│  [Save to Tasks]                        │
└─────────────────────────────────────────┘
```

**Flow:**
1. User captures/selects image
2. Upload to API
3. Show loading state
4. Display results
5. Save to local storage
6. Option to save as task

---

## 📱 APP 2: MARKETPLACE APP - Screen Details

### **1. Home Screen (Buyers)**

**Layout:**
```
┌─────────────────────────────────────────┐
│  [Search] 🔍                            │
├─────────────────────────────────────────┤
│  Categories                             │
│  [← Swipe →]                            │
│  [Fresh] [Seeds] [Tools] [Fertilizer] │
├─────────────────────────────────────────┤
│  🌟 Featured Products                   │
│  ┌──────┐ ┌──────┐ ┌──────┐          │
│  │[Img] │ │[Img] │ │[Img] │          │
│  │Maize │ │Seeds │ │Tools │          │
│  │K50/kg│ │K30/kg│ │K200  │          │
│  └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────────┤
│  🏆 Top Sellers                         │
│  ┌─────────────────────────────────┐   │
│  │ [Avatar] John's Farm            │   │
│  │ ⭐ 4.8 (120 reviews)            │   │
│  │ 📍 5km away                      │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  📰 Latest Deals                        │
│  [Deal Cards...]                        │
└─────────────────────────────────────────┘
```

---

### **2. Product Details Screen**

**Layout:**
```
┌─────────────────────────────────────────┐
│  [← Back]              [❤️] [Share]    │
│  [Image Carousel - Swipeable]          │
├─────────────────────────────────────────┤
│  Maize Seeds - Premium Quality          │
│  ⭐ 4.5 (120 reviews)                   │
│  K50.00 / kg                            │
│                                         │
│  Seller: John's Farm                   │
│  📍 5km away • Lusaka                  │
│  [View Seller Profile →]               │
├─────────────────────────────────────────┤
│  📋 Description                         │
│  High-quality maize seeds suitable     │
│  for planting. Certified and tested.   │
│                                         │
│  • Germination rate: 95%                │
│  • Purity: 99%                          │
│  • Pack size: 5kg                       │
├─────────────────────────────────────────┤
│  🔒 CropTrace Verified                  │
│  [View Traceability →]                  │
├─────────────────────────────────────────┤
│  Quantity: [1] [+][-]                  │
│  Stock: 45 available                   │
│                                         │
│  [Add to Cart] [Buy Now]                │
└─────────────────────────────────────────┘
```

---

### **3. Cart Screen**

**Layout:**
```
┌─────────────────────────────────────────┐
│  Shopping Cart                          │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ [Image] Maize Seeds              │   │
│  │ K50.00 / kg                      │   │
│  │ Quantity: [2] [+][-]             │   │
│  │ Total: K100                      │   │
│  │ [Remove]                          │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ [Image] Fertilizer              │   │
│  │ K50.00 / bag                     │   │
│  │ Quantity: [1] [+][-]             │   │
│  │ Total: K50                       │   │
│  │ [Remove]                          │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Summary                                 │
│  Subtotal: K150                         │
│  Delivery: K20                          │
│  ────────────────────────              │
│  Total: K170                            │
│                                         │
│  [Proceed to Checkout]                  │
└─────────────────────────────────────────┘
```

---

### **4. Orders Screen (Suppliers)**

**Layout:**
```
┌─────────────────────────────────────────┐
│  Orders              [Filter] [Sort]     │
│  [Pending] [Processing] [Completed]      │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Order #12345                     │   │
│  │ 🚚 In Transit                    │   │
│  │                                  │   │
│  │ Customer: Jane Doe               │   │
│  │ Items: 2                         │   │
│  │ Total: K150                      │   │
│  │                                  │   │
│  │ [View Details] [Track]           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Order #12344                     │   │
│  │ ✅ Completed                    │   │
│  │                                  │   │
│  │ Customer: John Smith             │   │
│  │ Items: 1                         │   │
│  │ Total: K50                       │   │
│  │                                  │   │
│  │ [View Details]                  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### **Diagnosis Flow**

```
User Action
    ↓
[Capture/Select Image]
    ↓
[Upload to API]
    POST /api/plant-analyses
    Body: FormData(image, fieldId?, cropId?)
    ↓
[Show Loading State]
    ↓
[AI Processing]
    OpenAI Vision API
    ↓
[Receive Results]
    {
      disease: string,
      confidence: number,
      severity: string,
      treatmentPlan: TreatmentPlan,
      recommendations: string[]
    }
    ↓
[Save to Local Storage]
    AsyncStorage.setItem('diagnoses', ...)
    ↓
[Display Results]
    ↓
[User Actions]
    • Save to Tasks
    • Chat with Expert
    • View Treatment Plan
    • Share Results
```

### **Order Flow (Buyer)**

```
User Action
    ↓
[Browse Products]
    GET /api/marketplace/products
    ↓
[Add to Cart]
    POST /api/cart/items
    Body: { productId, quantity }
    ↓
[View Cart]
    GET /api/cart
    ↓
[Proceed to Checkout]
    ↓
[Enter Delivery Address]
    ↓
[Select Payment Method]
    ↓
[Place Order]
    POST /api/orders
    Body: {
      items: CartItem[],
      addressId: string,
      paymentMethodId: string
    }
    ↓
[Process Payment]
    Mobile Money API
    ↓
[Order Confirmed]
    GET /api/orders/:id
    ↓
[Track Order]
    GET /api/orders/:id/tracking
```

### **Inventory Management Flow (Supplier)**

```
User Action
    ↓
[View Inventory]
    GET /api/seller/inventory
    ↓
[Add Product]
    ↓
[Fill Product Form]
    • Name, Description
    • Category, Price
    • Stock, Images
    • Location
    ↓
[Save Product]
    POST /api/seller/products
    Body: ProductData
    ↓
[Product Created]
    ↓
[Receive Order]
    WebSocket / Push Notification
    ↓
[Update Order Status]
    PATCH /api/orders/:id/status
    Body: { status: 'processing' }
    ↓
[Ship Order]
    PATCH /api/orders/:id/status
    Body: { status: 'shipped', trackingNumber }
    ↓
[Order Completed]
    PATCH /api/orders/:id/status
    Body: { status: 'completed' }
```

---

## 📊 State Management Examples

### **Farmer App - Dashboard State**

```typescript
// stores/dashboardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  lastSync: Date | null;
  offlineData: DashboardData | null;
  setOfflineData: (data: DashboardData) => void;
  clearOfflineData: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      lastSync: null,
      offlineData: null,
      setOfflineData: (data) => set({ offlineData: data, lastSync: new Date() }),
      clearOfflineData: () => set({ offlineData: null, lastSync: null }),
    }),
    { name: 'dashboard-storage' }
  )
);
```

### **Marketplace App - Cart State**

```typescript
// stores/cartStore.ts
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.productId !== productId)
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    )
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
}));
```

---

## 🎨 Component Specifications

### **Field Card Component**

```typescript
interface FieldCardProps {
  field: Field;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

<FieldCard
  field={field}
  onPress={() => navigation.navigate('FieldDetails', { fieldId: field.id })}
  onEdit={() => navigation.navigate('EditField', { fieldId: field.id })}
  onDelete={() => handleDelete(field.id)}
/>
```

**Visual:**
```
┌─────────────────────────────────┐
│  🌾 Field 1 - Maize              │
│  📍 2.5 hectares                  │
│  🌱 3 Active Crops               │
│  📅 Last activity: 2 days ago    │
│  [View Details →]                │
└─────────────────────────────────┘
```

### **Product Card Component**

```typescript
interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

<ProductCard
  product={product}
  onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
  onAddToCart={() => addToCart(product)}
/>
```

**Visual:**
```
┌─────────────────────────────────┐
│  [Product Image]                 │
│  Maize Seeds                     │
│  ⭐ 4.5 (120)                    │
│  K50.00 / kg                     │
│  [Add to Cart]                   │
└─────────────────────────────────┘
```

---

This document provides detailed specifications for all screens, data flows, and components for both mobile apps.



