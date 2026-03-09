# Gen Z Marketplace UX Roadmap

**Scope: Expo app + platform backend only.** The web client (`client/`) is out of scope. See `docs/SCOPE_EXPO_AND_BACKEND.md`.

Prioritized UI/UX changes for the **Expo marketplace app** and any **backend** work required. Each item has **impact** (1–5), **effort** (S/M/L), and **where to change** (Expo app or backend).

**Legend**
- **Impact:** 5 = critical for Gen Z trust/conversion, 1 = nice-to-have
- **Effort:** S = small (hours), M = medium (1–2 days), L = large (3+ days)
- **Where:** Backend = Express API in this repo; Expo = Expo app (separate repo or package)

---

## Priority matrix (what to build first)

| Priority | Do first (high impact, low effort) |
|----------|-------------------------------------|
| **P0**   | 1, 2, 3, 4, 5, 6 |
| **P1**   | 7, 8, 9, 10 |
| **P2**   | 11, 12, 13, 14, 15 |
| **P3**   | 16, 17, 18 |

---

## P0 – Quick wins (high impact, small/medium effort)

### 1. Cart in bottom nav (Expo only)

**What:** In the Expo app, cart is one tap away via the **bottom tab bar**: a Cart tab with item-count badge. No separate sticky bar on mobile (one bar only).

**Why Gen Z:** One-thumb use; cart always visible in nav.

**Impact:** 5 | **Effort:** S

**Where:**
- **Expo:** Add a Cart tab to the marketplace app’s bottom tab navigator. Badge = cart item count from `GET /api/cart` or local cart state. Tapping opens Cart screen.
- **Backend:** No change; use existing `GET /api/cart`.

**Acceptance:** Bottom tab bar includes Cart with badge; tapping goes to Cart screen.

---

### 2. Trust badges on listing cards

**What:** On each listing card in the Expo marketplace, show 1–3 small badges: “Verified”, “Organic”, “Fresh”, “CropTrace” from listing data.

**Why Gen Z:** Trust in 3 seconds without opening the listing.

**Impact:** 5 | **Effort:** S

**Where:**
- **Expo:** In the listing card component, render badges from `listing.greenuppVerified`, `listing.blockchainVerified`, `listing.organicCertified`, `listing.harvestDate` (e.g. “Fresh” if &lt; 3 days). Short labels only.
- **Backend:** No change; listings already return these fields.

**Acceptance:** Every listing card shows at least one trust badge when the listing has verification/freshness data.

---

### 3. “Save” / “Favorite” on every listing card

**What:** Heart icon on each listing card in Expo. One tap to add/remove from favorites; optional “Saved” when favorited.

**Why Gen Z:** Save for later is expected everywhere.

**Impact:** 5 | **Effort:** S

**Where:**
- **Expo:** Listing card component: heart icon (e.g. top-right). On tap call `POST /api/marketplace/favorites` or `DELETE /api/marketplace/favorites/:id`. Optionally filter “Favorites only” on the list screen.
- **Backend:** No change; use existing favorites API.

**Acceptance:** Every listing card has a heart; toggling updates favorites.

---

### 4. Social proof: “X viewing” / “Y bought” / “Z left”

**What:** On Expo listing detail (and optionally on card), show “N people viewing”, “N bought this week”, “Only N left in stock” when available.

**Why Gen Z:** Live activity and honest scarcity build trust.

**Impact:** 5 | **Effort:** M

**Where:**
- **Backend:** Add `GET /api/marketplace/listings/:id/activity` returning `{ viewingCount?, soldLast7Days?, stockLeft? }`. `viewingCount` from short-lived store (e.g. Redis); `soldLast7Days` from orders; `stockLeft` from inventory.
- **Expo:** Listing detail screen: fetch activity, show a compact row of pills (“12 viewing” · “5 bought” · “8 left”). Hide missing values.

**Acceptance:** Listing detail shows at least “Only N left” when inventory exists; “X viewing” and “Y bought” when backend returns them.

---

### 5. Share button on listing

**What:** “Share” on listing detail in Expo. Native share sheet (WhatsApp, etc.) with listing title and URL.

