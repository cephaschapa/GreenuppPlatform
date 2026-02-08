# Greenupp Data Strategy – Technical Implementation & Architecture

This document describes the **Decision + Observation + Events** architecture to improve **farmer retention** and reduce the risk of **wrong advice**, while preserving current behavior where the farmer’s main location is stored as `farmer_profiles.farm_location` (text).

> Design goals:
> - **Farmer-first**: minimal inputs, maximum usefulness.
> - **Safety-first**: conservative recommendations, reproducible decisions, auditable reasoning.
> - **Incremental**: no breaking rewrites; adopt in phases.

---

## 0) Current state (baseline)

### Farmer location (today)
- Canonical “where is the farmer?” value is:
  - `farmer_profiles.farm_location` (text), set in onboarding, editable in profile.
- UI uses it for:
  - Home weather card label + weather API calls; fallback `"Lusaka, Zambia"`.
- Backend uses it for:
  - Weather, pest reporting, assistant, admin alerts.

### Field/location (available but not farmer-level)
- `locations` table contains structured place info:
  - `country, region, city, neighborhood, lat/lng, formatted_address, placeId, h3 indexes`
- `fields` can link to location via:
  - `fields.locationId -> locations.id`
  - plus `centerLat/centerLng`, boundaries, etc.
- Device GPS is **only** used for map UX; not persisted.

### Plant diagnosis storage
- DB: PostgreSQL
- Table: `plant_analyses` (Drizzle schema in `platform/shared/schema.ts`)

### OpenWeather endpoints (configured)
```ts
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/3.0";
const OPENWEATHER_BASE_URL_FREE = "https://api.openweathermap.org/data/2.5";
const OPENWEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0";
```

---

## 1) Target architecture (high-level)

We add three missing pieces:

1) **Location Resolution Layer**
- Keep `farm_location` text for UX.
- Resolve it to a structured `locations` row and cache the mapping.

2) **Observation Layer**
- Store reproducible snapshots:
  - weather (new table)
  - diagnosis (existing `plant_analyses`, with optional metadata upgrades)

3) **Decision Layer**
- Generate 1–3 daily “what to do today” recommendations.
- Store each decision with:
  - reasoning (`why`)
  - expiry
  - trigger reference (weather snapshot / diagnosis id)
  - outcome tracking (shown/acted/ignored)

4) **Event Layer**
- Append-only analytics events (batched, offline-friendly) to measure retention and trust.

**Core request flow:**
1. Client calls `GET /api/home`
2. Server resolves location → fetches/stores weather snapshot → runs DecisionEngine
3. Server returns weather summary + top fields + today decisions
4. Client logs events (opened/shown/why/acted/ignored) via `/api/events/batch`

---

## 2) Data model additions (Postgres + Drizzle)

### 2.1 Farmer profile upgrades (recommended, non-breaking)
Keep `farm_location` as-is. Add resolved mapping fields:

- `farmLocationId` (FK → `locations.id`, nullable)
- `farmLocationSource` enum: `user_text | zambian_db | openweather_geo | gps_field_inferred`
- `farmLocationConfidence` enum: `low | medium | high`
- `farmLocationResolvedAt` timestamp
- `farmLocationLastGeocodeError` text (nullable)

> Benefit: backend consistently uses `farmLocationId` when available.

### 2.2 New table: `weather_snapshots`
Stores normalized weather responses for reproducibility.

**Minimal columns:**
- `id` (serial pk)
- `locationId` (FK → `locations.id`, nullable if you prefer lat/lng only)
- `userId` (FK → `users.id`, nullable)
- `locationName` (text)
- `lat`, `lng` (decimal)
- `source` enum: `openweather_2_5 | openweather_3_0 | zambian_database`
- `forecastJson` jsonb (normalized forecast data)
- `forecastFrom` timestamp (optional)
- `createdAt` timestamp

### 2.3 New table: `decisions` (the heart)
Stores daily actionable recommendations.

**Columns:**
- `id` (serial pk)
- `userId` (FK → users)
- `scopeType` (`field|crop|farm|general`)
- `fieldId` (nullable FK → fields)
- `cropId` (nullable FK → crops)
- `decisionType` enum: `plant|spray|inspect|buy_input|wait|harvest|fertilize|other`
- `title` (text)
- `summary` (text, short)
- `priority` enum: `high|medium|low`
- `confidenceLevel` enum: `low|medium|high`
- `confidenceScore` (numeric, internal)
- `whyText` (1 sentence)
- `whyPayload` (jsonb; thresholds hit, forecast details, etc.)
- `triggerType` enum: `weather|calendar|diagnosis|tasks|market`
- `triggerRefId` (int; e.g. weather_snapshot_id or plant_analysis_id)
- `rulesetVersion` (text, e.g. `v1.0.0`)
- `status` enum: `generated|shown|acted|ignored|expired|overridden`
- `expiresAt` (timestamp)
- `shownAt` (timestamp nullable)
- `actedAt` (timestamp nullable)
- `createdAt` (timestamp)

