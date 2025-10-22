/**
 * QR Code Scan Tracking Service
 * Tracks scans for analytics and consumer engagement metrics
 */

import { db } from "../db.js";
import { crops, qrScanEvents } from "@shared/schema";
import { eq, desc, and, gte, count, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";

export interface ScanEventData {
  batchId: string;
  ipAddress?: string;
  userAgent?: string;
  locationLat?: number;
  locationLon?: number;
  locationCity?: string;
  locationCountry?: string;
  referrer?: string;
  scanSource?: "web" | "mobile" | "app";
}

export interface ScanAnalytics {
  totalScans: number;
  firstScan?: Date;
  lastScan?: Date;
  scansLast7Days: number;
  scansLast30Days: number;
  uniqueLocations: number;
  scansByCountry: Array<{ country: string; count: number }>;
  scansBySource: Array<{ source: string; count: number }>;
  recentScans: Array<{
    scannedAt: Date;
    location?: string;
    source: string;
  }>;
}

export class ScanTrackingService {
  /**
   * Record a QR code scan event
   */
  async recordScan(eventData: ScanEventData): Promise<void> {
    try {
      // Find the crop by batch ID
      const [crop] = await db
        .select()
        .from(crops)
        .where(eq(crops.batchId, eventData.batchId))
        .limit(1);

      if (!crop) {
        logger.warn(`Scan recorded for unknown batch ID: ${eventData.batchId}`);
        // Still record the scan attempt for security monitoring
        await db.insert(qrScanEvents).values({
          batchId: eventData.batchId,
          cropId: null,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          locationLat: eventData.locationLat,
          locationLon: eventData.locationLon,
          locationCity: eventData.locationCity,
          locationCountry: eventData.locationCountry,
          referrer: eventData.referrer,
          scanSource: eventData.scanSource || "web",
          verificationResult: false, // Invalid batch ID
        });
        return;
      }

      // Record the scan event
      await db.insert(qrScanEvents).values({
        batchId: eventData.batchId,
        cropId: crop.id,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent,
        locationLat: eventData.locationLat,
        locationLon: eventData.locationLon,
        locationCity: eventData.locationCity,
        locationCountry: eventData.locationCountry,
        referrer: eventData.referrer,
        scanSource: eventData.scanSource || "web",
        verificationResult: true,
      });

      // Update crop scan counters
      const currentCount = crop.qrScanCount || 0;
      const firstScan = crop.firstScannedAt || new Date();

      await db
        .update(crops)
        .set({
          qrScanCount: currentCount + 1,
          lastScannedAt: new Date(),
          firstScannedAt: firstScan,
        })
        .where(eq(crops.id, crop.id));

      logger.info(
        `Scan recorded for batch ${eventData.batchId} (crop ${
          crop.id
        }), total scans: ${currentCount + 1}`
      );
    } catch (error) {
      logger.error("Error recording scan:", error);
      throw error;
    }
  }

  /**
   * Get scan analytics for a specific crop
   */
  async getCropScanAnalytics(cropId: number): Promise<ScanAnalytics> {
    try {
      // Get the crop
      const [crop] = await db
        .select()
        .from(crops)
        .where(eq(crops.id, cropId))
        .limit(1);

      if (!crop) {
        throw new Error("Crop not found");
      }

      // Get all scan events for this crop
      const scanEvents = await db
        .select()
        .from(qrScanEvents)
        .where(eq(qrScanEvents.cropId, cropId))
        .orderBy(desc(qrScanEvents.scannedAt));

      // Calculate analytics
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const scansLast7Days = scanEvents.filter(
        (scan) => new Date(scan.scannedAt) >= sevenDaysAgo
      ).length;

      const scansLast30Days = scanEvents.filter(
        (scan) => new Date(scan.scannedAt) >= thirtyDaysAgo
      ).length;

      // Get unique locations
      const uniqueCountries = new Set(
        scanEvents
          .map((scan) => scan.locationCountry)
          .filter((country): country is string => !!country)
      );

      // Get scans by country
      const countryMap = new Map<string, number>();
      scanEvents.forEach((scan) => {
        if (scan.locationCountry) {
          countryMap.set(
            scan.locationCountry,
            (countryMap.get(scan.locationCountry) || 0) + 1
          );
        }
      });

      const scansByCountry = Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      // Get scans by source
      const sourceMap = new Map<string, number>();
      scanEvents.forEach((scan) => {
        const source = scan.scanSource || "web";
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });

      const scansBySource = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      // Get recent scans (last 10)
      const recentScans = scanEvents.slice(0, 10).map((scan) => ({
        scannedAt: scan.scannedAt,
        location: scan.locationCity
          ? `${scan.locationCity}, ${scan.locationCountry}`
          : scan.locationCountry || "Unknown",
        source: scan.scanSource || "web",
      }));

      return {
        totalScans: crop.qrScanCount || 0,
        firstScan: crop.firstScannedAt || undefined,
        lastScan: crop.lastScannedAt || undefined,
        scansLast7Days,
        scansLast30Days,
        uniqueLocations: uniqueCountries.size,
        scansByCountry,
        scansBySource,
        recentScans,
      };
    } catch (error) {
      logger.error(`Error getting scan analytics for crop ${cropId}:`, error);
      throw error;
    }
  }

  /**
   * Get scan analytics by batch ID
   */
  async getBatchScanAnalytics(batchId: string): Promise<ScanAnalytics> {
    const [crop] = await db
      .select()
      .from(crops)
      .where(eq(crops.batchId, batchId))
      .limit(1);

    if (!crop) {
      throw new Error("Crop not found");
    }

    return this.getCropScanAnalytics(crop.id);
  }

  /**
   * Get top scanned products for a user
   */
  async getUserTopScannedProducts(userId: number, limit: number = 10) {
    try {
      const userCrops = await db
        .select()
        .from(crops)
        .where(eq(crops.userId, userId))
        .where(sql`${crops.qrScanCount} > 0`)
        .orderBy(desc(crops.qrScanCount))
        .limit(limit);

      return userCrops.map((crop) => ({
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
        batchId: crop.batchId,
        scanCount: crop.qrScanCount,
        lastScanned: crop.lastScannedAt,
        firstScanned: crop.firstScannedAt,
      }));
    } catch (error) {
      logger.error(
        `Error getting top scanned products for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get scan trends over time for a crop
   */
  async getCropScanTrends(
    cropId: number,
    days: number = 30
  ): Promise<Array<{ date: string; scans: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const scanEvents = await db
        .select()
        .from(qrScanEvents)
        .where(
          and(
            eq(qrScanEvents.cropId, cropId),
            gte(qrScanEvents.scannedAt, startDate)
          )
        )
        .orderBy(qrScanEvents.scannedAt);

      // Group by date
      const dateMap = new Map<string, number>();
      scanEvents.forEach((scan) => {
        const date = new Date(scan.scannedAt).toISOString().split("T")[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      });

      return Array.from(dateMap.entries())
        .map(([date, scans]) => ({ date, scans }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logger.error(`Error getting scan trends for crop ${cropId}:`, error);
      throw error;
    }
  }
}

export const scanTrackingService = new ScanTrackingService();
