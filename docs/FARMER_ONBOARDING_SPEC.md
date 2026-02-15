# Farmer Onboarding — Detailed Build-Ready Spec

**Stack:** React Native (Expo) + Node API + PostgreSQL (Drizzle) + shared TS.  
**Context:** Zambia-first; Zambian locations DB + hyperlocal weather; Mobile Money; low smartphone experience; offline-friendly; i18n-ready (Bemba/Nyanja later).

---

## A) ONBOARDING GOAL

Within **~3 minutes** the farmer can:

1. Create profile (identity + session)
2. Set farm location (for weather)
3. Add at least one field
4. Optionally choose crops or plan a season
5. Enable notifications (weather + tasks)

**Outcome:** Immediately see a personalized **“Today on your farm”** dashboard (tasks, weather, one recommended action).

---

## B) ONBOARDING SCREENS (Mobile Flow)

### Screen 0: Welcome + Language (Optional, i18n-ready)

| Item | Detail |
|------|--------|
| **When to ask** | First screen; can default to English and skip. |
| **Primary CTA** | “Continue” / “Next” |
| **Inputs** | **Optional:** `preferredLanguage` (enum: `en`, `ny`, `bem`) |
| **Validations** | None (default `en`) |
| **Helper text** | “You can change this later in Settings.” |
| **Default** | `en` |
| **Save strategy** | Local: `onboarding.language`; Server: include in `onboarding_progress.onboardingData` or `user_preferences.preferences.language` on completion. |

---

### Screen 1: Account / Identity

| Item | Detail |
|------|--------|
| **When to ask** | Required; blocks rest of onboarding. |
| **Primary CTA** | “Get code” → “Verify & continue” (OTP) or “Sign up” (password) |
| **Required** | `fullName`, `phoneNumber` (Zambian format), auth path: **OTP** (recommended) or password |
| **Optional** | `email` |
| **Validations** | See **F) Validation Rules**. Phone: ZM format. Full name: min 2 words or 2 chars. |
| **Helper text** | “We’ll send a code to this number. Standard SMS rates apply.” |
| **Result** | Create user + session. Store: `users` (phone, firstName/lastName or username derived), `onboardingCompleted: false`. |
| **Save strategy** | No local cache for credentials; after OTP verify → session + redirect to Screen 2. |

**Recommendation:** Use **OTP** for farmers (no password to forget; aligns with Mobile Money flows).

---

### Screen 2: Farmer Profile (Lightweight)

| Item | Detail |
|------|--------|
| **When to ask** | Required after account creation. |
| **Primary CTA** | “Continue” |
| **Required** | `province` (Zambian provinces enum), `farmerType` (`smallholder` \| `emerging` \| `commercial`) |
| **Optional (ask later)** | `yearsFarming`, `mainGoal` (`increase_yield` \| `reduce_costs` \| `manage_risks` \| `sell_produce`), `cooperativeMember` (boolean) |
| **Validations** | Province in enum; farmerType in enum. |
| **Helper text** | “This helps us tailor weather and tips for your area.” |
| **Defaults** | farmerType: `smallholder`; province: from phone region if inferrable, else first in list. |
| **Result** | Create/update `farmer_profiles`; personalize recommendations. |
| **Save strategy** | Local: `onboarding.profile`; Server: `POST /onboarding/profile` → DB; update `onboarding_progress`. |

---

### Screen 3: Farm Setup (Core)

| Item | Detail |
|------|--------|
| **When to ask** | Required. |
| **Primary CTA** | “Save farm” |
| **Required** | `farmName` (default “My Farm”), `farmLocation` (see below), `farmSizeHa` (numeric > 0) |
| **Optional** | `irrigationType` (`rainfed` \| `borehole` \| `canal` \| `drip` \| `pivot` \| `none`), `waterSourceNotes` |
| **farmLocation** | **Required:** `locationText` (e.g. “Mtendere, Lusaka”), `locationSource` (`zambian_database` \| `gps` \| `manual`). **Optional but recommended:** `lat`, `lng` when available. |
| **Validations** | farmName 1–100 chars; farmSizeHa 0.01–9999.99; locationText 3–200 chars. |
| **UX** | Location: (1) Search using Zambian locations DB (autocomplete), (2) “Use my GPS” fallback, (3) Manual text entry if nothing found. |
| **Result** | Create `farms` record; trigger location resolve + weather enrichment (hyperlocal snapshot). |
| **Save strategy** | Local: `onboarding.farm`; Server: `POST /onboarding/farm` → `farms` + `resolveFarmLocation` + weather snapshot job. |