### 2.4 New table: `events` (append-only analytics)
Used to measure adoption/retention and debug funnel friction.

**Columns:**
- `id` (serial pk)
- `userId` (FK → users, nullable)
- `sessionId` (text)
- `deviceId` (text, optional)
- `eventName` (text; whitelist)
- `entityType` (text, optional)
- `entityId` (int, optional)
- `properties` (jsonb)
- `createdAt` (timestamp)

**Start with 7 event names:**
- `app_opened`
- `decision_shown`
- `decision_why_opened`
- `decision_acted`
- `decision_ignored`
- `diagnosis_requested`
- `treatment_viewed`

### 2.5 `plant_analyses` (existing) – recommended upgrades
If you currently store base64 image data in DB, plan to move to object storage.
Add optional columns:
- `imageUrl` (text)
- `modelVersion` (text)
- `rawOutput` (jsonb)
- `normalizedOutput` (jsonb)

---

## 3) Services (backend)

### 3.1 `LocationResolverService`
**Responsibility:** Resolve `farm_location` text → structured `locations` row and cache mapping.

**Resolution order:**
1) If `farmLocationId` exists and `farmLocationResolvedAt` is recent → return it
2) Search Zambia DB (`zambian-locations.ts`) by name → if match, upsert into `locations`
3) Else use OpenWeather geo endpoint (`/geo/1.0/direct`) → upsert into `locations`
4) Else fallback to `"Lusaka, Zambia"` with low confidence

**Outputs:**
- `locations` record
- updates `farmer_profiles.farmLocationId`, source, confidence, resolvedAt
- errors are stored in `farmLocationLastGeocodeError`

**Re-resolution triggers:**
- user changes `farm_location`
- `farmLocationResolvedAt` older than N days (e.g. 30)
- explicit refresh request

---

### 3.2 `WeatherObservationService`
**Responsibility:** Fetch and normalize weather + store snapshots.

**Steps:**
1) Resolve location via `LocationResolverService`
2) Fetch weather:
   - Prefer Zambia hyperlocal path when in Zambia
   - Otherwise OpenWeather 2.5 (free) or 3.0 (paid)
3) Normalize forecast into internal structure
4) Insert row into `weather_snapshots`
5) Return:
   - `snapshotId`
   - simple summary for UI
   - “source” label

**Caching policy:**
- Avoid calling OpenWeather repeatedly:
  - reuse latest snapshot for same `locationId` within a short window (e.g. 1–3 hours)

---

### 3.3 `DecisionEngineService`
**Responsibility:** Generate 1–3 daily decisions.

**Inputs:**
- user context (crops/fields, planting dates if present)
- latest `weather_snapshot`
- recent `plant_analyses` (last 7–14 days)
- overdue tasks

**Outputs:**
- `Decision[]` capped to 3, each includes:
  - `expiresAt`
  - `whyText` and `whyPayload`
  - conservative language (no “diagnosed”)

**Hard safety rules:**
- If rain probability ≥ 60% in next 36–48h → do not recommend spraying
- If wind above threshold → do not recommend spraying
- `confidenceLevel=low` can only output `wait/inspect/verify` class actions
- Every decision has expiry
- If a new snapshot invalidates a previous decision:
  - mark previous decision `overridden`
  - generate replacement decision referencing the new snapshot

**Versioning:**
- Store `rulesetVersion` in every decision.
- Update version whenever thresholds or logic changes.

---

### 3.4 `EventIngestionService`
**Responsibility:** Append-only analytics event ingestion.

- Accept batched events from clients
- Validate:
  - event whitelist
  - payload size limits
  - data types
- Server adds metadata (userId, timestamps)
- Inserts into `events`

---

## 4) API endpoints

### 4.1 Home
`GET /api/home`

**Behavior:**
1) Resolve location
2) Load or fetch/store latest weather snapshot (cache window)
3) Load today’s non-expired decisions
4) If none exist (or all expired/overridden) → generate new decisions
5) Return: weather summary + decisions + fields preview + tasks summary

**Response (example):**
```json
{
  "locationLabel": "Lusaka, Zambia",
  "weather": { "snapshotId": 123, "source": "openweather_2_5", "summary": "Heavy rain expected Thu" },
  "fieldsPreview": [{ "fieldId": 1, "crop": "Maize", "status": "Weather risk" }],
  "decisions": [{ "id": 77, "title": "Delay spraying 48h", "whyText": "Rain probability is 78% within 36h.", "priority": "high" }],
  "tasksSummary": { "overdue": 1, "dueSoon": 2 }
}
```

