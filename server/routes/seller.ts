import { Router } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { 
  eq, 
  sql,
  desc,
  count
} from "drizzle-orm";
import { 
  users, 
  marketplaceListings, 
  marketplaceReviews,
  locations,
  farmerProfiles
} from "@shared/schema";

const router = Router();

// Get all sellers with their stats
router.get("/api/marketplace/sellers", async (req, res) => {
  try {
    // Get sellers (users with role supplier or farmer) with aggregated data
    const sellersWithStats = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        profileImageUrl: users.profileImage,
        bio: sql<string>`
          COALESCE((SELECT ${farmerProfiles.bio} FROM ${farmerProfiles} 
          WHERE ${farmerProfiles.userId} = ${users.id}), 'No bio available')
        `.as('bio'),
        location: sql<any>`json_build_object(
          'city', ${locations.city},
          'country', ${locations.country},
          'latitude', ${locations.latitude},
          'longitude', ${locations.longitude},
          'h3Index', ${locations.h3Index8}
        )`.as('location'),
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        // Count active listings for each seller
        listingCount: sql<number>`
          COUNT(DISTINCT CASE WHEN ${marketplaceListings.status} = 'active' THEN ${marketplaceListings.id} END)
        `.as('listingCount'),
        // Calculate average rating
        averageRating: sql<number>`
          AVG(CASE WHEN ${marketplaceReviews.id} IS NOT NULL THEN ${marketplaceReviews.rating} END)
        `.as('averageRating'),
        // Count number of reviews
        reviewCount: sql<number>`
          COUNT(DISTINCT ${marketplaceReviews.id})
        `.as('reviewCount')
      })
      .from(users)
      .leftJoin(
        marketplaceListings,
        eq(users.id, marketplaceListings.sellerId)
      )
      .leftJoin(
        marketplaceReviews,
        eq(users.id, marketplaceReviews.sellerId)
      )
      .leftJoin(
        locations,
        eq(users.id, locations.userId)
      )
      .where(sql`${users.role} IN ('farmer', 'supplier')`)
      .groupBy(users.id, locations.id)
      .orderBy(desc(sql`AVG(CASE WHEN ${marketplaceReviews.id} IS NOT NULL THEN ${marketplaceReviews.rating} END)`));

    res.json(sellersWithStats);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Failed to fetch sellers" });
  }
});

// Get a specific seller by ID with their stats
router.get("/api/marketplace/sellers/:id", async (req, res) => {
  try {
    const sellerId = parseInt(req.params.id);
    
    if (isNaN(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    // Get seller with aggregated data
    const sellerWithStats = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        profileImageUrl: users.profileImage,
        bio: sql<string>`
          COALESCE((SELECT ${farmerProfiles.bio} FROM ${farmerProfiles} 
          WHERE ${farmerProfiles.userId} = ${users.id}), 'No bio available')
        `.as('bio'),
        phoneNumber: sql<string>`
          COALESCE((SELECT ${farmerProfiles.contactPhone} FROM ${farmerProfiles} 
          WHERE ${farmerProfiles.userId} = ${users.id}), NULL)
        `.as('phoneNumber'),
        website: sql<string>`NULL`.as('website'),
        specialties: sql<string[]>`
          COALESCE((SELECT ${farmerProfiles.mainCrops} FROM ${farmerProfiles} 
          WHERE ${farmerProfiles.userId} = ${users.id}), NULL)
        `.as('specialties'),
        certificates: sql<string[]>`NULL`.as('certificates'),
        location: sql<any>`json_build_object(
          'id', ${locations.id},
          'address', ${locations.formattedAddress},
          'city', ${locations.city},
          'state', ${locations.region},
          'country', ${locations.country},
          'postalCode', ${locations.postalCode},
          'latitude', ${locations.latitude},
          'longitude', ${locations.longitude},
          'h3Index', ${locations.h3Index8}
        )`.as('location'),
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        // Count active listings for the seller
        listingCount: sql<number>`
          COUNT(DISTINCT CASE WHEN ${marketplaceListings.status} = 'active' THEN ${marketplaceListings.id} END)
        `.as('listingCount'),
        // Calculate average rating
        averageRating: sql<number>`
          AVG(CASE WHEN ${marketplaceReviews.id} IS NOT NULL THEN ${marketplaceReviews.rating} END)
        `.as('averageRating'),
        // Count number of reviews
        reviewCount: sql<number>`
          COUNT(DISTINCT ${marketplaceReviews.id})
        `.as('reviewCount')
      })
      .from(users)
      .leftJoin(
        marketplaceListings,
        eq(users.id, marketplaceListings.sellerId)
      )
      .leftJoin(
        marketplaceReviews,
        eq(users.id, marketplaceReviews.sellerId)
      )
      .leftJoin(
        locations,
        eq(users.id, locations.userId)
      )
      .where(eq(users.id, sellerId))
      .groupBy(users.id, locations.id);

    if (sellerWithStats.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.json(sellerWithStats[0]);
  } catch (error) {
    console.error("Error fetching seller:", error);
    res.status(500).json({ message: "Failed to fetch seller details" });
  }
});

// Get all listings for a specific seller
router.get("/api/marketplace/sellers/:id/listings", async (req, res) => {
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