# GreenUpp Mobile Apps Architecture
## Expo React Native Apps - Complete Architecture Document

**Scope: Expo app(s) + platform backend.** The web client is out of scope. See `docs/SCOPE_EXPO_AND_BACKEND.md`.

---

## 📱 App Overview

### **App 1: GreenUpp Farmer App**
**Target Users:** Farmers (small-scale to commercial)
**Primary Focus:** Farm management, crop monitoring, weather, AI diagnosis

### **App 2: GreenUpp Marketplace App**
**Target Users:** Buyers, Suppliers, Sellers
**Primary Focus:** Marketplace, orders, inventory, transactions

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Shared Backend API                    │
│              (Express.js + PostgreSQL)                    │
└─────────────────────────────────────────────────────────┘
                        ↕
        ┌───────────────┴───────────────┐
        │                               │
┌───────────────────┐         ┌───────────────────┐
│  Farmer App       │         │  Marketplace App  │
│  (Expo RN)        │         │  (Expo RN)        │
└───────────────────┘         └───────────────────┘
        │                               │
        └───────────────┬───────────────┘
                        ↕
            ┌───────────────────────┐
            │   Shared Packages      │
            │  - API Client          │
            │  - State Management    │
            │  - UI Components      │
            │  - Utils              │
            └───────────────────────┘
```

---

## 📱 APP 1: FARMER APP ARCHITECTURE

### **Navigation Structure**

```
App Navigator (Stack)
├── Auth Stack
│   ├── Welcome Screen
│   ├── Login Screen
│   ├── Register Screen
│   ├── Forgot Password
│   └── Onboarding Flow
│       ├── Language Selection
│       ├── Location Permission
│       ├── Farm Profile Setup
│       └── Preferences
│
└── Main Tab Navigator (Bottom Tabs)
    ├── Home Tab
    │   └── Dashboard Stack
    │       ├── Dashboard Home
    │       ├── Today's Summary
    │       ├── Quick Actions
    │       └── Alerts & Notifications
    │
    ├── Fields Tab
    │   └── Fields Stack
    │       ├── Fields List
    │       ├── Field Details
    │       ├── Add/Edit Field
    │       ├── Crops in Field
    │       └── Crop Details
    │
    ├── Weather Tab
    │   └── Weather Stack
    │       ├── Current Weather
    │       ├── 7-Day Forecast
    │       ├── Weather Alerts
    │       ├── Planting Calendar
    │       └── Historical Data
    │
    ├── Diagnose Tab
    │   └── Diagnosis Stack
    │       ├── Camera Capture
    │       ├── Gallery Selection
    │       ├── Diagnosis Results
    │       ├── Treatment Plans
    │       ├── Diagnosis History
    │       └── Expert Consultation
    │
    └── More Tab
        └── More Stack
            ├── Tasks
            ├── Marketplace (Buy)
            ├── Social Feed
            ├── Chat
            ├── AI Assistant
            ├── Predictions
            ├── Product Verification
            ├── Crop Traceability
            ├── Profile
            └── Settings
