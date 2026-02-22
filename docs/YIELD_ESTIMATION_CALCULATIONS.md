# Yield Estimation Calculations

This document describes how the app estimates crop yield for a field crop plan. The method is **deterministic and rule-based** (no machine learning). Version: **mvp_v1**.

**Implementation:** `platform/server/services/yieldSimulationService.ts`

---

## 1. Overview

The simulation produces three yield figures (tonnes per hectare, t/ha):

| Output | Meaning |
|--------|--------|
| **Conservative** | Expected × 0.75 — lower bound |
| **Expected** | Main estimate from base yield and stress/management factors |
| **Best case** | Expected × 1.25 — upper bound |

**Total yield** (tonnes) = per‑ha value × **area (hectares)**. Area comes from the plan’s `targetAreaHa` or the field’s `size` (acres converted to ha if needed).

---

## 2. Inputs and data sources

| Input | Source | Fallback |
|-------|--------|----------|
| **Base yield range** (min–max t/ha) | Seed variety: `yieldPotentialThaMin`, `yieldPotentialThaMax` | 4 and 8 t/ha |
| **Crop water requirement** (mm) | Crop ref: `defaultWaterRequirementMm` | 500 mm |
| **Location** | Field: `centerLat`/`centerLng`, `location`, or `locationId` | "Lusaka, Zambia" |
| **Climate** (monthly rain, temp) | `getClimateData(location)` | Default: 22°C, 100 mm/month, 180‑day season |
| **Area (ha)** | Plan: `targetAreaHa` or field `size` + `sizeUnit` | 1 ha |
| **Management level** | Plan: `managementLevel` | "medium" |

---

## 2.1 Requirements for successful (non-zero) yields

To avoid **zero yields**, the following must be in place. The service applies defensive fallbacks so that missing or invalid data still produces a non-zero estimate where possible.

### Checklist

| Requirement | Why it matters | What happens if missing |
|-------------|----------------|-------------------------|
| **Plan has a crop type** (`cropId` → `crop_ref`) | Base yield and water need come from crop type. | Crop ref is used for water need (default 500 mm). Base yield uses variety or default 4–8 t/ha. |
| **Seed variety yield potential** (optional) | If set, `yieldPotentialThaMin` and `yieldPotentialThaMax` define the base range. | Default 4–8 t/ha is used. **If both are 0 or null**, the code now treats them as missing and uses 4 and 8 so yield is not zero. |
| **Field has location** | Used for `getClimateData(location)` (rain, temperature). | Fallback: "Lusaka, Zambia" and default climate (22°C, 100 mm/month). |
| **Climate returns precipitation** | `seasonalRainMm` is the sum of 12 months’ rain; `waterStressFactor = min(1, rain / cropWaterMm)`. | If seasonal rain is 0, the code now uses a **minimum water stress factor of 0.2** so yield is not zeroed out by drought. |
| **Area** | Total yield = per‑ha × area. | Plan `targetAreaHa` or field `size`; if both missing or ≤ 0, area defaults to **1 ha**. Area is clamped to at least **0.01 ha** so totals are never zero from rounding. |
| **Crop water requirement** | Prevents division by zero and gives a sensible water stress factor. | Default **500 mm**; if 0 or missing, the code uses 500 so `waterStressFactor` is well-defined. |

### Common causes of zero (and fixes in code)

1. **Variety has 0,0 yield potential**  
   Previously this made `baseYieldMid = 0`. The service now treats **0 or null** as “use default” and uses **4 and 8 t/ha** so base yield is never zero.

2. **No or zero rainfall from climate**  
   Previously `waterStressFactor = 0` could make expected yield 0. The service now applies a **floor of 0.2** on the water stress factor so some yield is always estimated even with no rain.

3. **Zero area**  
   Totals would be 0. Area is now **at least 0.01 ha** when derived from plan or field so total tonnes are not zero from rounding.

4. **Crop ref missing or zero water requirement**  
   Division by zero or extreme factors are avoided by defaulting crop water need to **500 mm** and ensuring the divisor is at least 1.

### Quick verification

