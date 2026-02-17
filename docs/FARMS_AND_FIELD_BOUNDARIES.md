# Farms & Field Boundaries — How It Works

**Summary:** Boundaries are **field-level** (not farm-level). They are optional and added **post-onboarding** from the Fields screen. The system already supports storing and displaying them; onboarding does not collect boundaries.

---

## 1. Data model

### Farms (`farms` table)
- One row per farm per user (multi-farm supported).
- **Location:** `farm_location_text`, `farm_location_source`, optional `lat` / `lng` (from Zambian search or GPS). No polygon; farm is a point/label for weather and context.
- **No boundary column** — farm is not drawn as a shape.

### Fields (`fields` table)
- Belong to a user and optionally to a farm (`farm_id`).
- **Boundary (optional):**
  - `boundary` — JSONB, GeoJSON Polygon: `{ type: "Polygon", coordinates: [[[lng, lat], ...]] }`. First ring is exterior; closed (first point = last point).
  - `calculated_area` — area in **square meters** (from polygon, shoelace formula).
  - `center_lat` / `center_lng` — centroid of the polygon (for map center and reverse geocode).
- **Other:** `name`, `size` (hectares), `size_unit`, `location` (text), `soil_type`, `notes`, `location_id`.

**Migration:** `0010_add_field_boundaries.sql` adds `boundary`, `calculated_area`, `center_lat`, `center_lng` and GIN index on `boundary`.

---

## 2. How boundaries are added today

### Mobile app (React Native)
- **Where:** **Add/Edit Field** screen (`AddEditFieldScreen`) — reached from Fields tab when adding a new field or editing an existing one.
- **Flow:**
  1. User enters name, optional location text, size, soil type, notes.
  2. **Field boundary** section uses `FieldBoundaryPicker`:
     - Map (react-native-maps) starts at device location (or default Lusaka).
     - User **taps the map** to add points; ≥3 points enable “Complete”.
     - On “Complete”: polygon is closed, area and centroid are computed (see `app/utils/geo.ts`), optional reverse geocode for address; result is stored in local state as `FieldBoundaryData`.
  3. On Save, create/update field via `fieldService.createField` / `fieldService.updateField` with `boundary`, `calculatedArea`, `centerLat`, `centerLng` (and optional `formattedAddress` in `location`).
- **Display:** **Fields** screen shows a map; fields that have `boundary?.coordinates?.[0]` are drawn as polygons. “No field boundaries yet” if none have boundaries.

### Web client (platform/client)
- **Add Field** dialog includes a **Field Boundary** tab using `FieldBoundaryPicker` (Leaflet): draw on map, save polygon; same GeoJSON shape and area/centroid.
- **Field map** view (`FieldMapDisplay`) shows all fields with boundaries and uses boundary for area when available.

### Backend API
- **POST /api/fields** — body may include `boundary`, `calculatedArea`, `centerLat`, `centerLng`; stored on `fields` row.
- **PUT /api/fields/:id** — same; updates boundary and derived fields.
- **GET /api/fields** and **GET /api/fields/with-locations** — return `boundary` in the payload so clients can draw polygons.
- **Onboarding** (`POST /api/user/onboarding/field`) — does **not** accept boundary; only `farmId`, `fieldName`, `fieldSizeHa`, optional `soilType`, `previousCrop`. Boundaries are “add later.”

---

## 3. Spec (onboarding vs post-onboarding)

From **FARMER_ONBOARDING_SPEC.md**:

- **Screen 4 (Add first field):** Required: `fieldName`, `fieldSizeHa`. **Optional:** “boundaryPolygon (GPS walk / map draw — **ask later**)”, soilType, previousCrop. Helper: “You can add more fields and boundaries later.”
- **Ask later:** “Full boundary polygon (GPS walk / map draw)”. Prompt post-onboarding: e.g. “Add boundary to get field-level weather”.
- **Result of field step:** “Create fields linked to farm; trigger field-level weather binding **if boundary or lat/lng exists**.” So boundary is optional and enables better field-level weather later.

So:
- **Onboarding:** We do **not** collect a boundary; we only collect name and size (and optionally soil/previous crop). Boundaries are explicitly “ask later.”
- **Post-onboarding:** User adds or edits a field from the Fields tab and can optionally draw a boundary on the map (tap-to-draw on mobile, draw on web). That’s the only place boundaries are added in the current design.

---

## 4. Current flow summary

| Where              | Boundary? | How |
|--------------------|-----------|-----|
| Onboarding step 4  | No        | Only field name + size (and optional soil/previous crop). |
| Add Field (app)    | Optional  | Add/Edit Field screen → FieldBoundaryPicker → tap map, complete polygon → save with boundary/area/center. |
| Add Field (web)    | Optional  | Add Field dialog → Field Boundary tab → draw on map → save. |
| Edit Field (app)   | Optional  | Same picker; can add/change/remove boundary. |
| Fields list / map  | Display   | Fields with `boundary.coordinates[0]` drawn as polygons; others as pins or not on map. |

---

## 5. Geo and APIs

- **Area:** Shoelace formula on the polygon (in `app/utils/geo.ts` and web equivalent); result in m²; can be converted to hectares for display.
- **Centroid:** From same utils; used for map center and reverse geocode.
- **Format:** GeoJSON Polygon: `coordinates` is an array of rings; first ring is exterior, `[lng, lat]` per point, closed (first point repeated at end).
- **Reverse geocode:** App uses `geocodeService.reverseGeocode(lat, lng)` for optional address; web uses `/api/geocode/reverse` for the boundary center.

---

## 6. Gaps / possible extensions

- **Farm-level boundary:** Not in schema or UI; farm is a single location (text + optional lat/lng). If needed later, could add `farms.boundary` and a farm boundary editor.
- **Onboarding:** Could add an optional “Draw your first field boundary” step (or a “Add boundary later” prompt after step 4) using the same map-draw UX; spec currently says to prompt post-onboarding.
- **Fields API and `farmId`:** Create/update in `platform/server/routes/fields.ts` do not currently accept or set `farm_id`; onboarding uses `POST /api/user/onboarding/field` which does set `farmId`. If the app creates fields outside onboarding, they may have `farm_id` null unless the API is extended to accept `farmId` in POST/PUT.
- **GPS walk:** Spec mentions “GPS walk / map draw”. Current implementation is **map draw** (tap/draw points). A “GPS walk” mode (record path while walking the perimeter) could be added later as an alternative input.

---

**TL;DR:** Boundaries are **field-level**, **optional**, and added **only when adding/editing a field** from the Fields screen (map draw, tap to add points, complete polygon). Onboarding does not collect them; the spec says to prompt for them post-onboarding (e.g. “Add boundary to get field-level weather”).
