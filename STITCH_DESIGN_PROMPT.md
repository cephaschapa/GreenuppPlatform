# Google Stitch Design Prompt for GreenUpp Mobile Apps

## Project Overview

Create mobile app designs for **GreenUpp**, an agricultural intelligence platform designed for Zambian farmers. The platform consists of two separate mobile applications:

1. **GreenUpp Farmer App** - Farm management, crop monitoring, weather intelligence, and AI-powered plant disease diagnosis
2. **GreenUpp Marketplace App** - Agricultural marketplace for buying and selling crops, seeds, tools, and fertilizers

## Target Users

- **Primary**: Small-scale to commercial farmers in Zambia
- **Secondary**: Agricultural suppliers, buyers, and traders
- **Context**: Many users have limited smartphone experience, work in rural areas with intermittent connectivity, and prefer local languages (Bemba, Nyanja)

## Brand Identity

### Color Palette
- **Primary Green**: #10b981 (emerald-500), #059669 (emerald-600)
- **Accent Green**: #00c853, #00a844
- **Background**: White (#ffffff), Light Gray (#f9fafb, #f8fafc)
- **Text Primary**: #1f2937 (dark gray), #111827
- **Text Secondary**: #64748b, #6b7280
- **Alert Colors**: Red (#ef4444), Orange (#f97316), Yellow (#eab308)

### Typography
- **Primary Font**: Space Grotesk (for UI elements)
- **Secondary Font**: Inter (for body text)
- **Heading Font**: Rajdhani (for titles)
- Font weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Design Style
- **Modern & Clean**: Minimalist design with plenty of white space
- **Agriculture-themed**: Earth tones, natural gradients, organic shapes
- **Accessible**: Large touch targets (minimum 44x44px), high contrast, clear hierarchy
- **Localized**: Support for right-to-left if needed, culturally appropriate icons
- **Gradient Usage**: Subtle green gradients for primary actions and headers

---

## APP 1: FARMER APP - Screen Designs Needed

### 1. Dashboard Home Screen

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  [Avatar] Welcome, John 👋  [🔔 3]      │ ← Header with user greeting and notifications
├─────────────────────────────────────────┤
│  ⚠️ Weather Alert                       │ ← Prominent alert banner (yellow/orange)
│  "Heavy rain expected tomorrow"         │
│  [View Details →]                       │
├─────────────────────────────────────────┤
│  📊 Today's Summary                     │ ← Summary card with rounded corners
│  ┌─────────────────────────────────┐   │
│  │ 📋 3 Tasks Due                 │   │
│  │ 🌾 Field 1: Watering Needed    │   │
│  │ 💬 2 New Messages              │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  🚀 Quick Actions                       │ ← Grid of 4 action buttons (circular icons)
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 🔍   │ │ ➕    │ │ ✅   │ │ 🌤️   │ │
│  │Diag  │ │Field │ │Task  │ │Weather│ │
│  └──────┘ └──────┘ └──────┘ └──────┘ │
├─────────────────────────────────────────┤
│  🌾 My Fields                            │ ← Horizontal scrollable field cards
│  [← Swipe →]                            │
│  ┌─────────────────────────────────┐   │
│  │ Field 1 - Maize                 │   │
│  │ 2.5 hectares                    │   │
│  │ 3 Active Crops                  │   │
│  │ [View →]                        │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  📈 Recent Activity                      │ ← Activity feed list
│  • Diagnosed maize disease (2h ago)     │
│  • Added new crop (1d ago)              │
│  • Completed watering task (2d ago)     │
└─────────────────────────────────────────┘
```

**Design Requirements:**
- Clean, organized layout with clear visual hierarchy
- Weather alert should stand out (use warning colors: yellow/orange gradient)
- Quick action buttons: large circular buttons with icons (80x80px) and labels below
- Field cards: Card-based design with rounded corners, subtle shadows, swipeable
- Color code sections with subtle green accents
- Bottom navigation bar with: Home, Fields, Diagnosis, Weather, Profile

---

### 2. Fields List Screen

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  My Fields              [+ Add Field]   │ ← Header with page title and action button
│  [Search] 🔍                            │ ← Search bar
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ 🌾 Field 1 - Maize              │   │ ← Field card with:
│  │ 📍 2.5 hectares                 │   │   - Field icon/thumbnail
│  │ 🌱 3 Active Crops               │   │   - Name and size
│  │ 📅 Last activity: 2 days ago    │   │   - Crop count
│  │ [View Details →]                │   │   - Last activity timestamp
│  └─────────────────────────────────┘   │   - Action button
│  ┌─────────────────────────────────┐   │
│  │ 🌾 Field 2 - Groundnuts         │   │
│  │ 📍 1.0 hectares                 │   │
│  │ 🌱 1 Active Crop                │   │
│  │ 📅 Last activity: 5 days ago    │   │
│  │ [View Details →]                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Design Requirements:**
- List view with card-based field items
- Empty state: Illustration + "No fields yet" message + "Add Your First Field" button
- Swipe actions: Swipe left to reveal Edit/Delete options
- Search bar: Prominent at top, rounded with icon
- Add Field button: Floating action button or header button (green, prominent)

---

### 3. Weather Screen

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  📍 Farm Location, Lusaka    [Refresh]  │ ← Header with location and refresh
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         ☀️                      │   │ ← Large weather icon (animated if possible)
│  │      28°C                        │   │ ← Current temperature (large, bold)
│  │  "Sunny, perfect for planting"   │   │ ← Weather description
│  │                                 │   │
│  │  Humidity: 65%                  │   │ ← Weather details in grid
│  │  Wind: 12 km/h                   │   │
│  │  Rainfall: 0mm (today)          │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  📅 7-Day Forecast                     │ ← Horizontal scrollable forecast cards
│  [← Swipe →]                           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Today│ │Mon  │ │Tue  │ │Wed  │      │
│  │ ☀️  │ │ 🌤️ │ │ 🌧️ │ │ ☀️  │      │
│  │28°C │ │26°C │ │22°C │ │27°C │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
├─────────────────────────────────────────┤
│  ⚠️ Weather Alerts                     │ ← Alert list (if any)
│  • Drought warning for next week       │
│  • High temperature expected           │
├─────────────────────────────────────────┤
│  📆 Planting Calendar                   │ ← Calendar recommendation card
│  "Best time to plant maize: Next week" │
│  [View Full Calendar →]                │
└─────────────────────────────────────────┘
```

**Design Requirements:**
- Weather display should be visually appealing with large, clear icons
- Current weather card: Centered, card-based with gradient background (blue to cyan for clear sky)
- Forecast cards: Compact, horizontal scroll, show day, icon, and high/low temps
- Weather icons: Use emoji-style or custom illustrated weather icons
- Alerts section: Use warning colors (yellow/orange) with clear iconography
- Planting calendar: Green-themed card with actionable CTA

---

### 4. Plant Diagnosis Screen

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  🔍 Diagnose Plant                      │ ← Header
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │ ← Large camera button area
│  │         📷                      │   │
│  │    [Camera Button]              │   │ ← 80x80px circular button
│  │    (Large, prominent)            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  "Take Photo of Plant"                 │ ← Instruction text
│                                         │
│  or                                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         📁                      │   │ ← Gallery button
│  │    [Gallery Button]              │   │
│  └─────────────────────────────────┘   │
│  "Choose from Gallery"                 │
├─────────────────────────────────────────┤
│  Recent Diagnoses                       │ ← History section
│  ┌─────────────────────────────────┐   │
│  │ [Image] Maize - Healthy         │   │ ← Diagnosis history cards
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
│  Diagnosis Results          [← Back]    │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │ ← Uploaded plant image
│  │      [Plant Image]              │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Crop: Maize                            │ ← Results in clear sections
│  Status: ⚠️ Disease Detected            │
│                                         │
│  Disease: Leaf Blight                   │
│  Confidence: 87%                        │ ← Confidence indicator (progress bar)
│  Severity: Moderate                     │
│                                         │
├─────────────────────────────────────────┤
│  📋 Treatment Plan                      │ ← Treatment steps card
│  • Apply fungicide (Step 1)            │
│  • Remove affected leaves (Step 2)     │
│  • Monitor for 7 days (Step 3)        │
│  [View Full Plan →]                    │
│                                         │
│  Estimated Cost: K50                   │ ← Cost and time estimates
│  Estimated Time: 2 hours               │
├─────────────────────────────────────────┤
│  💬 Need Help?                          │ ← Action buttons
│  [Chat with Expert →]                  │
│  [Save to Tasks]                        │
└─────────────────────────────────────────┘
```

**Design Requirements:**
- Camera button: Large, prominent, green circular button with camera icon
- Image preview: Full-width, rounded corners, good aspect ratio
- Results screen: Clear visual hierarchy, color-coded status (green=healthy, red=disease)
- Confidence indicator: Progress bar or circular progress indicator
- Treatment plan: Step-by-step list with checkboxes, actionable items
- Action buttons: Primary green buttons for main actions
- Loading state: Show during AI processing (spinner + "Analyzing plant..." message)

---

## APP 2: MARKETPLACE APP - Screen Designs Needed

### 1. Home Screen (Buyers)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  [Search] 🔍                            │ ← Search bar (full width)
├─────────────────────────────────────────┤
│  Categories                             │ ← Horizontal scrollable category chips
│  [← Swipe →]                            │
│  [Fresh] [Seeds] [Tools] [Fertilizer] │ ← Category buttons with icons
├─────────────────────────────────────────┤
│  🌟 Featured Products                   │ ← Section header
│  ┌──────┐ ┌──────┐ ┌──────┐          │ ← Product cards (horizontal scroll)
│  │[Img] │ │[Img] │ │[Img] │          │
│  │Maize │ │Seeds │ │Tools │          │
│  │K50/kg│ │K30/kg│ │K200  │          │
│  └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────────┤
│  🏆 Top Sellers                         │ ← Seller cards section
│  ┌─────────────────────────────────┐   │
│  │ [Avatar] John's Farm            │   │ ← Seller card with:
│  │ ⭐ 4.8 (120 reviews)            │   │   - Profile image
│  │ 📍 5km away                      │   │   - Rating
│  └─────────────────────────────────┘   │   - Distance
├─────────────────────────────────────────┤
│  📰 Latest Deals                        │ ← Deals/promotions section
│  [Deal Cards...]                        │
└─────────────────────────────────────────┘
```

**Design Requirements:**
- E-commerce style layout (similar to popular shopping apps)
- Product cards: Image on top, product name, price, quick add-to-cart button
- Category chips: Rounded, colored chips with icons, selected state (green)
- Top sellers: Card-based with profile images, ratings, and distance
- Bottom navigation: Home, Search, Cart, Orders, Profile
- Floating cart icon with badge count (if items in cart)

---

### 2. Product Details Screen

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  [← Back]              [❤️] [Share]    │ ← Header with actions
│  [Image Carousel - Swipeable]          │ ← Image gallery (swipeable, dots indicator)
├─────────────────────────────────────────┤
│  Maize Seeds - Premium Quality          │ ← Product title
│  ⭐ 4.5 (120 reviews)                   │ ← Rating with review count
│  K50.00 / kg                            │ ← Price (large, bold)
│                                         │
│  Seller: John's Farm                   │ ← Seller info section
│  📍 5km away • Lusaka                  │ ← Location with distance
│  [View Seller Profile →]               │
├─────────────────────────────────────────┤
│  📋 Description                         │ ← Expandable description
│  High-quality maize seeds suitable     │
│  for planting. Certified and tested.   │
│                                         │
│  • Germination rate: 95%                │ ← Feature bullets
│  • Purity: 99%                          │
│  • Pack size: 5kg                       │
├─────────────────────────────────────────┤
│  🔒 CropTrace Verified                  │ ← Verification badge
│  [View Traceability →]                  │
├─────────────────────────────────────────┤
│  Quantity: [1] [+][-]                  │ ← Quantity selector
│  Stock: 45 available                   │ ← Stock indicator
│                                         │
│  [Add to Cart] [Buy Now]                │ ← Action buttons (side by side)
└─────────────────────────────────────────┘
```

**Design Requirements:**
- Image carousel: Full-width, swipeable, dot indicators, zoom capability
- Product title: Large, bold, clear hierarchy
- Rating: Star icons (yellow/gold) with review count
- Price: Large, bold, in primary green color
- Seller section: Clickable card linking to seller profile
- Description: Expandable/collapsible for long descriptions
- Verification badge: Green badge with checkmark icon
- Quantity selector: Plus/minus buttons with number display
- Action buttons: "Add to Cart" (outline) and "Buy Now" (solid green)

---

### 3. Shopping Cart Screen

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  Shopping Cart                          │ ← Header
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │ ← Cart item card
│  │ [Image] Maize Seeds              │   │   - Product image
│  │ K50.00 / kg                      │   │   - Product name
│  │ Quantity: [2] [+][-]             │   │   - Price per unit
│  │ Total: K100                      │   │   - Quantity selector
│  │ [Remove]                          │   │   - Line total
│  └─────────────────────────────────┘   │   - Remove button
│  ┌─────────────────────────────────┐   │
│  │ [Image] Fertilizer              │   │
│  │ K50.00 / bag                     │   │
│  │ Quantity: [1] [+][-]             │   │
│  │ Total: K50                       │   │
│  │ [Remove]                          │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Summary                                 │ ← Order summary (sticky at bottom)
│  Subtotal: K150                         │
│  Delivery: K20                          │
│  ────────────────────────              │ ← Divider line
│  Total: K170                            │ ← Total (larger, bold)
│                                         │
│  [Proceed to Checkout]                  │ ← Primary action button (full width)
└─────────────────────────────────────────┘
```

**Design Requirements:**
- Cart items: Card-based layout with images on left, details on right
- Quantity controls: Inline plus/minus buttons within item card
- Empty cart state: Illustration + "Your cart is empty" + "Start Shopping" button
- Order summary: Fixed at bottom (or sticky on scroll), clear breakdown
- Checkout button: Full-width, green, prominent at bottom
- Remove button: Red/destructive color, clearly labeled

---

### 4. Orders Screen (For Suppliers)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  Orders              [Filter] [Sort]     │ ← Header with filter/sort actions
│  [Pending] [Processing] [Completed]      │ ← Status tabs
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │ ← Order card
│  │ Order #12345                     │   │   - Order number
│  │ 🚚 In Transit                    │   │   - Status badge
│  │                                  │   │   - Customer info
│  │ Customer: Jane Doe               │   │   - Item count
│  │ Items: 2                         │   │   - Total amount
│  │ Total: K150                      │   │   - Action buttons
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

**Design Requirements:**
- Status tabs: Filter orders by status (Pending, Processing, Completed)
- Status badges: Color-coded (yellow=pending, blue=processing, green=completed)
- Order cards: Clear hierarchy, all key info visible at a glance
- Action buttons: Contextual actions based on order status
- Filter/Sort: Dropdown or modal for filtering and sorting options
- Empty state: "No orders yet" message when applicable

---

## Design System & Components

### Buttons
- **Primary**: Green (#10b981) with white text, rounded corners (8px), padding 16px vertical, 24px horizontal
- **Secondary**: White background, green border, green text
- **Text/Icon**: Icon-only buttons with appropriate touch targets (44x44px minimum)

### Cards
- White background, rounded corners (12px), subtle shadow (0 2px 8px rgba(0,0,0,0.1))
- Padding: 16px
- Hover/tap state: Slight elevation increase

### Typography Scale
- **H1**: 28px, bold, Space Grotesk
- **H2**: 24px, semibold, Space Grotesk
- **H3**: 20px, semibold, Inter
- **Body**: 16px, regular, Inter
- **Caption**: 14px, regular, Inter (secondary text)
- **Button**: 16px, semibold, Inter

### Spacing
- Use 8px base unit (8, 16, 24, 32, 40px spacing)
- Card spacing: 16px gap between cards
- Section spacing: 24px between major sections

### Icons
- Use consistent icon style (line icons or filled)
- Size: 24px default, 32px for prominent actions, 16px for inline icons
- Color: Primary green for actions, gray for secondary elements

### Forms & Inputs
- Input fields: Rounded corners (8px), border (#e5e7eb), padding 12px
- Focus state: Green border (#10b981), subtle shadow
- Labels: Above inputs, 14px, semibold
- Placeholders: Gray (#9ca3af), italic

### Loading States
- Skeleton screens for content loading
- Spinner: Green circular spinner (#10b981)
- Progress indicators: Green progress bars

### Empty States
- Illustration (line art style, green/earth tones)
- Title: 20px, semibold
- Description: 16px, gray text
- CTA button: Primary green button

---

## Technical Considerations

### Platform
- React Native (Expo) mobile app
- iOS and Android support
- Target devices: Android 8+, iOS 13+

### Accessibility
- Minimum touch target: 44x44px
- Color contrast: WCAG AA minimum
- Screen reader support: Semantic labels
- Font scaling: Support dynamic type sizes

### Performance
- Optimize images for mobile (compressed, appropriate sizes)
- Lazy loading for lists
- Smooth animations (60fps target)

### Localization
- Support for Bemba and Nyanja languages
- Text should expand up to 30% for translations
- RTL support if needed

---

## Additional Design Notes

1. **Offline Support**: Show offline indicators when connectivity is lost
2. **Data Visualization**: Use simple charts for crop/field data (sparklines, progress bars)
3. **Notifications**: Badge counts should be clearly visible on navigation icons
4. **Onboarding**: Design welcome screens and first-time user flows
5. **Error States**: Friendly error messages with retry actions
6. **Success States**: Confirmation screens with checkmarks for completed actions

---

## Deliverables Requested

Please create high-fidelity mockups/screens for:
1. Farmer App: Dashboard, Fields List, Weather, Diagnosis (camera & results)
2. Marketplace App: Home, Product Details, Cart, Orders
3. Design system documentation (colors, typography, components)
4. Interactive prototype if possible (showing navigation flows)

---

## Reference Style
- Similar to: Modern agricultural apps like FarmLogs, Agworld, but with a warmer, more accessible design for Zambian farmers
- Inspiration: Clean e-commerce apps like Shopify mobile, but adapted for agricultural marketplace
- Avoid: Overly complex interfaces, small text, cluttered layouts