- **Per‑ha yields (conservative / expected / best case)** should be non-zero as long as base yield and factors are applied (defaults and floors above ensure this).
- **Total yields** are per‑ha × area; ensure the field or plan has a positive **size** or **targetAreaHa** (or rely on the 1 ha default).
- Stored **inputs** and **drivers** on each run show which values were used (e.g. `seasonal_rain_mm`, `water_stress_factor`); check these if a run looks wrong.

---

## 3. Formulas

### 3.1 Base yield (midpoint)

```
baseYieldMid = (baseYieldMin + baseYieldMax) / 2
```

- If the plan has a **seed variety** with yield potential: use `varietyYieldMin` and `varietyYieldMax`.
- Otherwise: `baseYieldMin = 4`, `baseYieldMax = 8` → **baseYieldMid = 6 t/ha**.

### 3.2 Water stress factor

- **Seasonal rain (mm)** = sum of 12 months’ `averagePrecipitation` from climate.
- **Crop water need (mm)** = from crop ref (e.g. 500 mm for maize).

```
waterStressFactor = max(0.2, min(1, seasonalRainMm / cropWaterMm))
```

- Capped at **1**: no bonus for rain above requirement; only reduction when rain is below need.
- **Floored at 0.2** so that zero or very low rainfall does not drive estimated yield to zero.

### 3.3 Heat stress factor

- **Average temperature (°C)** = average of 12 months’ `averageTemp`.

```
if avgTemp ≤ 30°C  → heatStressFactor = 1.0
if 30°C < avgTemp ≤ 35°C → heatStressFactor = 0.85
if avgTemp > 35°C  → heatStressFactor = 0.7
```

### 3.4 Management factor

```
if managementLevel === "high"   → managementFactor = 1.1
if managementLevel === "low"    → managementFactor = 0.85
otherwise (medium or missing)   → managementFactor = 1.0
```

### 3.5 Expected yield (t/ha)

```
expectedYield = baseYieldMid × waterStressFactor × heatStressFactor × managementFactor
```

### 3.6 Conservative and best case (t/ha)

```
conservative = expectedYield × 0.75
bestCase     = expectedYield × 1.25
```

### 3.7 Total yield (tonnes)

```
totalConservative = conservative × areaHa
totalExpected     = expectedYield × areaHa
totalBestCase     = bestCase × areaHa
```

---

## 4. Worked examples

### Example 1: Maize, good rain, medium management

**Inputs:**

- Base yield: 4–8 t/ha (no variety) → **baseYieldMid = 6**
- Crop water need: **500 mm**
- Seasonal rain: **600 mm**
- Avg temp: **26 °C**
- Management: **medium**
- Area: **2.5 ha**

**Calculation:**

- waterStressFactor = min(1, 600/500) = **1.0**
- heatStressFactor = **1.0** (26 ≤ 30)
- managementFactor = **1.0**
- expectedYield = 6 × 1.0 × 1.0 × 1.0 = **6.0 t/ha**
- conservative = 6.0 × 0.75 = **4.5 t/ha**
- bestCase = 6.0 × 1.25 = **7.5 t/ha**

**Totals (2.5 ha):**

- Total conservative: 4.5 × 2.5 = **11.25 t**
- Total expected: 6.0 × 2.5 = **15 t**
- Total best case: 7.5 × 2.5 = **18.75 t**

---

### Example 2: Maize, dry year, high management

**Inputs:**

- Base yield: **6 t/ha** (midpoint)
- Crop water need: **500 mm**
- Seasonal rain: **350 mm**
- Avg temp: **28 °C**
- Management: **high**
- Area: **1 ha**

**Calculation:**

- waterStressFactor = min(1, 350/500) = **0.7**
- heatStressFactor = **1.0** (28 ≤ 30)
- managementFactor = **1.1**
- expectedYield = 6 × 0.7 × 1.0 × 1.1 = **4.62 t/ha**
- conservative = 4.62 × 0.75 ≈ **3.47 t/ha**
- bestCase = 4.62 × 1.25 ≈ **5.78 t/ha**

**Totals (1 ha):** ~3.47 t, ~4.62 t, ~5.78 t.