### 4.2 Decision interactions
- `POST /api/decisions/:id/shown`
- `POST /api/decisions/:id/act`
- `POST /api/decisions/:id/ignore`

### 4.3 Events (offline-friendly)
- `POST /api/events/batch`

Payload example:
```json
[
  {"eventName":"app_opened","properties":{"screen":"Home","appVersion":"1.0.0"}},
  {"eventName":"decision_shown","entityType":"decision","entityId":77}
]
```

### 4.4 Diagnosis endpoints (existing)
- `POST /api/diagnosis` should:
  - create `plant_analyses` row
  - optionally emit/trigger a new decision linked to that analysis

---

## 5) Client integration (web + Expo)

### 5.1 Use server for weather (recommended)
Instead of calling OpenWeather directly from the client using `farm_location`, the client should call:
- `GET /api/home`
and render returned `weather` + `locationLabel`.

This:
- reduces API calls
- ensures snapshots + decision triggers are consistent
- makes decisions auditable

### 5.2 Event batching on mobile
- Store events locally (AsyncStorage/SQLite)
- Flush when network is available
- Batch size: 20–50
- Retry with exponential backoff

**Events to log:**
- `app_opened` (on app start / foreground)
- `decision_shown` (when rendered)
- `decision_why_opened` (when “Why?” tapped)
- `decision_acted` / `decision_ignored` (CTA taps)
- `diagnosis_requested` (photo submission)
- `treatment_viewed` (viewing treatment recommendations)

---

## 6) Observability & metrics

### 6.1 Retention proxy metrics (early)
- **Decision Adoption Rate**: acted / shown
- **Return After Advice**: user returns within 7 days after receiving decisions
- **Contradiction Rate**: % of decisions overridden by new snapshots

### 6.2 Minimal reporting queries
- decisions shown vs acted by region/crop
- high-confidence vs low-confidence action outcomes
- top “ignored reason” categories (if implemented)

---

## 7) Database indexes (performance insurance)

Add indexes:
- `decisions (user_id, created_at desc)`
- `decisions (user_id, expires_at)`
- `weather_snapshots (location_id, created_at desc)`
- `events (user_id, created_at desc)`
- `plant_analyses (user_id, created_at desc)`
- if field-linked analyses exist: `plant_analyses (field_id, created_at desc)`

---

## 8) Rollout plan (safe & incremental)

### Phase 1 – foundations
- Add new tables + farmer_profile resolution columns
- Implement `LocationResolverService`
- Implement `WeatherObservationService` with snapshots
- Implement `/api/home` returning weather summary

### Phase 2 – decisions
- Implement `DecisionEngineService` v1
- Add decision endpoints (`shown/act/ignore`)
- Render decisions on home with “Why?”

### Phase 3 – events + learning
- Implement `/api/events/batch`
- Implement mobile batching
- Add simple dashboards/queries for adoption/contradiction rate

### Phase 4 – precision upgrade (optional)
- Offer “Use field location for better accuracy” when field has `locationId`
- Allow farmer to confirm resolved location (in-app prompt)
- Improve crop-stage inference and calendar rules

---

## 9) Testing strategy

### Unit tests
- DecisionEngine rules fixtures:
  - rain scenario blocks spray
  - high wind blocks spray
  - low confidence yields only inspect/wait decisions
  - expiry and override behavior

### Integration tests
- `GET /api/home` returns:
  - valid weather summary + snapshot reference
  - 1–3 decisions with `whyText` and `expiresAt`

### Safety tests
- no endpoint returns “diagnosed” wording
- low-confidence decisions never recommend purchasing expensive inputs

---

## 10) Implementation checklist

- [ ] Add new Drizzle tables: `weather_snapshots`, `decisions`, `events`
- [ ] Add farmer_profile columns: `farmLocationId`, metadata fields
- [ ] Implement `LocationResolverService`
- [ ] Implement `WeatherObservationService` + snapshot caching
- [ ] Implement `DecisionEngineService` v1 + ruleset versioning
- [ ] Implement `/api/home`
- [ ] Implement decision actions endpoints
- [ ] Implement `/api/events/batch` + client batching
- [ ] Add DB indexes
- [ ] Add tests for safety/overrides/expiry

---

## Appendix A – Why this architecture improves retention

Smallholders open apps when they get:
- **clear daily actions**
- **confidence + transparency (“Why?”)**
- **consistent advice that doesn’t contradict itself**
- **fast UX with low data usage**

This architecture makes Greenupp:
- reproducible (snapshots)
- auditable (decisions + triggers)
- measurable (events)
- safe (confidence gating + overrides)
