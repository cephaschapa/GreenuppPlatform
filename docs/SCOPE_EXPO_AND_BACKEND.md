# Scope: Expo App + Platform Backend Only

**Current focus:** Only the **Expo mobile app(s)** and the **platform backend** (Express API). The existing **web client** (React/Vite dashboard, `client/`) is out of scope for new feature work unless explicitly needed for parity.

---

## In scope

| Area | Description |
|------|-------------|
| **Expo Farmer App** | Screens, navigation, API integration, state, UX. All features described in `EXPO_MOBILE_APPS_ARCHITECTURE.md`. |
| **Expo Marketplace App** | Screens, cart, checkout, orders, listings, sellers. Gen Z UX items from `docs/GENZ_MARKETPLACE_UX_ROADMAP.md` implemented in Expo only. |
| **Platform backend** | Express routes, controllers, models, services. Auth, marketplace, cart, orders, listings, reviews, favorites, messages, sellers, inventory, payments, notifications. Fixes and new endpoints that the Expo app (and optionally web) will call. |

---

## Out of scope (for now)

| Area | Notes |
|------|--------|
| **Web client** | No new UI work in `client/` (MarketplacePage, CartPage, CheckoutPage, etc.). Existing web app remains as-is; we only change backend and build the Expo app. |
| **Capacitor / PWA** | Not in scope; we're building Expo apps, not the current Capacitor-wrapped web. |

---

## Doc and roadmap alignment

- **EXPO_MOBILE_APPS_ARCHITECTURE.md** – Describes Expo apps + shared backend; no web-specific screens.
- **EXPO_APPS_SCREEN_SPECIFICATIONS.md** – Screen specs for Expo only.
- **docs/GENZ_MARKETPLACE_UX_ROADMAP.md** – Prioritized UX items for the **Expo marketplace app** and any **backend** changes (APIs, data) required. Web implementation notes are removed or marked out of scope.
- **MARKETPLACE_AUDIT_AND_MOBILE_FIXES.md** – Backend bugs/fixes + what the **Expo app** must do (API usage, auth). Web-only fixes are out of scope.

---

## Backend API contract (for Expo)

The Expo app will call the same APIs the web uses. Base URL is configurable (e.g. `https://api.greenupp.com` or env). Auth: session cookies (if same-origin or configured CORS) or token (e.g. Bearer) if you add token auth for mobile.

| Domain | Key endpoints |
|--------|----------------|
| Auth | Login, register, logout, session, forgot password |
| Listings | `GET/POST/PUT/DELETE /api/marketplace/listings`, by location, by seller, search |
| Cart | `GET /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/:id`, checkout, payment |
| Orders | `GET/POST /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status`, cancel, refund, tracking |
| Reviews | `GET/POST /api/marketplace/reviews` |
| Favorites | `GET/POST/DELETE /api/marketplace/favorites` |
| Messages | `GET/POST /api/marketplace/messages`, unread count |
| Sellers | `GET /api/marketplace/sellers`, `GET /api/marketplace/sellers/:id` |
| Profile / user | Per existing backend routes |

All new or changed behavior (e.g. create order from cart after payment, listing activity endpoint) is implemented in the **backend** and consumed by the **Expo app**.