---

### Example 3: Hot region, variety with higher potential

**Inputs:**

- Variety: **6–10 t/ha** → baseYieldMid = **8**
- Crop water need: **500 mm**
- Seasonal rain: **500 mm**
- Avg temp: **33 °C**
- Management: **medium**
- Area: **5 ha**

**Calculation:**

- waterStressFactor = min(1, 500/500) = **1.0**
- heatStressFactor = **0.85** (30 < 33 ≤ 35)
- managementFactor = **1.0**
- expectedYield = 8 × 1.0 × 0.85 × 1.0 = **6.8 t/ha**
- conservative = 6.8 × 0.75 = **5.1 t/ha**
- bestCase = 6.8 × 1.25 = **8.5 t/ha**

**Totals (5 ha):** 25.5 t, 34 t, 42.5 t.

---

## 5. Scenarios

### Scenario A: Adequate rainfall, cool season

- **Seasonal rain** ≥ crop water need → waterStressFactor = 1.0.
- **Avg temp** ≤ 30°C → heatStressFactor = 1.0.
- **Effect:** Expected yield = baseYieldMid × managementFactor only. Best case is 25% above that.

### Scenario B: Drought (low rainfall)

- **Seasonal rain** &lt; crop water need → waterStressFactor &lt; 1 (e.g. 350/500 = 0.7).
- **Effect:** Linear reduction in expected yield. No further penalty for heat if temp stays ≤ 30°C.

### Scenario C: Hot season (no drought)

- **Avg temp** in 30–35°C → heatStressFactor = 0.85; &gt; 35°C → 0.7.
- **Effect:** 15% or 30% reduction on expected yield even with good water.

### Scenario D: Drought + heat

- Both waterStressFactor and heatStressFactor &lt; 1.
- **Effect:** Multiplicative: e.g. 0.7 × 0.85 = 0.595 → about 40% reduction from base.

### Scenario E: High management

- managementFactor = 1.1.
- **Effect:** 10% increase over medium. Often partly offsets moderate stress.

### Scenario F: Low management

- managementFactor = 0.85.
- **Effect:** 15% decrease even with good climate.

### Scenario G: No variety / no climate

- **No variety:** baseYieldMin = 4, baseYieldMax = 8 (baseYieldMid = 6).
- **Climate API failure:** fallback climate (e.g. 100 mm/month, 22°C) is used; waterStressFactor can be &lt; 1 if crop need is high.

### Scenario H: Area from plan vs field

- **Plan has targetAreaHa:** that value is used (e.g. 0.5 ha for a plot).
- **Otherwise:** field `size` is used; if `sizeUnit` is "acres", size is converted to ha (× 0.4047).
- **Effect:** Same per‑ha yields; only total tonnes scale with area.

---

## 6. Stored outputs and drivers

Each simulation run persists:

- **inputs:** plan id, dates, area, management, location, crop water mm, variety yield min/max.
- **outputs:** conservative, expected, best_case (t/ha); areaHa; totalConservative, totalExpected, totalBestCase (t); **drivers:** water_stress_factor, heat_stress_factor, management_factor, seasonal_rain_mm.
- **explanation:** Short text summary for the UI.
- **method_version:** `"mvp_v1"`.

The **drivers** object makes it clear why a given run produced its numbers (e.g. low yield due to water_stress_factor = 0.6 and heat_stress_factor = 0.85).

---

## 7. Summary

| Step | Formula or rule |
|------|------------------|
| Base yield midpoint | (min + max) / 2 from variety or 6 t/ha default |
| Water stress | min(1, seasonalRainMm / cropWaterMm) |
| Heat stress | 1.0 if ≤30°C, 0.85 if ≤35°C, 0.7 if &gt;35°C |
| Management | 1.1 / 1.0 / 0.85 for high / medium / low |
| Expected (t/ha) | baseMid × water × heat × management |
| Conservative / Best | expected × 0.75 and × 1.25 |
| Totals (t) | per‑ha × areaHa |

This gives a transparent, auditable yield estimate suitable for planning and comparison across locations and management levels.