**Why Gen Z:** Sharing to WhatsApp/Stories is normal.

**Impact:** 4 | **Effort:** S

**Where:**
- **Expo:** Use `expo-sharing` or `Share.share()` with listing title and deep link / web URL (e.g. `https://app.greenupp.com/marketplace/listings/:id`).
- **Backend:** No change.

**Acceptance:** Share opens native share sheet; URL works when opened.

---

### 6. Reviews with customer photos

**What:** Reviews on listing detail in Expo can include photos. Show thumbnails; tap to open lightbox.

**Why Gen Z:** UGC photos build trust.

**Impact:** 5 | **Effort:** M

**Where:**
- **Backend:** Add `imageUrls` (or similar) to marketplace reviews (migration + `POST /api/marketplace/reviews` accepts `images[]`; store URLs after upload).
- **Expo:** Review cards show image thumbnails; tap opens full-screen image viewer.

**Acceptance:** Users can add 2–3 photos per review; Expo listing detail shows them with lightbox.

---

## P1 – High impact, medium effort

### 7. Feed-style discovery (“For you”)

**What:** In Expo marketplace, default or tab “Feed” / “For you”: vertical scroll, large cards, blend of recent + verified + near you.

**Why Gen Z:** TikTok/Instagram-style discovery.

**Impact:** 5 | **Effort:** M

**Where:**
- **Backend:** `GET /api/marketplace/listings?sortBy=recommended&limit=20` (blend newest, verified first, optional location). Can start simple (newest + verified first).
- **Expo:** Feed screen: vertical list of large listing cards; infinite scroll or “Load more”. Optional tab “Feed” vs “Browse” (grid).

**Acceptance:** Feed shows blended list and loads more on scroll.

---

### 8. “Only N left” / “Low stock” on cards

**What:** On Expo listing cards, when inventory &lt; threshold (e.g. 5), show “Only N left” or “Low stock” badge.

**Why Gen Z:** Real scarcity without fake countdowns.

**Impact:** 4 | **Effort:** S

**Where:**
- **Backend:** Ensure listings response includes `availableQuantity` (from inventory join). Already supported if inventory is linked.
- **Expo:** In listing card, if `listing.availableQuantity !== undefined` and &lt; 5, show Badge “Only N left” or “Low stock”.

**Acceptance:** Cards with low stock show the badge.

---

### 9. Cart in bottom nav (covered by item 1)

**What:** Same as item 1: Cart tab in Expo bottom tab bar with badge. No separate sticky bar.

**Impact:** 5 | **Effort:** S — Implemented with item 1.

**Where:** Expo bottom tab navigator; badge from cart count.

---

### 10. Dark mode

**What:** Expo marketplace screens (list, detail, cart, checkout) respect system or in-app dark/light theme.

**Why Gen Z:** Dark mode is default for many.

**Impact:** 4 | **Effort:** S

**Where:**
- **Expo:** Use theme/context (e.g. React Navigation theme, or app-wide tokens). No hardcoded light backgrounds on marketplace screens.
- **Backend:** No change.

**Acceptance:** Toggling theme (or system) updates marketplace UI to dark/light.

---

## P2 – Strong value, slightly higher effort

### 11. “Trending” / “Popular near you” section

**What:** At top of Expo marketplace home, horizontal strip “Trending” or “Popular near you” with 4–8 listings.

**Impact:** 4 | **Effort:** M

**Where:**
- **Backend:** `GET /api/marketplace/listings?sortBy=trending&limit=8` (e.g. most sales last 7 days or views + recent).
- **Expo:** Marketplace home: “Trending” section with horizontal ScrollView of listing cards.

**Acceptance:** Marketplace home shows Trending strip with horizontal scroll.

---

### 12. Message seller from listing

**What:** On Expo listing detail, “Message seller” opens in-app chat with that seller. Unread count on Messages in nav if applicable.

**Impact:** 5 | **Effort:** M

**Where:**
- **Backend:** `GET/POST /api/marketplace/messages` already exists; ensure creating/opening a thread by seller (or listing) is supported.
- **Expo:** Listing detail: “Message seller” button; navigate to Messages/chat with `sellerId` or conversation id.

