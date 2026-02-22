# Hazard & Pest Alerts Subsystem

Zambia-first alerting: ingests weather/climate hazard data and pest signals, then notifies users (push + in-app) based on location (Zambian locations DB, field coordinates/boundaries).

## Sources and schedules

| Source | Type | Schedule | Description |
|--------|------|----------|-------------|
| **GDACS** | RSS | Every 15 min | Global Disaster Alert and Coordination System (flood, storm, drought). Feed: `GDACS_RSS_URL` (default: https://www.gdacs.org/gdacsapi/xml/rss.xml). |
| **ReliefWeb** | API | Every 15 min | Disaster/hazard reports for Zambia. Public API; no key required. Filter: country ISO3 ZMB. |
| **OpenWeather** | Model | Optional | Derived signals from forecast thresholds: heavy rain (mm/day), heatwave (°C), high wind (m/s). Ingest can be extended to call hyperlocal weather and pass to `deriveOpenWeatherSignals`. |
| **PestSignals** | Model | Optional | Fallback pest risk from weather (e.g. armyworm: warm + wet) or external feed. `derivePestSignals()`; can be wired to run on same 15 min cycle with weather-derived inputs. |

Config (env):

- `GDACS_RSS_URL` – GDACS feed URL (optional).
- `RELIEFWEB_USER_AGENT` – User-Agent for ReliefWeb (optional).
- `ALERT_HEAVY_RAIN_MM_DAY`, `ALERT_HEATWAVE_TEMP_C`, `ALERT_HIGH_WIND_MS` – thresholds for OpenWeather signals.
- `ALERTS_INGEST_INTERVAL_MIN`, `ALERTS_DELIVERY_INTERVAL_MIN` – used if scheduler runs via `startAlertsScheduler()` (default 15 min).

## Architecture

- **sources/** – Fetchers and derived signal generators (GDACS RSS, ReliefWeb API, OpenWeather thresholds, pest heuristics).
- **normalize.ts** – Maps raw payloads to the normalized event model (eventType, hazardClass, severity, geometry, region, headline, summary, recommendedActions, source, dedupeKey).
- **dedupe.ts** – Deterministic dedupeKey (source + externalId or hash of headline/geometry/startAt).
- **geo.ts** – Bbox/point overlap, point-in-polygon, distance, Zambia province resolution via `zambian-locations`.
- **ingest.ts** – Orchestrator: fetch GDACS + ReliefWeb, normalize, filter Zambia-relevant, upsert into `alert_events`; marks old events resolved when past `endAt`.
- **delivery.ts** – Matches active events to users (field centers/bboxes, farm location → Zambian DB), respects subscription (minSeverity, eventTypes, quiet hours), records `alert_deliveries`, calls `createNotification` (weather_alert).
- **scheduler.ts** – `runAlertsIngestion()` and `runAlertsDelivery()`; wired in `notificationJobs` every 15 min (Africa/Lusaka).

## Database

- **alert_events** – Normalized events (eventType, hazardClass, severity, geojson, province, district, startAt, endAt, source*, dedupeKey, status).
- **user_alert_subscriptions** – scope (my_location | my_fields | custom_area), eventTypes, minSeverity, quietHours, enabled.
- **alert_deliveries** – (userId, alertEventId, channel) unique; prevents duplicate sends.

## API

- `GET /api/alerts/events?near=lat,lng&radiusKm=&types=&minSeverity=` – List active events, optional geo/filters.
- `GET /api/alerts/me` – Alerts relevant to current user + subscription.
- `POST /api/alerts/subscriptions` – Create/update subscription.
- `PATCH /api/alerts/subscriptions/:id` – Update subscription.
- `POST /api/alerts/test` – Admin: inject a test event (OpenWeather-derived).

## Design notes

- Feeds/APIs first; no HTML scraping. Source URL and timestamp stored for traceability.
- Quiet hours and digest mode use Africa/Lusaka. Update notifications only when severity or summary changes meaningfully (future enhancement).
