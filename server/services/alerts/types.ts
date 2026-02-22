/**
 * Normalized alert event model for Hazard & Pest Alerts subsystem.
 * All sources (GDACS, ReliefWeb, OpenWeather, pest) map to this shape.
 */

export type EventType =
  | "flood"
  | "drought"
  | "storm"
  | "heat"
  | "extreme_rain"
  | "pest_outbreak"
  | "disease_risk"
  | "advisory";

export type HazardClass = "weather" | "climate" | "pest";

export type AlertStatus = "active" | "resolved" | "test";

export type SourceType = "rss" | "api" | "model";

export type GeoJSONPoint = { type: "Point"; coordinates: [number, number] };
export type GeoJSONPolygon = { type: "Polygon"; coordinates: number[][][] };
export type GeoJSONMultiPolygon = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};
export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | GeoJSONMultiPolygon;

export interface AlertSource {
  name: string;
  type: SourceType;
  url?: string;
  externalId?: string;
}

export interface NormalizedAlertEvent {
  eventType: EventType;
  hazardClass: HazardClass;
  severity: number; // 1..5
  confidence?: number; // 0..1
  geometry?: GeoJSONGeometry;
  region?: {
    country?: string;
    province?: string;
    district?: string;
  };
  startAt?: Date;
  endAt?: Date;
  headline: string;
  summary?: string;
  recommendedActions: string[];
  source: AlertSource;
  dedupeKey: string;
  status: AlertStatus;
}

export interface RawGdacsEvent {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  guid?: string;
  "gdacs:eventtype"?: string;
  "gdacs:eventid"?: string;
  "gdacs:country"?: string;
  "gdacs:fromdate"?: string;
  "gdacs:todate"?: string;
  "gdacs:severity"?: string;
  "gdacs:episodeid"?: string;
  "georss:point"?: string;
  [key: string]: unknown;
}

export interface RawReliefWebReport {
  id?: string;
  title?: string;
  body?: string;
  date?: { created?: string };
  url?: string;
  country?: Array<{ name?: string; id?: string }>;
  primary_country?: { name?: string };
  theme?: Array<{ name?: string }>;
  [key: string]: unknown;
}
