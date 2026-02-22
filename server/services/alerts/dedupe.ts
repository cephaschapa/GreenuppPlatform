/**
 * Dedupe key creation and stability for alert events.
 * Deterministic key from source + externalId (or headline + geometry + startAt).
 */

import type { NormalizedAlertEvent } from "./types.js";
import { createHash } from "node:crypto";

export function createDedupeKey(event: {
  source: { name: string; externalId?: string };
  headline: string;
  startAt?: Date;
  geometry?: unknown;
}): string {
  const external = event.source.externalId?.trim();
  if (external) {
    const input = `${event.source.name}:${external}`;
    const hash = createHash("sha256").update(input).digest("hex").slice(0, 32);
    return `sha256:${hash}`;
  }
  const payload = [
    event.source.name,
    event.headline.slice(0, 200),
    event.startAt?.toISOString() ?? "",
    event.geometry ? JSON.stringify(event.geometry) : "",
  ].join("|");
  const hash = createHash("sha256").update(payload).digest("hex").slice(0, 32);
  return `sha256:${hash}`;
}

export function stableDedupeKey(event: NormalizedAlertEvent): string {
  return createDedupeKey({
    source: event.source,
    headline: event.headline,
    startAt: event.startAt,
    geometry: event.geometry,
  });
}