```

### **Screen Architecture**

#### **1. Auth Screens**

**Welcome Screen**
- App branding
- Language selector (English, Bemba, Nyanja)
- Login/Register buttons
- Skip to explore (guest mode)

**Login Screen**
- Email/Phone input
- Password input
- "Forgot Password" link
- Social login (optional)
- Register link

**Register Screen**
- Email/Phone
- Password
- Confirm Password
- Role selection (Farmer)
- Terms acceptance
- Register button

**Onboarding Flow**
1. **Language Selection**
   - English, Bemba, Nyanja
   - Store preference

2. **Location Permission**
   - Request location access
   - Manual location entry fallback
   - Store farm location

3. **Farm Profile Setup**
   - Farm name
   - Farm size (hectares)
   - Primary crops
   - Farming experience
   - Upload farm photo

4. **Preferences**
   - Notification preferences
   - Weather alert preferences
   - Units (metric/imperial)

---

#### **2. Home/Dashboard Screens**

**Dashboard Home Screen**
```
┌─────────────────────────────────┐
│  [Profile]  [Notifications 🔔]   │
│  Welcome, [Name] 👋              │
├─────────────────────────────────┤
│  ⚠️ Weather Alert Banner         │
│  "Rain expected tomorrow"        │
├─────────────────────────────────┤
│  📊 Today's Summary              │
│  • 3 Tasks Due                  │
│  • Field 1: Watering Needed     │
│  • 2 New Messages               │
├─────────────────────────────────┤
│  🚀 Quick Actions                │
│  [Diagnose] [Add Field]         │
│  [New Task] [Check Weather]     │
├─────────────────────────────────┤
│  🌾 My Fields (Horizontal)      │
│  [Field 1 Card] [Field 2 Card] │
├─────────────────────────────────┤
│  📈 Recent Activity              │
│  • Diagnosed maize disease       │
│  • Added new crop               │
└─────────────────────────────────┘
```

**Data Flow:**
```
Dashboard Screen
  ↓
useQuery(['dashboard', userId])
  ↓
API: GET /api/farmer/{userId}/dashboard
  ↓
Returns: {
  summary: { tasksDue, messages, alerts },
  fields: [Field[]],
  recentActivity: [Activity[]],
  weatherAlert: WeatherAlert | null
}
  ↓
Cache in React Query
  ↓
Render UI
```

**Today's Summary Screen**
- Tasks due today
- Upcoming activities
- Weather alerts
- Messages/notifications
- Quick stats (fields, crops, tasks)

---

#### **3. Fields & Crops Screens**

**Fields List Screen**
```
┌─────────────────────────────────┐
│  My Fields          [+ Add]     │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ Field 1 - Maize          │   │
│  │ 2.5 hectares            │   │
│  │ 3 Active Crops          │   │
│  │ [View Details →]        │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ Field 2 - Groundnuts    │   │
│  │ 1.0 hectares            │   │
│  │ 1 Active Crop           │   │
│  │ [View Details →]        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Field Details Screen**
- Field info (name, size, location)
- Map view
- Active crops list
- Crop history
- Field activities timeline
- Weather for this field
- Edit/Delete options

**Add/Edit Field Screen**
- Field name
- Size (hectares)
- Location (map picker or coordinates)
- Soil type
- Irrigation type
- Photo upload
- Save button

**Crops List Screen**
- All crops across all fields
- Filter by field, crop type, status
- Search functionality
- Add new crop button

**Crop Details Screen**
- Crop info (type, variety, planting date)
- Growth stage
- Health status
- Recent diagnoses
- Treatment history
- Photos gallery
- Activities timeline
- Predictions

**Add/Edit Crop Screen**
- Crop type selector
- Variety
- Field selection
- Planting date
- Expected harvest date
- Initial photo
- Notes

---

#### **4. Weather Screens**

**Current Weather Screen**
```
┌─────────────────────────────────┐
│  📍 [Farm Location]              │
│  Current: 28°C ☀️               │
│  "Sunny, perfect for planting"  │
├─────────────────────────────────┤
│  📊 Conditions                  │
│  Humidity: 65%                   │
│  Wind: 12 km/h                   │
│  Rainfall: 0mm (today)          │
├─────────────────────────────────┤
│  📅 7-Day Forecast              │
│  [Swipeable cards]              │
├─────────────────────────────────┤
│  ⚠️ Alerts                      │
│  "Drought warning for next week" │
└─────────────────────────────────┘
```

**7-Day Forecast Screen**
- Daily weather cards
- Temperature highs/lows
- Precipitation probability
- Wind speed
- Sunrise/sunset
- Agricultural recommendations

**Weather Alerts Screen**
- Active alerts list
- Alert history
- Alert preferences
- SMS notification toggle

