# GreenUpp Notification Guide

Implementation-ready rules, taxonomy, copy, and payloads for in-app and push notifications. Tone: calm, practical, respectful, non-alarmist.

---

## 1) Core Principles (Non-Negotiable)

### The three questions
Every notification must answer:
- **Why now?** — What trigger or timing makes this relevant today.
- **Why me?** — Why this user (location, crop, task, or decision).
- **What should I do?** — One clear next step; no vague “check the app.”

### Structure
Use: **[Context]** → **[Risk or opportunity]** → **[Action]**

- Be specific: field name, crop, time window, or number when possible.
- Avoid vague phrasing (“Something might happen”, “Stay updated”).
- Always include a clear, actionable next step.

### Language and tone
- No absolute language when uncertain. Prefer: “likely”, “possible”, “consider”.
- No marketing hype, fear tactics, or ALL CAPS.
- Emoji: at most one per notification; use sparingly for clarity (e.g. weather, task).
- No emoji overload.

### Decision and trigger linkage
- Notifications must map to a **decision or trigger record** with:
  - **Expiry** — Do not send if the decision is expired.
  - **Confidence** — Used for gating (see §5).
- Do **not** notify if:
  - The decision is **expired**.
  - The decision was **overridden** by the user.
  - The user has **already acted** on it (e.g. marked task done, acknowledged alert).

### Degraded mode (low confidence)
- If weather or location confidence is **low**:
  - Send only **conservative** notifications.
  - Prefer: “Inspect conditions” or “Confirm your location” rather than strong advice.
- Do not give high-stakes advice (e.g. “Spray today”) when confidence is low.

---

## 2) Taxonomy (Types)

| Type | Priority default | Confidence requirement | Typical send window | Throttle |
|------|------------------|------------------------|----------------------|----------|
| **weather_risk** | high | high | 05:30–08:00 if action same day | Max 1/day per risk type (rain/wind/cold) |
| **weather_opportunity** | medium | high | Evening prior or 06:00–08:00 | Max 1/day |
| **plant_diagnosis_ready** | medium | N/A (user requested) | Immediate | Max 2/day per user |
| **plant_diagnosis_risk** | high | high (model + review) | Immediate | Max 1 per submission |
| **task_due** | medium | N/A | Morning or 2h before due | Max 3/day |
| **task_overdue** | high | N/A | Once per overdue task per day | Max 2/day |
| **product_recommendation** | low | decision-triggered only | With diagnosis or decision | Max 1 per decision |
| **critical_alert** | high | high | As needed | Max 1/day; rare |
| **weekly_outlook** | low | N/A | Sun 18:00–20:00 or Mon 06:00–08:00 | 1/week |

### Type definitions (short)
- **weather_risk** — Rain, wind, cold, frost, high UV affecting fieldwork or spraying.
- **weather_opportunity** — Dry window suitable for planting, spraying, or harvesting.
- **plant_diagnosis_ready** — Analysis complete; user can review results.
- **plant_diagnosis_risk** — Possible pest/disease with suggested next steps (no “confirmed” unless verified).
- **task_due** — Task due today or soon; specific field/crop when possible.
- **task_overdue** — Task past due; gentle nudge.
- **product_recommendation** — Only when tied to a decision/diagnosis; never pushy.
- **critical_alert** — Rare; e.g. “Spraying today may be wasted due to rain”.
- **weekly_outlook** — Retention; short summary of coming week.

---

## 3) Copy Templates and Examples

For each category: **BAD** (avoid), **GREAT** (send), and **template** with placeholders.

---

### Weather risk (rain, wind, cold, UV)

**BAD**
- “ALERT! BAD WEATHER!!”
- “Weather might be bad. Check app.”
- “Heavy rain confirmed tomorrow.” (avoid “confirmed” unless very high certainty)
- “You might want to do something about the weather.”

**GREAT**
1. “Heavy rain likely tomorrow (72%). Delay spraying and check drainage today.”
2. “High winds (28 km/h) this afternoon. Avoid spraying to prevent drift.”
3. “Frost risk tonight (around 2°C). Protect sensitive crops or cover seedlings.”
4. “Low temperature around 4°C expected tomorrow morning. Delay planting if soil is wet.”
5. “High UV (index 10) between 11:00–15:00. Plan fieldwork for early morning or late afternoon.”
6. “Rain likely in 3–4 hours. Finish spraying or postpone to next dry window.”

**Template**
- **Rain:** “[Rain] likely [when] ([X]%). [Action: delay spraying / check drainage / secure stores].”
- **Wind:** “High winds ([X] km/h) [when]. Avoid spraying to prevent drift.”
- **Cold/frost:** “Frost risk [when] (around [X]°C). [Action: protect crops / cover seedlings].”
- **UV:** “High UV (index [X]) [time window]. [Action: early morning or late afternoon fieldwork].”