---

### Screen 4: Add First Field (Must do at least one)

| Item | Detail |
|------|--------|
| **When to ask** | Required; at least one field. |
| **Primary CTA** | “Add field” then “Continue” |
| **Required** | `fieldName`, `fieldSizeHa` (numeric > 0) |
| **Optional** | `boundaryPolygon` (GPS walk / map draw — **ask later**), `soilType` (`sandy` \| `loam` \| `clay` \| `unknown`), `previousCrop` (cropRefId or free text) |
| **Validations** | fieldName 1–80 chars; fieldSizeHa 0.01–farmSizeHa. |
| **Helper text** | “You can add more fields and boundaries later.” |
| **Result** | Create `fields` linked to farm (and userId); trigger field-level weather binding if boundary or lat/lng exists. |
| **Save strategy** | Local: `onboarding.fields[]`; Server: `POST /onboarding/field` → `fields`; update progress. |

---

### Screen 5: Crops / Season Planning (Two modes)

**Mode A — Fast: “What are you growing now?”**

| Item | Detail |
|------|--------|
| **When to ask** | Optional but recommended; can “Skip for now”. |
| **Primary CTA** | “Add crop” / “Continue” |
| **Required** | `chooseCrop` (cropRefId from reference DB) |
| **Optional** | `varietyRefId`, `plantingDate` (default: today) |
| **Result** | Create `crops` (or “activeCrop”) attached to selected field; optionally create/use “current season”. |

**Mode B — Advanced: “Plan this season”**

| Item | Detail |
|------|--------|
| **When to ask** | Optional; show after Mode A or as alternative. |
| **Inputs** | `seasonName` (e.g. “2026 Rainy Season”), `startDate` / `endDate` (auto suggestions), crops per field. |
| **Result** | Create `seasons` + `season_crops`; auto-generate task timeline (planting, weeding, top dressing, scouting). |

**Save strategy:** Local: `onboarding.crops` or `onboarding.season`; Server: `POST /onboarding/season` or `POST /onboarding/crop` (or batch); update progress.

---

### Screen 6: Notifications + Preferences (Critical for retention)

| Item | Detail |
|------|--------|
| **When to ask** | Required (soft-required: encourage enable). |
| **Primary CTA** | “Turn on notifications” / “Continue” |
| **Required (soft)** | `notificationsEnabled` (boolean) — default true; allow skip but explain value. |
| **Options** | Weather alerts (rain, heat, wind), Task reminders (daily/weekly), Pest/disease risk alerts, Marketplace deals (opt-in). |
| **Result** | Store preferences; register FCM token; trigger first “Welcome insight” notification. |
| **Save strategy** | Local: `onboarding.notifications`; Server: `POST /onboarding/notifications` → `user_preferences` + `users.pushNotificationsEnabled` + `users.fcmToken`; call FCM register. |

---

### Screen 7: Onboarding Complete → Dashboard

| Item | Detail |
|------|--------|
| **Show** | Today’s tasks, Weather summary, One recommended action (e.g. “Based on your location, expect rain in 24h…”). |
| **CTAs** | “Add another field”, “Scan plant problem”, “Browse inputs” (marketplace). |
| **Backend** | Mark `onboardingCompleted: true`, `onboardingCompletedAt: now()`; clear or archive `onboarding_progress`; ensure `GET /api/home` returns feed. |

---

## C) DATA FLOW (Behind the scenes)

**ASCII flow diagram:**

```
[Mobile Onboarding Screens]
   |
   v
[Local Cache (AsyncStorage / MMKV)]
   key: onboarding_{stepName}  e.g. onboarding.profile, onboarding.farm, onboarding.fields
   |
   +--> (sync when online, in order)
          |
          v
      [API: onboarding steps]
          POST /onboarding/profile
          POST /onboarding/farm
          POST /onboarding/field
          POST /onboarding/season (optional)
          POST /onboarding/notifications
          |
          +--> [DB writes]
                users, farmer_profiles, farms, fields, crops, seasons, onboarding_progress,
                user_preferences, weather_snapshots (via enrichment)
          |
          +--> [Enrichment Jobs / Side effects]
                - resolveFarmLocation (Zambian DB → locations, farmer_profiles.farm_location_id)
                - agro-region inference (from province/location)
                - getOrCreateWeatherSnapshot (hyperlocal weather)
                - default task generation (if season/crops created)
                - first insights generation (welcome decision)
          |
          v
   [Dashboard Feed]
      GET /api/home  →  tasks + weather + decisions
```