**Planting Calendar Screen**
- Calendar view
- Best planting dates highlighted
- Weather-based recommendations
- Crop-specific suggestions
- Historical data

**Data Flow:**
```
Weather Screen
  ↓
useQuery(['weather', location])
  ↓
API: GET /api/weather?lat={lat}&lon={lon}
  ↓
Returns: {
  current: WeatherCurrent,
  forecast: WeatherForecast[],
  alerts: WeatherAlert[],
  recommendations: string[]
}
  ↓
Cache for 1 hour
  ↓
Render UI
```

---

#### **5. Diagnosis Screens**

**Diagnosis Home Screen**
```
┌─────────────────────────────────┐
│  🔍 Diagnose Plant              │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    📷 Camera Button     │   │
│  │    (Large, 80x80px)     │   │
│  │                         │   │
│  └─────────────────────────┘   │
│  "Take Photo"                   │
│                                 │
│  or                             │
│                                 │
│  ┌─────────────────────────┐   │
│  │    📁 Gallery Button    │   │
│  └─────────────────────────┘   │
│  "Choose from Gallery"          │
├─────────────────────────────────┤
│  Recent Diagnoses               │
│  [Card: Maize - Healthy]       │
│  [Card: Tomato - Disease]       │
└─────────────────────────────────┘
```

**Camera Capture Screen**
- Native camera view
- Capture button
- Flash toggle
- Switch camera (front/back)
- Gallery access
- Instructions overlay

**Diagnosis Results Screen**
```
┌─────────────────────────────────┐
│  Diagnosis Results               │
│  ┌─────────────────────────┐   │
│  │  [Plant Image]          │   │
│  └─────────────────────────┘   │
│  Crop: Maize                    │
│  Status: ⚠️ Disease Detected    │
│                                 │
│  Disease: Leaf Blight           │
│  Confidence: 87%                │
│  Severity: Moderate             │
├─────────────────────────────────┤
│  📋 Treatment Plan              │
│  [View Full Plan →]            │
├─────────────────────────────────┤
│  💬 Ask Expert                  │
│  [Chat with Expert →]          │
└─────────────────────────────────┘
```

**Treatment Plan Screen**
- Step-by-step treatment
- Products needed
- Cost estimate
- Application schedule
- Safety precautions
- Save to tasks

**Diagnosis History Screen**
- All past diagnoses
- Filter by crop, date, status
- Search functionality
- Export option

**Data Flow:**
```
Diagnosis Flow
  ↓
1. Capture/Select Image
  ↓
2. Upload to API
  POST /api/plant-analyses
  Body: { image, fieldId?, cropId? }
  ↓
3. AI Processing (OpenAI Vision)
  ↓
4. Return Results
  {
    disease: string,
    confidence: number,
    severity: string,
    treatmentPlan: TreatmentPlan,
    recommendations: string[]
  }
  ↓
5. Save to Local DB (Offline)
  ↓
6. Display Results
  ↓
7. Sync to Server (if offline)
```

---

#### **6. Tasks Screen**

**Tasks List Screen**
- All tasks (pending, completed)
- Filter by field, crop, type
- Sort by due date, priority
- Add new task button
- Swipe to complete

**Task Details Screen**
- Task info
- Related field/crop
- Due date
- Priority
- Notes
- Photos
- Mark complete

**Add/Edit Task Screen**
- Task title
- Description
- Type (watering, fertilizing, harvesting, etc.)
- Field/Crop selection
- Due date
- Priority
- Reminder toggle

---

#### **7. More Tab Screens**

**Marketplace (Buy) Screen**
- Browse products
- Search & filter
- Categories
- Add to cart
- View product details

**Social Feed Screen**
- Posts from farmers
- Like, comment, share
- Create post
- Follow farmers
- Expert posts

**Chat Screen**
- Conversations list
- Message threads
- Send messages
- Media sharing
- Expert consultations

