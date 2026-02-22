# Crop Stage Management

This document describes how the app manages **crop stages** from planting through to storage, advises farmers at each stage, and accounts for **different maturity periods** of seed varieties.

**Implementation:** `platform/server/services/cropStageService.ts`  
**APIs:** Field crops (`/api/fields/:fieldId/crops/:id/stage`), Crop plans (`/api/crop-plans/:id/stage`), Reference (`/api/reference/crops/:cropName/stages`, `/api/reference/activity-types`)

---

## 1. Lifecycle overview

After a farmer adds a crop (or a field crop plan), the system tracks:

| Phase | Description | Typical activities |
|-------|-------------|--------------------|
| **Planting** | Land prep, sowing, establishment | planting, irrigation, scouting |
| **Growth** | Germination → Vegetative → Flowering / reproductive → Grain/fruit fill | weeding, fertilizing, spraying, pest/disease control, irrigation |
| **Maturity** | Ripening, harvest window | scouting, harvesting |
| **Post-harvest / Storage** | Drying, shelling/threshing, storage | post_harvest, storage |

Stages are defined per **crop type** (e.g. Maize, Tomato, Wheat, Soybean) in the `crop_growth_stages` table. Each stage has:

- **Days from planting** (min–max) so the app can compute “current stage” from the crop’s planting date.
- **Advice**: description, visual indicators, care actions, common issues, and an optional notification message.

**Variety maturity:** When a **seed variety** is set (e.g. on a field crop plan), `days_to_maturity_min` / `days_to_maturity_max` from `seed_varieties` are used to adjust the **Maturity** stage end and expected harvest window. Early varieties shorten the cycle; late varieties extend it.

---

## 2. Standard activity types

Farmers log activities (planting, spraying, weeding, harvesting, etc.) so the system can show what’s been done and what’s recommended. The following **activity types** are supported and returned as “recommended” per stage:

| Type | When it’s typically used |
|------|---------------------------|
| `planting` | Planting stage, establishment |
| `spraying` | Vegetative and reproductive (pesticides, foliar) |
| `weeding` | Early vegetative, pre-flowering |
| `fertilizing` | Vegetative, sometimes at planting |
| `irrigation` | Any stage when water is limiting |
| `pest_control` | When pests are observed or expected |
| `disease_control` | When disease risk or symptoms appear |
| `scouting` | All stages (monitoring) |
| `harvesting` | Maturity and harvest window |
| `post_harvest` | Drying, shelling, handling |
| `storage` | Storing grain/product |
| `other` | Anything else |

**API:** `GET /api/reference/activity-types` returns `{ "activityTypes": ["planting", "spraying", ...] }`.

Crop activities are stored in `crop_activities` with `activity_type` and `activity_date`; the stage API returns `recentActivityTypes` so the UI can show “already done” vs “recommended”.

---

## 3. How “current stage” is calculated

1. **Planting date**  
   From the **crop** (`crops.planting_date`) or the **field crop plan** (`field_crop_plans.planting_date`). If missing, the crop is treated as “not yet planted” and the **next** stage is the first one (e.g. Planting or Germination).

2. **Days from planting**  
   `daysFromPlanting = today - planting_date` (whole days). If planting date is in the future, `daysFromPlanting` is negative.

3. **Crop type**  
   From `crops.name` (matched to `crop_growth_stages.crop_name`) or from the plan’s `crop_id` → `crop_ref.name`.

4. **Variety maturity (plans only)**  
   For a **field crop plan**, if `seed_variety_id` is set, the service reads `days_to_maturity_min` and `days_to_maturity_max` and uses the midpoint (or max) as the effective maturity in days. The **Maturity** stage’s end day is then clamped to this value so that “harvest window” and “next stage” align with the variety (e.g. early maize ~115 days, late ~140+ days).

5. **Current and next stage**  
   Stages are ordered by `stage_order`. The **current** stage is the one where `daysFromPlanting` lies within `[days_from_planting_min, days_from_planting_max]`. The **next** stage is the following one in order. If the crop is past the last stage’s max day, current is still the last stage (e.g. Maturity or Post-harvest).

6. **Harvest window**  
   `isHarvestWindow` is true when `daysFromPlanting` is within about 21 days of the variety (or default) maturity, so the app can prompt for harvest and storage actions.

---

## 4. APIs

### 4.1 Stage for a crop (in a field)

**GET** `/api/fields/:fieldId/crops/:id/stage`

- **Auth:** Authenticated farmer; crop must belong to the given field and user.
- **Response:** `CropStageResult`: current/next stage, all stages, `daysFromPlanting`, `varietyDaysToMaturity` (if derivable from expected harvest), `isHarvestWindow`, `recentActivityTypes`, and full advice (care actions, common issues, etc.).

Use this when the farmer is viewing a **crop** on a field (legacy or current crops table).

### 4.2 Stage for a crop plan

**GET** `/api/crop-plans/:id/stage`

- **Auth:** Authenticated user; plan must belong to a field owned by the user.
- **Response:** Plan-level stage summary: `currentStage`, `nextStage`, `allStages`, `daysFromPlanting`, `varietyDaysToMaturity`, `varietyName`, `recommendedActivityTypes`, `isHarvestWindow`, plus planting/expected harvest dates.