**Per-step summary:**

| Step | Local cache keys | API call | Server events / derived |
|------|------------------|----------|--------------------------|
| 0 | `onboarding.language` | (with profile or preferences) | — |
| 1 | — | Auth (OTP or register) | User + session |
| 2 | `onboarding.profile` | POST /onboarding/profile | farmer_profiles; onboarding_progress |
| 3 | `onboarding.farm` | POST /onboarding/farm | farms; resolveFarmLocation; weather snapshot |
| 4 | `onboarding.fields` | POST /onboarding/field | fields; optional field-level weather |
| 5 | `onboarding.crops` | POST /onboarding/season or /crop | seasons, season_crops, crops; task generation |
| 6 | `onboarding.notifications` | POST /onboarding/notifications | user_preferences; FCM token; welcome push |
| 7 | — | POST /complete-onboarding (or implicit) | onboardingCompleted; GET /api/home |

---

## D) DATA MODEL (Postgres / Drizzle)

### Tables (minimal for onboarding)

- **users** — existing; add/use: phone, firstName, lastName, onboardingCompleted, onboardingCompletedAt, fcmToken, pushNotificationsEnabled.
- **farmer_profiles** — extend with province, farmerType, yearsFarming, mainGoal, cooperativeMember; keep farmLocation/farmLocationId for backward compatibility and primary farm display.
- **farms** — new: one per farm; userId, farmName, location text/source/lat/lng, farmSizeHa, irrigationType.
- **fields** — existing; add **farmId** (FK to farms); keep userId for quick lookups.
- **field_boundaries** — optional; polygon; can be added post-onboarding.
- **seasons** — optional for “plan season” flow; seasonName, startDate, endDate, userId/farmId.
- **season_crops** — optional; links season to field/crop.
- **crops** — existing; fieldId, plantingDate, etc.
- **notification_preferences** — can live in **user_preferences.preferences** (JSON) or dedicated table.
- **onboarding_progress** — existing; currentStep, onboardingData (JSON).
- **locations** — existing; from Zambian DB + geocode.
- **weather_snapshots** — existing; created after farm location resolve.

### Enums (Zambia-first)

```ts
// Zambian provinces (match zambian-locations.ts)
export const ZAMBIAN_PROVINCES = [
  "Central", "Copperbelt", "Eastern", "Luapula", "Lusaka",
  "Muchinga", "Northern", "North-Western", "Southern", "Western"
] as const;

export const farmerTypeEnum = pgEnum("farmer_type", ["smallholder", "emerging", "commercial"]);
export const mainGoalEnum = pgEnum("main_goal", ["increase_yield", "reduce_costs", "manage_risks", "sell_produce"]);
export const locationSourceEnum = pgEnum("location_source", ["zambian_database", "gps", "manual"]);
export const irrigationTypeEnum = pgEnum("irrigation_type", ["rainfed", "borehole", "canal", "drip", "pivot", "none"]);
export const soilTypeEnum = pgEnum("soil_type", ["sandy", "loam", "clay", "unknown"]);
```

### Drizzle schema snippets

**farmer_profiles (extended)**

