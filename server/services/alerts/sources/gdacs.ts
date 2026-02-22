/**
 * GDACS (Global Disaster Alert and Coordination System) feed client.
 * Uses official RSS/Atom feed; no scraping. Source: https://www.gdacs.org/
 * Zambia-relevant events: floods (FL), tropical cyclones (TC), droughts (DR).
 */

import { logger } from "../../../lib/logger.js";
import type { RawGdacsEvent } from "../types.js";

const GDACS_RSS_URL = process.env.GDACS_RSS_URL ?? "https://www.gdacs.org/gdacsapi/xml/rss.xml";
const FETCH_TIMEOUT_MS = 15000;

/** Extract text content from an XML tag (handles namespaced tags). */
function extractTag(xml: string, tagName: string): string | undefined {
  const namespaced = [`gdacs:${tagName}`, `georss:${tagName}`, tagName];
  for (const name of namespaced) {
    const open = `<${name}>`;
    const close = `</${name}>`;
    const start = xml.indexOf(open);
    if (start === -1) continue;
    const end = xml.indexOf(close, start);
    if (end === -1) continue;
    return xml.slice(start + open.length, end).trim();
  }
  return undefined;
}

/** Parse RSS/Atom item into a flat object for normalizer. */
function parseItem(xml: string): RawGdacsEvent | null {
  const title = extractTag(xml, "title") ?? extractTag(xml, "summary");
  if (!title) return null;
  const link = extractTag(xml, "link");
  const description = extractTag(xml, "description") ?? extractTag(xml, "content");
  const pubDate = extractTag(xml, "published") ?? extractTag(xml, "updated") ?? extractTag(xml, "pubDate");
  const guid = extractTag(xml, "id") ?? extractTag(xml, "guid");
  const eventtype = extractTag(xml, "eventtype");
  const eventid = extractTag(xml, "eventid");
  const country = extractTag(xml, "country");
  const fromdate = extractTag(xml, "fromdate");
  const todate = extractTag(xml, "todate");
  const severity = extractTag(xml, "severity");
  const episodeid = extractTag(xml, "episodeid");
  const point = extractTag(xml, "point");

  return {
    title,
    link: link ?? undefined,
    description: description ?? undefined,
    pubDate: pubDate ?? undefined,
    guid: guid ?? undefined,
    "gdacs:eventtype": eventtype ?? undefined,
    "gdacs:eventid": eventid ?? undefined,
    "gdacs:country": country ?? undefined,
    "gdacs:fromdate": fromdate ?? undefined,
    "gdacs:todate": todate ?? undefined,
    "gdacs:severity": severity ?? undefined,
    "gdacs:episodeid": episodeid ?? undefined,
    "georss:point": point ?? undefined,
  };
}

/** Split XML into <item> or <entry> blocks. */
function splitItems(xml: string): string[] {
  const items: string[] = [];
  const re = /<(?:item|entry)\s*[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);
  return items;
}

export interface GdacsFetchResult {
  sourceUrl: string;
  events: RawGdacsEvent[];
  fetchedAt: Date;
  error?: string;
}

/**
 * Fetch GDACS RSS feed and return raw events (Zambia filter optional; normalizer can filter).
 */
export async function fetchGdacsFeed(): Promise<GdacsFetchResult> {
  const sourceUrl = GDACS_RSS_URL;
  const fetchedAt = new Date();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(sourceUrl, {
      signal: controller.signal,
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { sourceUrl, events: [], fetchedAt, error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    const items = splitItems(text);
    const events: RawGdacsEvent[] = [];
    for (const block of items) {
      const ev = parseItem(block);
      if (ev) events.push(ev);
    }
    logger.info({ sourceName: "GDACS", count: events.length, sourceUrl }, "alerts: GDACS fetch");
    return { sourceUrl, events, fetchedAt };
  } catch (err: any) {
    const message = err?.message ?? String(err);
    logger.warn({ sourceName: "GDACS", error: message, sourceUrl }, "alerts: GDACS fetch failed");
    return { sourceUrl, events: [], fetchedAt, error: message };
  }
}
