# Marketplace Audit & Mobile App Fixes

**Scope: Expo app + platform backend only.** Web client (`client/`) is out of scope. See `docs/SCOPE_EXPO_AND_BACKEND.md`.

Summary of what’s implemented in the marketplace backend, what’s broken or missing, and what to fix for the **Expo app** and **backend**.

---

## What’s Already Implemented

### Backend (API)

| Area | Status | Notes |
|------|--------|--------|
| **Listings** | ✅ | `GET/POST/PUT/DELETE /api/marketplace/listings`, by location, by seller, search suggestions |
| **Reviews** | ✅ | GET/POST/PUT/DELETE reviews, by listing or seller |
| **Favorites** | ✅ | GET/POST/DELETE favorites |
| **Messages** | ✅ | CRUD + unread count |
| **Cart** | ✅ | GET cart, add/update/remove items, clear, checkout, Stripe & Metatron payment intents, confirm payment |
| **Orders** | ✅ | POST (create from items), GET (buyer/seller), GET by id, PUT status, cancel, refund, tracking |
| **Sellers** | ✅ | GET `/api/marketplace/sellers` (list), GET `/api/marketplace/sellers/:id` (profile) |
| **Inventory** | ✅ | Linked to listings; cart enforces stock |

### Frontend (Web) — reference only, out of scope

The existing web app has marketplace pages, cart, checkout, orders. We are **not** changing them; Expo will implement its own screens and call the same backend APIs.

---

## Bugs and Gaps to Fix

### 1. Listings API: filters must be sent as query params

**Issue:** The backend supports `category`, `search`/`query`, `priceMin`, `priceMax`, `sellerId`, `condition`, `status`, `sortBy`, `limit`, `offset`, but callers must send them as query params. Any client that only calls `GET /api/marketplace/listings` with no query string gets unfiltered results.

**Backend:** No change needed; already supports query params.

**Expo:** When calling listings API, always build the URL with query params from filters/sort, e.g. `GET /api/marketplace/listings?category=seeds&search=maize&sortBy=newest&limit=20`.

---

### 2. Checkout does not create an order (critical)

**Issue:**  
- Cart flow: add items → checkout → pay (Stripe/Metatron or Mobile Money).  
- On “confirm payment” the backend only marks the cart as `completed`. It does **not** create a row in the `orders` table.  
- `CheckoutPage` “order complete” uses a fake order id (`ORD-${Date.now()...}`).  
- So: no order record, no order in “My Orders”, and seller never gets an order.

**Fix:**

1. **Backend:** ✅ **Done.** `POST /api/cart/payment/confirm` now:
   - After verifying payment (Stripe or Metatron), loads cart items and groups them by seller (via listing).
   - For each seller group calls `storage.createOrder` with `{ userId, items: [{ listingId, quantity, unitPrice }], paymentMethod }`, reserves inventory, and notifies the seller.
   - Returns `{ message, orderIds, orderNumbers, orders: [{ id, orderNumber }] }`.
   - Marks the cart as `completed`.

2. **Expo:** After calling `POST /api/cart/payment/confirm`, read `orderIds`, `orderNumbers`, and `orders` from the response; show “Order complete” with real order info and link to order detail or “My Orders”.

---

### 3. Mobile Money is simulated only

**Issue:** `MobileMoneyPayment` does not call any backend. It simulates approval and then calls `onSuccess()`. No real payment, no order creation.

**Fix:**

1. **Backend:** Add `POST /api/cart/payment/mobile-money/initiate` with `{ provider, phoneNumber, cartId }`: validate cart, call provider to push to customer phone, return `{ transactionId, status: 'pending' }`. Add webhook or polling for provider “payment confirmed”; on confirmation run same “create order from cart” logic as in fix #2, return order ids.

2. **Expo:** Call initiate with provider and phone; show “Approve on your phone”. Poll status or use push; when confirmed, call confirm endpoint and show success with real order ids.

---

### 4. Seller dashboard uses only “seller” role

**Issue:** `MarketplacePage` uses `isSeller = user?.role === "seller"`. The app also has role `supplier`; both are routed to seller routes. So suppliers never see the “seller orders” section.

**Fix:** **Expo:** When showing “seller” orders or seller-only UI, treat both roles as seller: e.g. `isSeller = user?.role === 'seller' || user?.role === 'supplier'`, and call `GET /api/orders?role=seller` for both. Backend already keys off `userId`; no backend change required.

---

### 5. Orders API: create order expects different shape than cart

**Issue:**  
- Cart: items stored as `cartItems` with `listingId`, `quantity`, `price` (and listing details joined).  
- Orders: `POST /api/orders` expects `{ items: [{ listingId, quantity, unitPrice }], shippingAddress?, notes? }` and uses `paymentMethod: "request_quote"`.  
- So today there are two flows: “request quote” (creates order) vs “cart + pay” (does not create order yet). They need to be aligned when you implement “create order from cart” (fix #2).

**Fix:** When creating an order from a completed cart, build the payload expected by `storage.createOrder` from the cart: for each item use `listingId`, `quantity`, and `unitPrice` from the cart item. Decide a single payment method for “cart checkout” (e.g. `mobile_money` or `card`) and pass it so the order record is correct. Optionally keep `request_quote` for a separate “request quote” flow.

---

## Expo app: API and UX

### API and auth

- Use the same API base URL (env) and endpoints as the backend.  
- Use session cookie or token (e.g. store in secure storage, send `Authorization` or cookie).  
- Ensure all requests send credentials so listing, cart, and order endpoints work.

### Listings

- Always send `category`, `search`, `priceMin`, `priceMax`, `sortBy`, `limit`, `offset` as query params (fix #1).

### Cart and checkout

- Use `GET /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/:id`, `POST /api/cart/checkout`, then payment and confirm.  
- After backend fix #2: on confirm, backend returns order ids; show success and link to “My Orders” or order detail.

### Orders

- `GET /api/orders?role=buyer` or `?role=seller` for list; `GET /api/orders/:id` for detail; `PUT /api/orders/:id/status` for seller. Use `role=seller` for both seller and supplier.

### UI

- 44pt min tap targets; Cart in bottom nav with badge; one-column cart/checkout; keyboard-safe forms.

### Errors

- Handle network errors and retry; don’t block the whole app on one failure.

---

## Summary Checklist (Expo + backend only)

| # | Item | Priority | Where |
|---|------|----------|--------|
| 1 | Send listing filters as query params when calling listings API | High | Expo |
| 2 | Create order(s) from cart when payment is confirmed; return order ids | Critical | Backend ✅ |
| 3 | Real Mobile Money: initiate + confirm + order creation | High | Backend + Expo |
| 4 | Treat `supplier` and `seller` as seller for orders UI and API (`role=seller`) | Medium | Expo |
| 5 | Align cart → order payload (listingId, quantity, unitPrice) and payment method | High | Backend |
| 6 | Expo: same APIs, auth, cart in nav, 44pt targets, error handling | High | Expo |

Once #2 and #5 are done, “add to cart → checkout → pay” will create real orders and show up under “My Orders” for both web and mobile.
