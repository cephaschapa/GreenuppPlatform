import { Router } from "express";
import { db } from "../db";
import { eq, sql, desc } from "drizzle-orm";
import { marketplaceListings } from "@shared/schema";

const router = Router();

// Get all sellers with their stats (users with role supplier or farmer)
router.get("/", async (req, res) => {
  try {
    // Get sellers with aggregated data
    const sellersWithStats = await db.execute(sql`
      SELECT 
        u.id,
        u.username,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.email,
        u.role,
        u.profile_image AS "profileImageUrl",
        fp.bio,
        NULL AS location,
        u.created_at AS "createdAt",
        u.updated_at AS "updatedAt",
        COUNT(DISTINCT CASE WHEN ml.status = 'active' THEN ml.id END) AS "listingCount",
        AVG(mr.rating) AS "averageRating",
        COUNT(DISTINCT mr.id) AS "reviewCount"
      FROM users u
      LEFT JOIN marketplace_listings ml ON u.id = ml.seller_id
      LEFT JOIN marketplace_reviews mr ON u.id = mr.seller_id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.role IN ('farmer', 'supplier')
      GROUP BY u.id, fp.bio
      ORDER BY AVG(mr.rating) DESC NULLS LAST
    `);

    res.json(sellersWithStats.rows);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Failed to fetch sellers" });
  }
});

// Get a specific seller by ID with their stats
router.get("/:id", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.id);

    if (isNaN(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    // Get seller with aggregated data
    const sellerWithStats = await db.execute(sql`
      SELECT 
        u.id,
        u.username,
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.email,
        u.role,
        u.profile_image AS "profileImageUrl",
        fp.bio,
        fp.contact_phone AS "phoneNumber",
        NULL AS website,
        fp.main_crops AS "specialties",
        NULL AS certificates,
        NULL AS location,
        u.created_at AS "createdAt",
        u.updated_at AS "updatedAt",
        COUNT(DISTINCT CASE WHEN ml.status = 'active' THEN ml.id END) AS "listingCount",
        AVG(mr.rating) AS "averageRating",
        COUNT(DISTINCT mr.id) AS "reviewCount"
      FROM users u
      LEFT JOIN marketplace_listings ml ON u.id = ml.seller_id
      LEFT JOIN marketplace_reviews mr ON u.id = mr.seller_id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.id = ${sellerId}
      GROUP BY u.id, fp.bio, fp.contact_phone, fp.main_crops
    `);

    const rows = sellerWithStats.rows;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching seller:", error);
    res.status(500).json({ message: "Failed to fetch seller details" });
  }
});

// Get all listings for a specific seller
router.get("/:id/listings", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.id);

    if (isNaN(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    const listings = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, sellerId))
      .orderBy(desc(marketplaceListings.createdAt));

    res.json(listings);
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    res.status(500).json({ message: "Failed to fetch seller listings" });
  }
});

export default router;