---

### Weather opportunity (dry window)

**BAD**
- “Great weather!!”
- “You could do stuff outside.”
- “Perfect conditions!!!”

**GREAT**
1. “Dry window next 2 days. Good time for planting or spraying early morning.”
2. “Little or no rain expected until Friday. Suitable for field work and spraying.”
3. “Next 36 hours mostly dry. Consider scheduling spraying or planting.”
4. “Dry spell through Thursday. Good window for maize planting in Plot A.”
5. “Low wind and no rain tomorrow morning. Favorable for spraying if needed.”
6. “Clear window Tuesday–Wednesday. Plan harvesting or soil work.”

**Template**
- “Dry window [duration]. [Action: planting / spraying / field work] [optional: time or field].”

---

### Plant diagnosis results

**BAD**
- “Your plant is SICK!!”
- “We diagnosed blight.” (unless verified and certain)
- “Diagnosis complete. Open app.”
- “Disease confirmed.” (avoid unless very high certainty)

**GREAT**
1. “Possible early blight on tomatoes. Review safe treatment steps.”
2. “Analysis ready for your maize sample. View results and suggested actions.”
3. “Leaf spot likely on beans. Review treatment options and timing.”
4. “Analysis suggests nutrient deficiency. Check recommendations and soil notes.”
5. “Possible pest damage on submitted sample. Review identification and control options.”
6. “Analysis complete. Unclear match; consider a follow-up photo in better light.”

**Template**
- **Clear match:** “Possible [condition] on [crop]. Review [treatment / next steps].”
- **Ready only:** “Analysis ready for [crop/sample]. View results and suggested actions.”
- **Uncertain:** “Analysis complete. [Suggestion: follow-up or inspect in person].”

**Rule:** Avoid “diagnosed” or “confirmed” unless certainty is very high and verified. Prefer “possible”, “likely”, “suggests”.

---

### Task reminders (due / overdue)

**BAD**
- “You have tasks.”
- “Don’t forget!!”
- “Task due soon.” (no field/crop/time)

**GREAT**
1. “Field inspection due today. Check maize in Plot A before noon.”
2. “Spraying task due tomorrow. Confirm weather and product availability.”
3. “Soil sampling due this week in North field. Schedule when dry.”
4. “Maize inspection overdue. Check Plot A when you can.”
5. “Fertilizer application due today. Morning window if weather allows.”
6. “Harvest prep due by Friday. Review storage and labor.”

**Template**
- **Due:** “[Task name] due [when]. [Action] [optional: field/crop/time].”
- **Overdue:** “[Task name] overdue. [Action] when you can.”

Prefer specific field, crop, or time where possible.

---

### Product recommendations (decision-triggered only)

**BAD**
- “Buy now!!”
- “Great deals on products.”
- “You need this product.” (pushy)

**GREAT**
1. “Treatment recommended for leaf spot. View available options near you.”
2. “Suggested products for your diagnosis. Compare options and timing.”
3. “Options for nutrient treatment. View in Marketplace with your diagnosis.”
4. “Products that may help with your crop issue. Review and choose if needed.”
5. “Based on your analysis, see treatment options. No obligation.”
6. “Fertilizer options for your soil results. Compare and order if useful.”

**Template**
- “Treatment recommended for [condition]. View available options [near you / in Marketplace].”
- “Based on your [diagnosis/decision], see [options]. [No obligation / Review if needed].”

**Rule:** Only when tied to a decision or diagnosis. Never pushy; always “view”, “compare”, “if needed”.

---

### High-priority alerts (rare)

**BAD**
- “URGENT!!! ACT NOW!!”
- “Something is wrong.” (no action)
- “Critical!!” (with no clear reason)

**GREAT**
1. “Spraying today may be wasted due to rain forecast. Review your plan.”
2. “Wind likely to exceed safe spray limit this afternoon. Postpone spraying.”
3. “Frost expected tonight. Protect or harvest sensitive crops today.”
4. “Rain in 2–3 hours. Finish current field work or postpone.”
5. “Temperature dropping below safe threshold for seedlings. Cover or move if possible.”
6. “Weather changed: dry window shortened. Adjust spraying plan if needed.”

**Template**
- “[Planned action] may be [ineffective/risky] because [reason]. [Action: review / postpone / protect].”

**Rule:** Reserve for high confidence and real risk or wasted effort. Max 1 high-priority per day.

---

### Weekly outlook (retention)

**BAD**
- “Your weekly digest!!”
- “Lots of stuff happened.”
- “Don’t miss out!!”