**AI Assistant Screen**
- Chat interface
- Voice input (optional)
- Quick questions
- Farming advice
- Language support

**Predictions Screen**
- Yield predictions
- Market price forecasts
- Weather predictions
- Risk assessments
- Charts & graphs

**Product Verification Screen**
- QR code scanner
- Product verification
- Authenticity check
- Product details

**Crop Traceability Screen**
- Blockchain trace
- Supply chain journey
- Certifications
- Quality checks

**Profile Screen**
- User info
- Farm profile
- Statistics
- Achievements
- Edit profile

**Settings Screen**
- Account settings
- Notification preferences
- Language
- Units
- Privacy
- About
- Logout

---

### **Data Flow Architecture**

#### **State Management**

```
┌─────────────────────────────────────┐
│     React Query (Server State)      │
│  - API calls                        │
│  - Caching                          │
│  - Background sync                  │
│  - Optimistic updates               │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│     Zustand (Client State)         │
│  - Auth state                      │
│  - UI state                        │
│  - Offline queue                  │
│  - Local preferences               │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│     AsyncStorage (Persistence)      │
│  - Offline data                    │
│  - User preferences                │
│  - Cached images                   │
└─────────────────────────────────────┘
```

#### **API Integration**

**Base API Client**
```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: 'https://api.greenupp.com',
  timeout: 30000,
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle logout
    }
    return Promise.reject(error);
  }
);
```

**React Query Hooks**
```typescript
// hooks/useDashboard.ts
export function useDashboard(userId: string) {
  return useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => apiClient.get(`/api/farmer/${userId}/dashboard`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// hooks/useFields.ts
export function useFields(userId: string) {
  return useQuery({
    queryKey: ['fields', userId],
    queryFn: () => apiClient.get(`/api/farmer/${userId}/fields`),
  });
}

// hooks/useDiagnosis.ts
export function useDiagnosis(imageUri: string) {
  return useMutation({
    mutationFn: async (imageUri: string) => {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'diagnosis.jpg',
      });
      return apiClient.post('/api/plant-analyses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  });
}
```

#### **Offline Strategy**

**Offline Queue**
```typescript
// stores/offlineQueue.ts
interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
}

class OfflineQueue {
  private queue: OfflineAction[] = [];
  
  async add(action: OfflineAction) {
    // Add to queue
    // Save to AsyncStorage
    // Try to sync
  }
  
  async sync() {
    // Process queue when online
    // Retry failed requests
    // Remove successful actions
  }
}
```

**Offline Data Storage**
```typescript
// services/offlineStorage.ts
export class OfflineStorage {
  // Store fields
  static async saveFields(fields: Field[]) {
    await AsyncStorage.setItem('fields', JSON.stringify(fields));
  }
  
  // Store crops
  static async saveCrops(crops: Crop[]) {
    await AsyncStorage.setItem('crops', JSON.stringify(crops));
  }
  
  // Store diagnoses
  static async saveDiagnosis(diagnosis: Diagnosis) {
    const existing = await this.getDiagnoses();
    await AsyncStorage.setItem('diagnoses', JSON.stringify([...existing, diagnosis]));
  }
}
```

---

## 📱 APP 2: MARKETPLACE APP ARCHITECTURE

### **Navigation Structure**

```
App Navigator (Stack)
├── Auth Stack
│   ├── Welcome Screen
│   ├── Login Screen
│   ├── Register Screen
│   ├── Role Selection (Buyer/Supplier)
│   └── Onboarding Flow
│
└── Main Tab Navigator (Bottom Tabs)
    ├── Home Tab
    │   └── Home Stack
    │       ├── Home Feed
    │       ├── Categories
    │       └── Search
    │
    ├── Shop Tab (Buyers) / Sell Tab (Suppliers)
    │   └── Marketplace Stack
    │       ├── Product List
    │       ├── Product Details
    │       ├── Cart (Buyers)
    │       ├── Checkout
    │       ├── Orders
    │       └── Inventory (Suppliers)
    │
    ├── Orders Tab
    │   └── Orders Stack
    │       ├── Orders List
    │       ├── Order Details
    │       ├── Order Tracking
    │       └── Order History
    │
    ├── Messages Tab
    │   └── Messages Stack
    │       ├── Conversations List
    │       └── Chat Screen
    │
    └── Profile Tab
        └── Profile Stack
            ├── Profile
            ├── Settings
            ├── Payment Methods
            ├── Addresses
            └── Notifications
```