**Acceptance:** From listing detail, user opens a conversation with the seller in the app.

---

### 13. Delivery and fees before checkout

**What:** On Expo cart screen, show estimated delivery options and cost (e.g. “DROP Express K20”, “Pickup free”). Same on checkout.

**Impact:** 4 | **Effort:** M

**Where:**
- **Backend:** Delivery estimate endpoint or logic (e.g. fixed tiers: Express K20, Standard K10, Pickup K0). Can be part of cart/checkout response.
- **Expo:** Cart screen: “Delivery: KX” line; checkout screen: same options and cost.

**Acceptance:** Cart and checkout show delivery cost before payment.

---

### 14. Order status push + timeline

**What:** When order status changes, send Expo push to buyer. Order detail in Expo shows timeline: Confirmed → Shipped → Delivered with dates.

**Impact:** 5 | **Effort:** M

**Where:**
- **Backend:** On `PUT /api/orders/:id/status`, trigger push (Expo push token or FCM) and create in-app notification for buyer. Use existing notifications flow; add order-status event.
- **Expo:** Order detail screen: status timeline; handle push and deep link to order detail.

**Acceptance:** Buyer gets push on status change; order screen shows timeline.

---

### 15. “Others also bought” on listing detail

**What:** At bottom of Expo listing detail, “Others also bought” with 3–4 related listings.

**Impact:** 4 | **Effort:** M

**Where:**
- **Backend:** `GET /api/marketplace/listings/:id/related?limit=4` (same category + same seller, or bought-together from orders if available).
- **Expo:** Listing detail: fetch related, render horizontal row of small cards.

**Acceptance:** Listing detail shows “Others also bought” with 3–4 listings.

---

## P3 – Nice to have

### 16. First-time / referral reward

**What:** First-time buyer discount; optional “Invite a friend, both get K10 off.” Coupon/discount logic.

**Impact:** 4 | **Effort:** L

**Where:** Backend: coupon/discount table and application at checkout. Expo: banner or modal for first-time/referral. Document when implementing.

---

### 17. Pay on delivery / BNPL

**What:** Checkout option “Pay when you receive” or “Pay in 2 weeks” (partner or internal).

**Impact:** 5 | **Effort:** L

**Where:** Backend: payment flow and risk; Expo: checkout option. Document when prioritizing.

---

### 18. Seller stories (24h promos)

**What:** Sellers post a 24h “story” (image + text) on marketplace home or profile.

**Impact:** 4 | **Effort:** L

**Where:** Backend: stories table + expiry API; Expo: story strip on marketplace home. Document when prioritizing.

---

## Implementation order (Expo + backend)

**Sprint 1 (quick wins)**  
1, 2, 3, 5, 8, 10  
→ Cart in nav, trust badges on cards, favorites, share, low-stock badge, dark mode. (9 = same as 1.)

**Sprint 2 (social proof + discovery)**  
4, 6, 7, 11  
→ Activity endpoint + “X viewing / Y bought / Z left”, review photos (backend + Expo), feed, trending.

**Sprint 3 (trust + conversion)**  
12, 13, 14, 15  
→ Message seller, delivery on cart, order status push + timeline, “Others also bought”.

**Later**  
16, 17, 18 (rewards, BNPL, stories).

---

## Reference: backend (this repo)

| Area | Backend (platform) |
|------|---------------------|
| Listings | `server/controllers/MarketplaceController.ts`, `server/models/MarketplaceModel.ts`, `server/routes/marketplace-mvc.ts` |
| Cart | `server/routes/cart.ts` |
| Orders | `server/routes/orders.ts`, `server/storage.ts` |
| Reviews / Favorites / Messages | `server/controllers/MarketplaceController.ts`, `server/routes/marketplace-mvc.ts` |
| Sellers | `server/routes/seller.ts` (mounted at `/api/marketplace/sellers`) |

Expo app lives in a separate repo or package; it calls these APIs. See `docs/SCOPE_EXPO_AND_BACKEND.md` for API summary.
