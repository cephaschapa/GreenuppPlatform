import express from 'express';
import { cropTraceService } from '../services/croptrace';
import type { Request, Response, NextFunction } from "express";
import { db } from '../db';
import { crops, cropTraceEvents, marketplaceListings } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Middleware to check authentication
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// Initialize traceability for a crop
router.post('/crops/:cropId/trace/initialize', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const cropId = parseInt(req.params.cropId);
    if (isNaN(cropId)) {
      return res.status(400).json({ message: 'Invalid crop ID' });
    }
    
    // Check if the crop belongs to the user
    const [crop] = await db.select()
      .from(crops)
      .where(eq(crops.id, cropId));
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    if (crop.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this crop' });
    }
    
    // Initialize traceability
    const result = await cropTraceService.initializeCropTraceability(cropId, req.body);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error initializing crop traceability:', error);
    res.status(500).json({ message: 'Failed to initialize crop traceability' });
  }
});

// Record a crop event
router.post('/crops/:cropId/trace/events', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const cropId = parseInt(req.params.cropId);
    if (isNaN(cropId)) {
      return res.status(400).json({ message: 'Invalid crop ID' });
    }
    
    // Check if the crop belongs to the user
    const [crop] = await db.select()
      .from(crops)
      .where(eq(crops.id, cropId));
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    if (crop.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this crop' });
    }
    
    // Validate required fields
    const { eventType, description } = req.body;
    if (!eventType || !description) {
      return res.status(400).json({ message: 'Event type and description are required' });
    }
    
    // Record the event
    const result = await cropTraceService.recordCropEvent(
      cropId,
      eventType,
      req.body,
      req.user.id
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error recording crop event:', error);
    res.status(500).json({ message: 'Failed to record crop event' });
  }
});

// Link a marketplace listing to a crop
router.post('/marketplace/listings/:listingId/trace', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { cropId } = req.body;
    
    if (isNaN(listingId) || !cropId || isNaN(parseInt(cropId))) {
      return res.status(400).json({ message: 'Invalid listing ID or crop ID' });
    }
    
    // Check if the listing belongs to the user
    const [listing] = await db.select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, listingId));
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this listing' });
    }
    
    // Check if the crop belongs to the user
    const [crop] = await db.select()
      .from(crops)
      .where(eq(crops.id, parseInt(cropId)));
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    if (crop.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this crop' });
    }
    
    // Link the listing to the crop
    const result = await cropTraceService.linkListingToCrop(listingId, parseInt(cropId));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error linking listing to crop:', error);
    res.status(500).json({ message: 'Failed to link listing to crop' });
  }
});

// Get crop traceability history
router.get('/crops/:cropId/trace/history', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const cropId = parseInt(req.params.cropId);
    if (isNaN(cropId)) {
      return res.status(400).json({ message: 'Invalid crop ID' });
    }
    
    // Check if the crop belongs to the user
    const [crop] = await db.select()
      .from(crops)
      .where(eq(crops.id, cropId));
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    if (crop.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this crop' });
    }
    
    // Get the traceability history
    const history = await cropTraceService.getCropTraceabilityHistory(cropId);
    
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting crop traceability history:', error);
    res.status(500).json({ message: 'Failed to get crop traceability history' });
  }
});

// Get crop events
router.get('/crops/:cropId/trace/events', isAuthenticated, async (req: Request & { user?: any }, res: Response) => {
  try {
    const cropId = parseInt(req.params.cropId);
    if (isNaN(cropId)) {
      return res.status(400).json({ message: 'Invalid crop ID' });
    }
    
    // Check if the crop belongs to the user
    const [crop] = await db.select()
      .from(crops)
      .where(eq(crops.id, cropId));
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    if (crop.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this crop' });
    }
    
    // Get the events
    const events = await db.select()
      .from(cropTraceEvents)
      .where(eq(cropTraceEvents.cropId, cropId))
      .orderBy(cropTraceEvents.eventDate);
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting crop events:', error);
    res.status(500).json({ message: 'Failed to get crop events' });
  }
});

// Public route to verify a crop batch
router.get('/trace/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is required' });
    }
    
    // Verify the batch
    const result = await cropTraceService.verifyBatchTraceability(batchId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error verifying batch:', error);
    res.status(500).json({ message: 'Failed to verify batch' });
  }
});

export default router;