### **Screen Architecture**

#### **1. Auth Screens**

**Welcome Screen**
- App branding
- Role selection (Buyer/Supplier)
- Login/Register buttons

**Role Selection Screen**
- Buyer option
- Supplier option
- Different onboarding flows

**Onboarding (Buyer)**
1. Location
2. Preferences (categories)
3. Payment method setup

**Onboarding (Supplier)**
1. Business info
2. Location
3. Inventory categories
4. Payment setup
5. Verification

---

#### **2. Home Screens**

**Home Feed Screen (Buyers)**
```
┌─────────────────────────────────┐
│  [Search] 🔍                    │
├─────────────────────────────────┤
│  Categories (Horizontal Scroll) │
│  [Fresh Produce] [Seeds] [Tools]│
├─────────────────────────────────┤
│  🌟 Featured Products           │
│  [Product Cards Grid]           │
├─────────────────────────────────┤
│  🏆 Top Sellers                 │
│  [Seller Cards]                 │
├─────────────────────────────────┤
│  📰 Latest Deals                │
│  [Deal Cards]                   │
└─────────────────────────────────┘
```

**Home Feed Screen (Suppliers)**
```
┌─────────────────────────────────┐
│  Dashboard                      │
├─────────────────────────────────┤
│  📊 Today's Stats               │
│  • Orders: 5                   │
│  • Revenue: K1,250             │
│  • Inventory: 45 items         │
├─────────────────────────────────┤
│  📦 Low Stock Alerts            │
│  • Maize seeds (5 left)         │
│  • Fertilizer (2 left)          │
├─────────────────────────────────┤
│  🚀 Quick Actions               │
│  [Add Product] [View Orders]   │
│  [Analytics] [Messages]        │
└─────────────────────────────────┘
```

---

#### **3. Marketplace Screens**

**Product List Screen (Buyers)**
- Product grid/list view
- Search bar
- Filter (price, category, location, rating)
- Sort options
- Category tabs

**Product Details Screen**
```
┌─────────────────────────────────┐
│  [Product Images Carousel]      │
├─────────────────────────────────┤
│  Maize Seeds - Premium          │
│  ⭐ 4.5 (120 reviews)          │
│  K50.00 / kg                    │
├─────────────────────────────────┤
│  Seller: John's Farm            │
│  📍 5km away                    │
│  [View Seller Profile →]        │
├─────────────────────────────────┤
│  📋 Description                 │
│  High-quality maize seeds...   │
├─────────────────────────────────┤
│  🔒 CropTrace Verified          │
│  [View Traceability →]          │
├─────────────────────────────────┤
│  Quantity: [1] [+][-]          │
│  [Add to Cart] [Buy Now]       │
└─────────────────────────────────┘
```

**Cart Screen**
- Cart items list
- Quantity adjust
- Remove items
- Subtotal
- Delivery options
- Checkout button

**Checkout Screen**
- Delivery address
- Payment method
- Order summary
- Delivery fee
- Total
- Place order button

**Inventory Screen (Suppliers)**
- Products list
- Add product button
- Edit/Delete
- Stock levels
- Low stock alerts
- Bulk actions

**Add/Edit Product Screen**
- Product name
- Description
- Category
- Price
- Stock quantity
- Images (multiple)
- Location
- CropTrace (optional)
- Publish/Draft toggle

---

#### **4. Orders Screens**

