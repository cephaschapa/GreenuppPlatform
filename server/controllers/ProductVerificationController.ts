import { Request, Response } from "express";
import { ProductVerificationModel } from "../../docs/ProductVerificationModel.js";
import { scanTrackingService } from "../services/scanTrackingService.js";
import { trustScoringService } from "../services/trustScoringService.js";

export class ProductVerificationController {
  // Verify a batch ID (internal verification endpoint)
  static async verifyBatch(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { batchId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!batchId) {
        return res.status(400).json({ message: "Batch ID is required" });
      }

      // Get the crop associated with this batch ID
      const crop = await ProductVerificationModel.getCropByBatchId(batchId);
      if (!crop) {
        return res
          .status(404)
          .json({ message: "No crop found with this batch ID" });
      }

      // Check if the crop belongs to the user
      if (crop.userId !== userId) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Verify the batch traceability
      const verificationResult =
        await ProductVerificationModel.verifyBatchTraceability(batchId);

      res.status(200).json(verificationResult);
    } catch (error) {
      console.error("Error verifying batch:", error);
      res.status(500).json({ message: "Failed to verify batch" });
    }
  }

  // Public verification endpoint (no authentication required)
  static async verifyBatchPublic(req: Request, res: Response) {
    try {
      const { batchId } = req.params;

      if (!batchId) {
        return res.status(400).json({ message: "Batch ID is required" });
      }

      // Get the crop associated with this batch ID
      const crop = await ProductVerificationModel.getCropByBatchId(batchId);
      if (!crop) {
        return res
          .status(404)
          .json({ message: "No crop found with this batch ID" });
      }

      // Record the scan event for analytics
      try {
        await scanTrackingService.recordScan({
          batchId,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get("user-agent"),
          referrer: req.get("referer"),
          scanSource: req.get("user-agent")?.includes("Mobile")
            ? "mobile"
            : "web",
        });
      } catch (scanError) {
        // Don't fail verification if scan tracking fails
        console.error("Failed to record scan:", scanError);
      }

      // Verify the batch traceability
      const verificationResult =
        await ProductVerificationModel.verifyBatchTraceability(batchId);

      res.status(200).json(verificationResult);
    } catch (error) {
      console.error("Error verifying batch:", error);
      res.status(500).json({ message: "Failed to verify batch" });
    }
  }

  // Get all scannable products for a user
  static async getScannableProducts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const scannableProducts =
        await ProductVerificationModel.getScannableProducts(userId);

      res.status(200).json(scannableProducts);
    } catch (error) {
      console.error("Error getting scannable products:", error);
      res.status(500).json({ message: "Failed to get scannable products" });
    }
  }

  // Get scannable crops for a user
  static async getScannableCrops(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const crops = await ProductVerificationModel.getScannableCrops(userId);

      res.status(200).json(crops);
    } catch (error) {
      console.error("Error getting scannable crops:", error);
      res.status(500).json({ message: "Failed to get scannable crops" });
    }
  }

  // Get scannable listings for a user
  static async getScannableListings(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const listings = await ProductVerificationModel.getScannableListings(
        userId
      );

      res.status(200).json(listings);
    } catch (error) {
      console.error("Error getting scannable listings:", error);
      res.status(500).json({ message: "Failed to get scannable listings" });
    }
  }

  // Get crop traceability history
  static async getCropTraceabilityHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const cropId = parseInt(req.params.cropId);

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }

      // Get the crop to check ownership
      const crop = await ProductVerificationModel.getCropWithField(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== userId) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Get the traceability history
      const history = await ProductVerificationModel.getCropTraceabilityHistory(
        cropId
      );

      res.status(200).json(history);
    } catch (error) {
      console.error("Error getting crop traceability history:", error);
      res
        .status(500)
        .json({ message: "Failed to get crop traceability history" });
    }
  }

  // Get scan analytics for a crop
  static async getCropScanAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const cropId = parseInt(req.params.cropId);

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }

      // Get the crop to check ownership
      const crop = await ProductVerificationModel.getCropWithField(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== userId) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      // Get scan analytics
      const analytics = await scanTrackingService.getCropScanAnalytics(cropId);

      res.status(200).json(analytics);
    } catch (error) {
      console.error("Error getting scan analytics:", error);
      res.status(500).json({ message: "Failed to get scan analytics" });
    }
  }

  // Get user's top scanned products
  static async getTopScannedProducts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const topProducts = await scanTrackingService.getUserTopScannedProducts(
        userId,
        limit
      );

      res.status(200).json(topProducts);
    } catch (error) {
      console.error("Error getting top scanned products:", error);
      res.status(500).json({ message: "Failed to get top scanned products" });
    }
  }

  // Get farmer trust score
  static async getFarmerTrustScore(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const trustScore = await trustScoringService.calculateFarmerTrustScore(
        userId
      );

      res.status(200).json(trustScore);
    } catch (error) {
      console.error("Error getting trust score:", error);
      res.status(500).json({ message: "Failed to get trust score" });
    }
  }

  // Get product trust score
  static async getProductTrustScore(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const cropId = parseInt(req.params.cropId);

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }

      // Get the crop to check ownership
      const crop = await ProductVerificationModel.getCropWithField(cropId);
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }

      if (crop.userId !== userId) {
        return res.status(403).json({ message: "You do not own this crop" });
      }

      const trustScore = await trustScoringService.calculateProductTrustScore(
        cropId
      );

      res.status(200).json(trustScore);
    } catch (error) {
      console.error("Error getting product trust score:", error);
      res.status(500).json({ message: "Failed to get product trust score" });
    }
  }

  // Get scan analytics by batch ID (for marketplace listings)
  static async getBatchScanAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { batchId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (!batchId) {
        return res.status(400).json({ message: "Batch ID required" });
      }

      // Get scan analytics
      const analytics = await scanTrackingService.getBatchScanAnalytics(
        batchId
      );

      res.status(200).json(analytics);
    } catch (error) {
      console.error("Error getting batch scan analytics:", error);
      res.status(500).json({ message: "Failed to get scan analytics" });
    }
  }
}