**GREAT**
1. “Weekly Farm Outlook: 2 dry days ahead. Good window for field work.”
2. “This week: rain mid-week, then drier. Plan spraying for Tuesday or weekend.”
3. “Weekly Outlook: frost risk Tuesday night; warmer by Thursday.”
4. “Next 7 days: mixed weather. Best planting window Tuesday–Wednesday.”
5. “Weekly summary: 1 task overdue, 2 dry days ahead. Plan when you can.”
6. “Farm Outlook: dry start, rain by Friday. Schedule spraying early in the week.”

**Template**
- “Weekly Farm Outlook: [1–2 sentence summary]. [Suggested action or window].”

---

## 4) Frequency Caps and Quiet Hours

### Default limits
| Rule | Default |
|------|---------|
| Max notifications per user per day | 2 |
| Max high-priority per user per day | 1 |
| Weekly outlook | 1 per week |
| Diagnosis-related (ready + risk) | Immediate but max 2/day per user |
| Quiet hours (local time) | 20:30 – 06:00 |
| OS / app notification settings | Always respected |

### De-duplication
- **Same type + same trigger** (e.g. same decision, same task) **within 12 hours** → suppress duplicate.
- **Same user, same notification type, 3 consecutive sends with no open/click** → reduce frequency for that type (e.g. 1/day or lower) until they engage again.

### Quiet hours
- Do **not** send non-critical notifications between **20:30 and 06:00** in the user’s local time (from profile or device).
- **critical_alert** may bypass quiet hours if configured; use sparingly.

---

## 5) Priority and Confidence Gating (Safety)

### Priority and confidence
- **High priority** is allowed only when:
  - **Confidence is high** (weather, location, or diagnosis), and
  - **Risk or opportunity is material** (e.g. spray wasted, frost, or clear dry window).
- **Low confidence** → only allow **conservative** notifications:
  - “Inspect conditions”, “Confirm your location”, “Check again later”.
  - Do **not** send “Spray today” or “Plant now” when confidence is low.

### Weather-based spray recommendations
Block or do not send spray-related advice if any of:
- Rain probability ≥ **threshold_rain_prob** (e.g. 50%).
- Wind speed ≥ **threshold_wind_kmh** (e.g. 20 km/h).
- Location confidence **low** (e.g. no recent fix or coarse location).

These thresholds should be **configurable on the server** (e.g. env or config table).

### Diagnosis
- **plant_diagnosis_risk** with strong advice only when model confidence (or review) is above a set **threshold_confidence** (e.g. 0.7).
- Below threshold: use “Possible … Review …” and avoid “confirmed” or “treat immediately”.

---

## 6) Backend Payload Shape (JSON)

Standard structure for **server → push provider → client** (and for in-app display):

```json
{
  "id": "uuid",
  "type": "weather_risk",
  "priority": "high",
  "confidence": "high",
  "title": "Heavy rain likely tomorrow (72%)",
  "body": "Delay spraying and check drainage today.",
  "decisionId": 123,
  "triggerType": "weather",
  "triggerRefId": 456,
  "deepLink": "greenupp://decisions/123",
  "expiresAt": "2025-01-29T18:00:00.000Z",
  "createdAt": "2025-01-28T06:00:00.000Z",
  "meta": {
    "rainProb": 0.72,
    "windKmh": 12,
    "locationLabel": "Lusaka, Zambia"
  }
}
```

### Field rules
- **id** — Unique (e.g. UUID) for dedup and tracking.
- **type** — One of taxonomy types (§2).
- **priority** — `high` | `medium` | `low`.
- **confidence** — `high` | `medium` | `low` (when applicable).
- **title** — Short; fits lock screen / banner.
- **body** — One or two lines; action-oriented.
- **decisionId** — When notification is tied to a decision; for auditing and “already acted” checks.
- **triggerType** — e.g. `weather`, `task`, `diagnosis`, `decision`.
- **triggerRefId** — ID of the trigger record (e.g. weather snapshot, task id).
- **deepLink** — Required; where to open in app (§7).
- **expiresAt** — Required; ISO 8601; do not send if past.
- **createdAt** — ISO 8601.
- **meta** — Optional; type-specific (e.g. rainProb, windKmh, locationLabel, taskId, diagnosisId).

### Backend rules
- Always set **expiresAt** and **deepLink**.
- Link to a stored **decision or trigger** for auditing and suppression (already acted, expired, overridden).

---

## 7) Deep-Link Routing