Use this when the farmer is viewing a **field crop plan** (with optional seed variety). Variety maturity is applied from `seed_varieties`.

### 4.3 Stages for a crop type (reference)

**GET** `/api/reference/crops/:cropName/stages`

- **Auth:** Authenticated.
- **Path:** `cropName` = crop type name (e.g. `Maize`, `Tomato`, `Wheat`, `Soybean`). URL-encode if needed.
- **Response:** Array of stages for that crop type (all stages with description, care actions, common issues, and recommended activity types). No planting date or “current” logic.

Use this to show “what to expect” for a crop before planting, or to build a generic timeline.

### 4.4 Activity types

**GET** `/api/reference/activity-types`

- **Auth:** Authenticated.
- **Response:** `{ "activityTypes": ["planting", "spraying", "weeding", ...] }`.

Use this to populate dropdowns or filters when logging or displaying activities.

---

## 5. Stored data

### 5.1 `crop_growth_stages`

- **crop_name** – Matches `crop_ref.name` or legacy `crops.name` (e.g. Maize, Tomato, Wheat, Soybean).
- **stage_name** – e.g. Planting, Germination, Vegetative Growth, Tasseling, Maturity, Post-harvest / Storage.
- **stage_order** – 0, 1, 2, … (0 = Planting where present).
- **days_from_planting_min**, **days_from_planting_max** – Day range for this stage.
- **description**, **visual_indicators**, **care_actions**, **common_issues**, **notification_message** – Advice content.

Seeded in migrations (e.g. `20251022_create_crop_observations.sql`, `0021_crop_stages_planting_storage_more_crops.sql`).

### 5.2 `crop_activities`

- **crop_id** – Links to `crops.id`.
- **activity_type** – One of the standard types above (or custom; “other” for uncoded).
- **activity_date**, **description**, **cost**, **notes**.

Used to show “recent activities” and to avoid suggesting the same action twice once it’s logged.

### 5.3 Variety maturity

- **seed_varieties.days_to_maturity_min** / **days_to_maturity_max** – Used for **field crop plans** to adjust the Maturity stage and harvest window.
- **maturity_class** – ultra_early | early | medium | late (for display/filtering; logic uses days).

---

## 6. Example scenarios

### 6.1 Maize, no variety (crop only)

- Crop: name = "Maize", planting_date = 2025-11-01.
- Today = 2025-12-15 → daysFromPlanting = 44.
- Stages: Planting (0–0), Germination (0–10), Vegetative (10–50), …
- **Current stage:** Vegetative Growth (10–50).
- **Advice:** care_actions (e.g. Apply nitrogen, Weed control, Monitor pests), common_issues (Leaf blight, Armyworm).
- **Recommended activities:** weeding, fertilizing, spraying, irrigation, pest_control, scouting.

### 6.2 Maize with early variety (plan)

- Plan: crop = Maize, seed_variety = SC 637 (early), days_to_maturity 115–125 → use ~120.
- Planting_date = 2025-11-01 → expected harvest ~late Feb.
- Today = 2025-12-20 → daysFromPlanting = 49.
- **Current stage:** Vegetative (or early reproductive) with Maturity stage end clamped to 120 days.
- **isHarvestWindow:** true when daysFromPlanting ≥ 99 (120 − 21).

### 6.3 Tomato, post-harvest

- Crop: name = "Tomato", planting_date = 2025-09-01, actual_harvest_date = 2025-11-20.
- Today = 2025-12-01 → daysFromPlanting = 91.
- Last growth stage for Tomato might be Ripening (60–85); then Post-harvest / Storage (86–120).
- **Current stage:** Post-harvest / Storage.
- **Advice:** Harvest and short-term storage (store cool, use or process).

### 6.4 Not yet planted

- Plan: planting_date = null (or future).
- **daysFromPlanting:** null (or negative).
- **currentStage:** null.
- **nextStage:** Planting (if defined) or Germination.
- **recommendedActivityTypes:** planting, scouting (or first stage’s recommendations).

---

## 7. Adding new crops or stages

1. **New crop type**  
   Ensure it exists in `crop_ref` (name used as `crop_name` in stages). Add rows to `crop_growth_stages` with `stage_order`, day ranges, and advice. Run a migration or seed script.

2. **New stage for existing crop**  
   Insert into `crop_growth_stages` with the same `crop_name`, next `stage_order`, and appropriate day range. Adjust neighbouring stages’ ranges if needed.

3. **Variety maturity**  
   Set `days_to_maturity_min` and `days_to_maturity_max` on `seed_varieties`. The stage service will use them automatically for plans that reference that variety.

4. **Activity types**  
   To add a new standard type, extend `CROP_ACTIVITY_TYPES` in `cropStageService.ts` and map it in `stageToRecommendedActivities()` where relevant. Document it in this file and in the activity-types API response.

---

## 8. Summary

- **Stages** are defined per crop type with day ranges and advice (description, care actions, common issues).
- **Current stage** is derived from planting date and (for plans) **variety maturity**.
- **Activities** (planting, spraying, weeding, fertilizing, harvesting, storage, etc.) are standard types; the app recommends which to do per stage and shows what’s already logged.
- **Variety maturity** shortens or lengthens the cycle so harvest and storage advice align with early/medium/late varieties.

This gives farmers clear guidance from planting through to storage, with variety-specific timing where a seed variety is selected.