**Orders List Screen**
- Active orders
- Completed orders
- Cancelled orders
- Filter by status
- Search

**Order Details Screen**
```
┌─────────────────────────────────┐
│  Order #12345                    │
│  Status: 🚚 In Transit          │
├─────────────────────────────────┤
│  📦 Items                        │
│  • Maize Seeds x2 - K100        │
│  • Fertilizer x1 - K50          │
├─────────────────────────────────┤
│  📍 Delivery Address            │
│  123 Main St, Lusaka            │
├─────────────────────────────────┤
│  💳 Payment                      │
│  Mobile Money - K150           │
├─────────────────────────────────┤
│  🚚 Tracking                    │
│  [View on Map]                  │
├─────────────────────────────────┤
│  [Track Order] [Contact Seller]│
└─────────────────────────────────┘
```

**Order Tracking Screen**
- Map view
- Delivery status
- Estimated delivery
- Driver contact (if applicable)
- Timeline

---

#### **5. Messages Screens**

**Conversations List**
- All conversations
- Unread badges
- Last message preview
- Search

**Chat Screen**
- Message thread
- Input field
- Send button
- Media sharing
- Order context (if applicable)

---

#### **6. Profile Screens**

**Profile Screen (Buyers)**
- User info
- Addresses
- Payment methods
- Order history
- Favorites
- Settings

**Profile Screen (Suppliers)**
- Business info
- Store stats
- Reviews & ratings
- Products
- Orders
- Analytics
- Settings

**Settings Screen**
- Account settings
- Notification preferences
- Privacy
- Payment methods
- Addresses
- Language
- About
- Logout

---

### **Data Flow Architecture**

#### **State Management**

Same as Farmer App:
- React Query for server state
- Zustand for client state
- AsyncStorage for persistence

#### **API Integration**

**Buyer APIs**
```typescript
// Get products
GET /api/marketplace/products?category=seeds&location=lusaka

// Get product details
GET /api/marketplace/products/:id

// Add to cart
POST /api/cart/items

// Checkout
POST /api/orders
Body: { items, addressId, paymentMethodId }

// Get orders
GET /api/orders?role=buyer
```

**Supplier APIs**
```typescript
// Get inventory
GET /api/seller/inventory

// Add product
POST /api/seller/products

// Get orders
GET /api/orders?role=seller

// Update order status
PATCH /api/orders/:id/status
Body: { status: 'shipped' }
```

---

## 🎨 Shared Components Library

### **UI Components**

```
components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Loading.tsx
│   └── EmptyState.tsx
│
├── forms/
│   ├── FormField.tsx
│   ├── DatePicker.tsx
│   ├── ImagePicker.tsx
│   └── LocationPicker.tsx
│
├── navigation/
│   ├── TabBar.tsx
│   ├── Header.tsx
│   └── Drawer.tsx
│
└── features/
    ├── ProductCard.tsx
    ├── OrderCard.tsx
    ├── FieldCard.tsx
    ├── WeatherCard.tsx
    └── DiagnosisCard.tsx
```

---

## 🔄 Data Synchronization

### **Sync Strategy**

1. **Online Mode**
   - Real-time API calls
   - React Query caching
   - Background refresh

2. **Offline Mode**
   - Store in AsyncStorage
   - Queue mutations
   - Sync when online

3. **Hybrid Mode**
   - Show cached data
   - Background sync
   - Update UI when sync completes

### **Sync Implementation**

```typescript
// services/syncService.ts
class SyncService {
  async syncAll() {
    // Sync fields
    await this.syncFields();
    
    // Sync crops
    await this.syncCrops();
    
    // Sync diagnoses
    await this.syncDiagnoses();
    
    // Sync orders
    await this.syncOrders();
    
    // Process offline queue
    await this.processOfflineQueue();
  }
  
  async syncFields() {
    const localFields = await OfflineStorage.getFields();
    const serverFields = await apiClient.get('/api/fields');
    
    // Merge and resolve conflicts
    const merged = this.mergeData(localFields, serverFields);
    
    // Update local storage
    await OfflineStorage.saveFields(merged);
  }
}
```