| Notification type(s) | Route / screen | Notes |
|----------------------|----------------|-------|
| **weather_risk**, **weather_opportunity** | Weather screen | Highlight relevant day; show linked decisions |
| **plant_diagnosis_ready**, **plant_diagnosis_risk** | Plant analysis / diagnosis details | Open specific analysis by id |
| **task_due**, **task_overdue** | Tasks screen | Filter to due/overdue; optional taskId in query |
| **product_recommendation** | Marketplace | Filter by treatment/relevant category; show disclaimer (info only, not medical advice) |
| **critical_alert** | Decisions or Home | Open related decision if decisionId present |
| **weekly_outlook** | Home | Weekly panel expanded or scrolled into view |

**Deep-link format (examples)**
- `greenupp://decisions/123`
- `greenupp://weather?day=2025-01-29`
- `greenupp://diagnosis/456`
- `greenupp://tasks?filter=due`
- `greenupp://tasks?taskId=789`
- `greenupp://marketplace?category=treatments`
- `greenupp://home?panel=weekly`

Client should read **deepLink** (or equivalent `data.deepLink` / `data.screen` + `data.id`) and navigate accordingly.

---

## 8) Scheduling Strategy

### When to send
- **Weather risk (action same day):** Morning **05:30–08:00** local.
- **Wind alerts:** **2–4 hours before** peak wind window.
- **Dry window (opportunity):** **Evening before** or **06:00–08:00** same day.
- **Weekly outlook:** **Sunday 18:00–20:00** or **Monday 06:00–08:00** local.
- **Task due:** Morning or **~2 hours before** due time.
- **Diagnosis ready/risk:** **Immediately** after processing (respect rate limits and quiet hours).
- **Product recommendation:** With or shortly after the decision/diagnosis that triggers it.

### When NOT to send
- Decision **already acted on** or **ignored** by user.
- Decision **expired** (past **expiresAt**).
- **Low confidence** and message would imply risky or definitive action.
- User has **not completed onboarding** or **location not set** → send only “Confirm your location” type.
- **Quiet hours** (except allowed critical_alert).
- **Over cap** (e.g. 2/day, 1 high-priority/day, 1 weekly outlook/week).
- **De-dupe**: same type + same trigger in last 12 hours.

---

## 9) Personalization

Use behavior to adjust what and how often we send:

- **User often ignores “UV” alerts** → Lower priority or reduce frequency for UV.
- **User often opens rain/wind alerts** → Keep weather_risk high priority and current frequency.
- **User rarely opens app** → Prefer **weekly_outlook** only; avoid daily stream.
- **User acts on task reminders** → Keep task_due/task_overdue as is.
- **User never opens product_recommendation** → Stop or greatly reduce; do not increase.
- **New user** → Fewer notifications until location and preferences are set; favor “confirm location” and onboarding.

Store simple counts or flags (e.g. last 10 notifications: opened vs not) per type to drive throttle and priority.

---

## 10) Success Metrics and A/B Tests

### Core metrics
- **Open rate** — % of delivered notifications that lead to app open.
- **Deep-link click-through** — % that open the intended screen (from push tap or in-app list).
- **Decision adoption rate** — After a notification tied to a decision, % where user takes the suggested action (e.g. postpone spray, view treatment).
- **7-day retention** — Return within 7 days; compare cohorts with vs without notifications.
- **Mute / unsubscribe rate** — Keep low; track per channel (push, email) and per type.

### A/B test ideas
1. **Wording:** Action-first (“Delay spraying today”) vs context-first (“Rain likely tomorrow. Delay spraying today”).
2. **Send time:** Morning 06:00 vs 07:30 for weather_risk.
3. **Emoji:** One relevant emoji vs no emoji (e.g. rain, task).
4. **Body length:** One line vs two lines.
5. **Weekly outlook:** Sunday evening vs Monday morning.
6. **Product recommendation:** “View options” vs “Compare treatment options near you”.

### Guardrails
- Do not increase frequency to “win” opens at the cost of mute/unsubscribe.
- Monitor retention and satisfaction; prefer long-term engagement over short-term opens.

---

## Quick Reference: Type → Priority, Link, and Throttle

| Type | Default priority | Deep link | Throttle |
|------|------------------|-----------|----------|
| weather_risk | high | Weather + decisions | 1/day per risk type |
| weather_opportunity | medium | Weather | 1/day |
| plant_diagnosis_ready | medium | Diagnosis detail | 2/day |
| plant_diagnosis_risk | high | Diagnosis detail | 1 per submission |
| task_due | medium | Tasks (due) | 3/day |
| task_overdue | high | Tasks (overdue) | 2/day |
| product_recommendation | low | Marketplace (treatments) | 1 per decision |
| critical_alert | high | Decisions / Home | 1/day |
| weekly_outlook | low | Home (weekly panel) | 1/week |

---

*Last updated: 2025-01. Align implementation in `platform/server/services/notifications.ts`, `notificationJobs.ts`, and app deep-link handling with this guide.*
