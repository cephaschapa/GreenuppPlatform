/**
 * ReliefWeb API client for disaster/hazard reports.
 * Public API: https://reliefweb.int/docs/api
 * Zambia filter applied; no scraping.
 */

import { logger } from "../../../lib/logger.js";
import type { RawReliefWebReport } from "../types.js";

const RELIEFWEB_API_URL = "https://api.reliefweb.int/v1/reports";
const FETCH_TIMEOUT_MS = 15000;

export interface ReliefWebFetchResult {
  sourceUrl: string;
  reports: RawReliefWebReport[];
  fetchedAt: Date;
  error?: string;
}

/**
 * Fetch ReliefWeb reports for Zambia.
 * Uses app name in User-Agent as per API guidelines.
 */
export async function fetchReliefWebReports(): Promise<ReliefWebFetchResult> {
  const fetchedAt = new Date();
  const params = new URLSearchParams({
    "filter[field]": "country.iso3",
    "filter[value]": "ZMB",
    "limit": "20",
    "fields[include][]": "title,body,date.created,url,country,primary_country,theme",
    "sort[]": "date:desc",
  });
  const url = `${RELIEFWEB_API_URL}?${params.toString()}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": process.env.RELIEFWEB_USER_AGENT ?? "GreenUpp/1.0 (Zambia farmer alerts)",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { sourceUrl: url, reports: [], fetchedAt, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const reports: RawReliefWebReport[] = (data.data ?? []).map((d: { fields?: RawReliefWebReport }) => d.fields ?? d);
    logger.info({ sourceName: "ReliefWeb", count: reports.length, sourceUrl: url }, "alerts: ReliefWeb fetch");
    return { sourceUrl: url, reports, fetchedAt };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn({ sourceName: "ReliefWeb", error: message, sourceUrl: url }, "alerts: ReliefWeb fetch failed");
    return { sourceUrl: url, reports: [], fetchedAt, error: message };
  }
}