---

## 📊 Feature Matrix

### **Farmer App Features**

| Feature | Screen | Priority | Offline |
|---------|--------|----------|---------|
| Dashboard | Home | High | Yes |
| Fields Management | Fields | High | Yes |
| Crops Management | Fields | High | Yes |
| Weather | Weather | High | Partial |
| AI Diagnosis | Diagnose | High | No |
| Tasks | Tasks | Medium | Yes |
| Marketplace (Buy) | More | Medium | Partial |
| Social Feed | More | Low | Partial |
| Chat | More | Medium | Partial |
| AI Assistant | More | Medium | No |
| Predictions | More | Low | No |
| Product Verification | More | Low | No |
| Crop Traceability | More | Low | Partial |
| Profile | More | Low | Yes |
| Settings | More | Low | Yes |

### **Marketplace App Features**

| Feature | Screen | Priority | Offline |
|---------|--------|----------|---------|
| Browse Products | Shop | High | Partial |
| Product Details | Shop | High | Partial |
| Cart | Shop | High | Yes |
| Checkout | Shop | High | No |
| Orders | Orders | High | Partial |
| Order Tracking | Orders | Medium | Partial |
| Inventory (Suppliers) | Shop | High | Yes |
| Add Product (Suppliers) | Shop | High | Yes |
| Messages | Messages | Medium | Partial |
| Profile | Profile | Low | Yes |
| Settings | Profile | Low | Yes |

---

## 🚀 Implementation Phases

### **Phase 1: Core Features (MVP)**
- Auth & Onboarding
- Dashboard
- Fields & Crops
- Weather
- Basic Diagnosis
- Basic Marketplace

### **Phase 2: Enhanced Features**
- Advanced Diagnosis
- Tasks
- Social Feed
- Chat
- Order Management
- Inventory Management

### **Phase 3: Advanced Features**
- AI Assistant
- Predictions
- Crop Traceability
- Analytics
- Advanced Marketplace

---

## 📱 Technical Stack

### **Core**
- **Expo SDK 50+**
- **React Native**
- **TypeScript**

### **Navigation**
- **React Navigation 6**
- **Bottom Tabs**
- **Stack Navigator**

### **State Management**
- **React Query** (Server state)
- **Zustand** (Client state)
- **AsyncStorage** (Persistence)

### **UI Components**
- **React Native Paper** or **NativeBase**
- **Custom Components**

### **API**
- **Axios**
- **React Query**

### **Offline**
- **AsyncStorage**
- **NetInfo** (Network detection)
- **Background Fetch**

### **Camera/Media**
- **expo-camera**
- **expo-image-picker**
- **expo-image-manipulator**

### **Location**
- **expo-location**

### **Notifications**
- **expo-notifications**
- **Firebase Cloud Messaging**

### **Maps**
- **react-native-maps**

### **Charts**
- **react-native-chart-kit** or **Victory Native**

---

## 🔐 Security

1. **Authentication**
   - JWT tokens
   - Secure storage (expo-secure-store)
   - Token refresh

2. **API Security**
   - HTTPS only
   - Request signing
   - Rate limiting

3. **Data Protection**
   - Encrypted storage
   - Secure image uploads
   - Privacy controls

---

## 📈 Performance Optimization

1. **Image Optimization**
   - Compression
   - Lazy loading
   - Caching

2. **Code Splitting**
   - Lazy loading screens
   - Dynamic imports

3. **Caching**
   - React Query caching
   - Image caching
   - API response caching

4. **Bundle Size**
   - Tree shaking
   - Code splitting
   - Asset optimization

---

This architecture provides a complete foundation for building both mobile apps with Expo. Each app is optimized for its specific user base while sharing common infrastructure and components.