```ts
export const farmerProfiles = pgTable("farmer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  // Onboarding required
  province: text("province").notNull(), // Zambian province
  farmerType: text("farmer_type").notNull(), // smallholder | emerging | commercial
  // Ask later
  yearsFarming: integer("years_farming"),
  mainGoal: text("main_goal"), // increase_yield | reduce_costs | manage_risks | sell_produce
  cooperativeMember: boolean("cooperative_member").default(false),
  // Existing
  farmName: text("farm_name"),
  farmLocation: text("farm_location"),
  farmLocationId: integer("farm_location_id").references(() => locations.id),
  farmLocationSource: text("farm_location_source"),
  farmSize: text("farm_size"),
  farmType: text("farm_type"),
  bio: text("bio"),
  contactPhone: text("contact_phone"),
  mainCrops: text("main_crops").array(),
  establishedYear: integer("established_year"),
  settings: jsonb("settings").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

**farms (new)**

```ts
export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  farmName: text("farm_name").notNull().default("My Farm"),
  farmLocationText: text("farm_location_text").notNull(),
  farmLocationSource: text("farm_location_source").notNull(), // zambian_database | gps | manual
  farmLocationId: integer("farm_location_id").references(() => locations.id),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  farmSizeHa: decimal("farm_size_ha", { precision: 8, scale: 2 }).notNull(),
  irrigationType: text("irrigation_type"), // rainfed | borehole | canal | drip | pivot | none
  waterSourceNotes: text("water_source_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

**fields (add farmId)**

```ts
// Add to existing fields table:
farmId: integer("farm_id").references(() => farms.id),
// Keep userId for backward compatibility and queries
```

**onboarding_progress (existing, use as-is)**

```ts
export const onboardingProgress = pgTable("onboarding_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  currentStep: integer("current_step").notNull().default(1),
  onboardingData: jsonb("onboarding_data").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

**notification_preferences (in user_preferences or dedicated)**

Store in existing **user_preferences.preferences** JSON, e.g.:

```ts
{
  weatherAlerts: true,
  taskReminders: true,
  pestDiseaseAlerts: true,
  marketplaceDeals: false,
  pushNotifications: true,
  language: "en"
}
```

No new table required if preferences are flexible; otherwise add `notification_preferences` with columns per toggle.

---

## E) API ENDPOINTS (with payload examples)

### Auth (OTP recommended)

- **POST /api/auth/phone** (existing) — request OTP; body: `{ phone: "+260971234567" }`.
- **POST /api/auth/phone/verify** (or same route with `code`) — body: `{ phone, code }` → returns session/user.

**Minimal request (OTP start):** `{ "phone": "+260971234567" }`  
**Full request (verify):** `{ "phone": "+260971234567", "code": "123456" }`  
**Response:** `{ user: { id, phone, firstName, lastName }, token/session }`

**Errors:** 400 invalid phone; 429 too many attempts; 401 invalid code.

---

### Onboarding

**POST /api/onboarding/profile**

- **Minimal:** `{ "province": "Lusaka", "farmerType": "smallholder" }`
- **Full:** `{ "province": "Lusaka", "farmerType": "smallholder", "yearsFarming": 5, "mainGoal": "increase_yield", "cooperativeMember": true }`
- **Response:** `{ "success": true }` or 400 validation errors.

**POST /api/onboarding/farm**

- **Minimal:** `{ "farmName": "My Farm", "farmLocationText": "Mtendere, Lusaka", "farmLocationSource": "zambian_database", "farmSizeHa": 2.5 }`
- **Full:** `{ "farmName": "My Farm", "farmLocationText": "Mtendere, Lusaka", "farmLocationSource": "gps", "lat": -15.41, "lng": 28.29, "farmSizeHa": 2.5, "irrigationType": "rainfed" }`
- **Response:** `{ "success": true, "farm": { "id": 1, "farmName": "My Farm", ... } }`
- **Side effect:** Resolve location (Zambian DB); create/update weather snapshot.

**POST /api/onboarding/field**

- **Minimal:** `{ "farmId": 1, "fieldName": "North block", "fieldSizeHa": 1.2 }`
- **Full:** `{ "farmId": 1, "fieldName": "North block", "fieldSizeHa": 1.2, "soilType": "loam", "previousCrop": "Maize" }`
- **Response:** `{ "success": true, "field": { "id": 1, "name": "North block", ... } }`

**POST /api/onboarding/season** (optional)

- **Minimal:** `{ "seasonName": "2026 Rainy", "startDate": "2026-10-01", "endDate": "2027-04-30", "fieldCrops": [{ "fieldId": 1, "cropRefId": 1, "plantingDate": "2026-11-01" }] }`
- **Response:** `{ "success": true, "season": { "id": 1 }, "tasksCreated": 5 }`

**POST /api/onboarding/notifications**

- **Minimal:** `{ "notificationsEnabled": true, "fcmToken": "ExponentPushToken[...]" }`
- **Full:** `{ "notificationsEnabled": true, "fcmToken": "...", "weatherAlerts": true, "taskReminders": true, "pestDiseaseAlerts": true, "marketplaceDeals": false }`
- **Response:** `{ "success": true }`

**GET /api/onboarding/status**

- **Response:** `{ "completed": false, "step": 3, "data": { "profile": {...}, "farm": {...} } }`  
- **Errors:** 401 Unauthorized.

**POST /api/complete-onboarding** (existing, can extend)

- Body: optional final payload or `{}`; marks user onboarding complete; clears progress.
- **Response:** `{ "success": true, "message": "Onboarding completed successfully" }`

**GET /api/home** (existing)

- Returns dashboard feed: locationLabel, weather, decisions (tasks + one recommended action).
- **Response:** See existing `HomeResponse` in app (weather, decisions array).

---

## F) VALIDATION RULES (Zambia-first)

| Field | Rule |
|-------|------|
| **phoneNumber** | ZM format: `09xxxxxxxx` (9 digits) or `+2609xxxxxxxx` or `+260xxxxxxxx` (9 digits after 260). Normalize to E.164 before store. |
| **province** | One of: Central, Copperbelt, Eastern, Luapula, Lusaka, Muchinga, Northern, North-Western, Southern, Western. |
| **farmSizeHa / fieldSizeHa** | Numeric; > 0; ≤ 9999.99; fieldSizeHa ≤ farm total. |
| **locationText** | Length 3–200; sanitize (trim, no control chars). |
| **GPS denied** | Force manual location selection (Zambian DB search or manual text). Do not allow “Use my GPS” to proceed without coords. |
| **soilType / variety** | Allow value “unknown” so user can skip. |
| **fullName** | Min 2 characters; recommend 2+ words for display. |

---

## G) OFFLINE + RESUME STRATEGY

1. **On each screen completion:** Save payload to local storage (e.g. `onboarding.profile`, `onboarding.farm`, `onboarding.fields`); call **POST /onboarding/progress** with `step` and `data` when online; mark step complete in `onboarding_progress`.
2. **When online:** Sync queued steps in order (profile → farm → field(s) → season → notifications). Use idempotent semantics (e.g. create-or-update farm by userId).
3. **If app restarts:** On launch, call **GET /api/onboarding/status**; if incomplete, resume from `step` and prefill from `data` + local cache (local overrides for unsent data).
4. **Conflicts:** If server already has a farm for user (e.g. from another device), merge: use server farmId for subsequent fields; do not create duplicate farm.

---

## H) DOWNSTREAM USAGE (Why each field matters)

- **province / location** → Hyperlocal weather (Zambian DB + OpenWeather); agro-region; pest/disease risk by region; localized alerts.
- **farm size / farmerType** → Benchmarks; premium/segment for content and marketplace.
- **crops + plantingDate** → Task schedule (planting, weeding, top dressing, scouting); yield predictions; disease risk windows (e.g. Fall Armyworm, Late Blight).
- **irrigationType** → Drought risk; irrigation recommendations.
- **notification prefs** → Which alerts to send (weather, tasks, pest/disease, marketplace).
- **fields** → All analytics and tasks are field-centric; field boundary enables area-based weather and mapping later.

---

## I) “ASK LATER” FIELDS (Do not block onboarding)

- Detailed soil test values  
- Full boundary polygon (GPS walk / map draw)  
- Cooperative membership details  
- Input inventory  
- Bank account / merchant info (for sellers)  
- Email (optional at Screen 1)  
- yearsFarming, mainGoal, cooperativeMember (optional at Screen 2)  
- varietyRefId, previousCrop (optional at Screen 4/5)  

Prompt for these post-onboarding (e.g. “Add boundary to get field-level weather”, “Link your cooperative”, “Set up seller account”).

---

## J) IMPLEMENTATION CHECKLIST & ANALYTICS

### Implementation checklist

- [ ] Screen 0: Language picker (optional); persist to preferences.
- [ ] Screen 1: OTP auth (or password); create user; set session.
- [ ] Screen 2: Province + farmerType; POST /onboarding/profile; extend farmer_profiles schema.
- [ ] Screen 3: Farm name, location (Zambian search + GPS + manual), size, irrigation; POST /onboarding/farm; create farms table; wire location resolve + weather snapshot.
- [ ] Screen 4: At least one field; POST /onboarding/field; add farmId to fields; link to farm.
- [ ] Screen 5: Mode A (quick crop) or Mode B (season plan); POST /onboarding/season or crop; optional task generation.
- [ ] Screen 6: Notifications toggles + FCM; POST /onboarding/notifications; store prefs + token.
- [ ] Screen 7: Mark onboarding complete; redirect to Home; GET /api/home shows tasks + weather + one decision.
- [ ] GET /api/onboarding/status for resume; local cache keys for offline; sync order and idempotency.
- [ ] Validation: ZM phone, province enum, farm/field size bounds, locationText length.
- [ ] Zambian locations: use existing `searchZambianLocations` / `findZambianLocation` for autocomplete and resolve.

### Analytics events (onboarding funnel)

Log these for funnel and drop-off analysis:

1. **onboarding_started** — user landed on Screen 0 or 1.
2. **profile_completed** — Screen 2 submitted.
3. **farm_created** — Screen 3 submitted; farm id.
4. **first_field_created** — Screen 4 submitted; field id.
5. **first_crop_added** — Screen 5 submitted (Mode A or B); optional.
6. **notifications_enabled** — Screen 6 submitted; value of notificationsEnabled.
7. **onboarding_completed** — User reached dashboard (onboardingCompleted set).

Optional: **onboarding_step_abandoned** (step number, last screen) for drop-off analysis.

---

---

## K) EDGE CASES

| Case | Behavior |
|------|----------|
| **Missing location** | If user skips GPS and does not select from Zambian DB: require manual text (min 3 chars). Resolve on server; if no match, fallback to province-level or “Lusaka, Zambia” with low confidence; still create farm and show dashboard. |
| **Low connectivity** | Save every step locally; show “Saved offline” toast. When back online, sync in order; show “Syncing…” then “You’re all set.” Allow proceeding through all screens offline; only auth (OTP) requires network. |
| **Skipping steps** | Only Screen 5 (crops/season) and optional fields are skippable. Profile, farm, and at least one field are required. “Skip” on crops goes to Screen 6. |
| **Multi-farm user** | Onboarding creates one farm + one or more fields. Post-onboarding: “Add another farm” creates a second `farms` row; fields link to `farmId`. Dashboard can show “Farm: X” selector later. |
| **Tenant / employee** | No separate role in this flow. Tenant can use same flow (their phone, their profile) and add fields under a farm they name (e.g. “Mr Banda’s farm – my block”). Future: “Link to farm owner” or role-based view. |
| **Resume after force-close** | GET /onboarding/status returns last step and server-side data; merge with local cache (local wins for unsent); resume at step N and allow editing previous steps. |
| **Duplicate farm on sync** | If server already has a farm for userId (e.g. from another device), do not create a second farm; use existing farmId for field creation and complete onboarding. |

---

## L) REQUIRED vs OPTIONAL — SUMMARY

| Screen | Required | Optional |
|--------|----------|----------|
| 0 | — | preferredLanguage |
| 1 | fullName, phoneNumber, OTP (or password) | email |
| 2 | province, farmerType | yearsFarming, mainGoal, cooperativeMember |
| 3 | farmName, farmLocationText, farmLocationSource, farmSizeHa | lat, lng, irrigationType, waterSourceNotes |
| 4 | fieldName, fieldSizeHa (≥1 field) | boundaryPolygon, soilType, previousCrop |
| 5 | — (skip allowed) | chooseCrop, varietyRefId, plantingDate; or full season plan |
| 6 | notificationsEnabled (soft-required; default true) | weatherAlerts, taskReminders, pestDiseaseAlerts, marketplaceDeals |
| 7 | — | — |

**When to ask vs Can ask later**

- **When to ask (during onboarding):** Identity, province, farmerType, one farm, one field, notification toggle.
- **Can ask later:** Language, email, yearsFarming, mainGoal, cooperativeMember, irrigation details, boundary, soil type, previous crop, variety, full season plan, marketplace deals opt-in; soil tests, coop details, merchant/bank info.

---

**End of spec.** Use this document as the single source of truth for implementation; align API and schema with existing Greenupp services (Zambian locations DB, hyperlocal weather, GET /api/home, FCM, tasks, decisions).
