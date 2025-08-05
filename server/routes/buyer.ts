import { Router } from "express";
import { eq, desc, sql, and, or, gte, lte, count, avg } from "drizzle-orm";
import { db } from "../db.js";
import {
  users,
  marketplaceListings,
  orders,
  orderItems,
  marketplaceReviews,
  marketplaceFavorites,
} from "@shared/schema";
import {
  userRelationships,
  socialProfiles,
} from "@shared/green-socials-schema";
import { isAuthenticated } from "../middleware/auth.js";
import { logger } from "../utils/logger.js";

const router = Router();

// GET /api/buyer/stats
// Get buyer statistics for dashboard
router.get("/stats", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const buyerId = req.user.id;
    const currentMonth = new Date();
    currentMonth.setDate(1); // Start of current month
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get total orders
    const [totalOrdersResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.userId, buyerId));

    // Get total spent
    const [totalSpentResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.userId, buyerId));

    // Get monthly spending
    const [monthlySpendingResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(eq(orders.userId, buyerId), gte(orders.createdAt, currentMonth))
      );

    // Get last month spending for comparison
    const [lastMonthSpendingResult] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.userId, buyerId),
          gte(orders.createdAt, lastMonth),
          lte(orders.createdAt, currentMonth)
        )
      );

    // Get favorite products count
    const [favoriteProductsResult] = await db
      .select({ count: count() })
      .from(marketplaceFavorites)
      .where(eq(marketplaceFavorites.userId, buyerId));

    // Get followed sellers count
    const [followedSellersResult] = await db
      .select({ count: count() })
      .from(userRelationships)
      .where(eq(userRelationships.followerId, buyerId));

    // Get reviews written count
    const [reviewsWrittenResult] = await db
      .select({ count: count() })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.reviewerId, buyerId));

    // Calculate average order value
    const [avgOrderValueResult] = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.userId, buyerId));

    // Calculate savings (difference between original prices and paid prices)
    // This is a simplified calculation - in reality you'd track actual discounts
    const currentSpending = monthlySpendingResult.total || 0;
    const lastMonthSpending = lastMonthSpendingResult.total || 0;
    const savingsThisMonth =
      Math.max(0, lastMonthSpending - currentSpending) * 0.15; // Assume 15% savings

    const stats = {
      totalOrders: totalOrdersResult.count || 0,
      totalSpent: Number(totalSpentResult.total || 0),
      favoriteProducts: favoriteProductsResult.count || 0,
      followedSellers: followedSellersResult.count || 0,
      reviewsWritten: reviewsWrittenResult.count || 0,
      averageOrderValue: Number(avgOrderValueResult.avg || 0),
      monthlySpending: Number(currentSpending),
      savingsThisMonth: Number(savingsThisMonth),
    };

    res.json(stats);
  } catch (error) {
    logger.error("Error fetching buyer stats:", error);
    res.status(500).json({ message: "Failed to fetch buyer statistics" });
  }
});

// GET /api/buyer/recent-orders
// Get recent orders for the buyer
router.get("/recent-orders", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const buyerId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent orders with seller information
    const recentOrders = await db
      .select({
        id: orders.id,
        sellerId: orders.sellerId,
        sellerName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.username})`,
        sellerAvatar: users.profileImage,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        estimatedDelivery: orders.estimatedDeliveryDate,
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.sellerId))
      .where(eq(orders.userId, buyerId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      recentOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            listingId: orderItems.listingId,
            name: marketplaceListings.title,
            quantity: orderItems.quantity,
            price: orderItems.unitPrice,
            image: sql<string>`${marketplaceListings.images}[1]`,
          })
          .from(orderItems)
          .innerJoin(
            marketplaceListings,
            eq(marketplaceListings.id, orderItems.listingId)
          )
          .where(eq(orderItems.orderId, order.id));

        return {
          id: order.id,
          sellerId: order.sellerId,
          sellerName: order.sellerName,
          sellerAvatar: order.sellerAvatar,
          items: items,
          total: order.totalAmount,
          status: order.status,
          orderDate: order?.createdAt!.toISOString(),
          estimatedDelivery: order.estimatedDelivery?.toISOString(),
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    logger.error("Error fetching recent orders:", error);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
});

// GET /api/buyer/favorite-sellers
// Get sellers that the buyer follows
router.get("/favorite-sellers", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const buyerId = req.user.id;

    // Get followed sellers with their information
    const favoriteSellers = await db
      .select({
        id: users.id,
        name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.username})`,
        username: users.username,
        avatar: users.profileImage,
        location: sql<string>`COALESCE(${socialProfiles.location}, 'Unknown')`,
        rating: sql<number>`COALESCE(${marketplaceListings.sellerRating}, 0)`,
        reviewCount: sql<number>`COALESCE(${marketplaceListings.sellerReviewCount}, 0)`,
        specialties: sql<
          string[]
        >`COALESCE(${socialProfiles.specializations}, ARRAY[]::text[])`,
        followedAt: userRelationships.createdAt,
      })
      .from(userRelationships)
      .innerJoin(users, eq(users.id, userRelationships.followedId))
      .leftJoin(socialProfiles, eq(socialProfiles.userId, users.id))
      .leftJoin(marketplaceListings, eq(marketplaceListings.sellerId, users.id))
      .where(eq(userRelationships.followerId, buyerId))
      .groupBy(
        users.id,
        users.username,
        users.firstName,
        users.lastName,
        users.profileImage,
        socialProfiles.location,
        socialProfiles.specializations,
        userRelationships.createdAt
      )
      .orderBy(desc(userRelationships.createdAt));

    // Get new products count for each seller (products added in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sellersWithNewProducts = await Promise.all(
      favoriteSellers.map(async (seller) => {
        const [newProductsResult] = await db
          .select({ count: count() })
          .from(marketplaceListings)
          .where(
            and(
              eq(marketplaceListings.sellerId, seller.id),
              gte(marketplaceListings.createdAt, sevenDaysAgo)
            )
          );

        return {
          id: seller.id,
          name: seller.name,
          username: seller.username,
          avatar: seller.avatar,
          location: seller.location,
          rating: seller.rating || 0,
          reviewCount: seller.reviewCount || 0,
          specialties: seller.specialties || [],
          isFollowing: true,
          newProductsCount: newProductsResult.count || 0,
          lastActive: seller.followedAt.toISOString(),
        };
      })
    );

    res.json(sellersWithNewProducts);
  } catch (error) {
    logger.error("Error fetching favorite sellers:", error);
    res.status(500).json({ message: "Failed to fetch favorite sellers" });
  }
});

// GET /api/buyer/recommendations
// Get personalized product recommendations
router.get("/recommendations", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const buyerId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 8;

    // Get user's purchase history to understand preferences
    const purchaseHistory = await db
      .select({
        category: marketplaceListings.category,
        count: count(),
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(
        marketplaceListings,
        eq(marketplaceListings.id, orderItems.listingId)
      )
      .where(eq(orders.userId, buyerId))
      .groupBy(marketplaceListings.category)
      .orderBy(desc(count()))
      .limit(3);

    const preferredCategories = purchaseHistory.map((p) => p.category);

    // Get recommended products based on:
    // 1. Categories the user has purchased before
    // 2. High-rated products
    // 3. Products from followed sellers
    // 4. Seasonal/fresh products
    const recommendations = await db
      .select({
        id: marketplaceListings.id,
        name: marketplaceListings.title,
        sellerId: marketplaceListings.sellerId,
        sellerName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.username})`,
        price: marketplaceListings.price,
        originalPrice: sql<number>`NULL`,
        image: sql<string>`${marketplaceListings.images}[1]`,
        rating: sql<number>`COALESCE(AVG(${marketplaceReviews.rating}), 0)`,
        reviewCount: sql<number>`COUNT(${marketplaceReviews.id})`,
        category: marketplaceListings.category,
        freshness: sql<string>`'fresh'`,
        organic: marketplaceListings.organicCertified,
        inSeason: sql<boolean>`EXTRACT(MONTH FROM NOW()) BETWEEN 1 AND 12`, // Simplified seasonal logic
        isFromFollowedSeller: sql<boolean>`EXISTS(
          SELECT 1 FROM ${userRelationships} ur 
          WHERE ur.follower_id = ${buyerId} 
          AND ur.followed_id = ${marketplaceListings.sellerId}
        )`,
      })
      .from(marketplaceListings)
      .innerJoin(users, eq(users.id, marketplaceListings.sellerId))
      .leftJoin(
        marketplaceReviews,
        eq(marketplaceReviews.listingId, marketplaceListings.id)
      )
      .where(
        and(
          eq(marketplaceListings.status, "active"),
          or(
            ...(preferredCategories.length > 0
              ? preferredCategories.map((cat) =>
                  eq(marketplaceListings.category, cat)
                )
              : [sql`1=1`]) // fallback if no purchase history
          )
        )
      )
      .groupBy(
        marketplaceListings.id,
        marketplaceListings.title,
        marketplaceListings.sellerId,
        marketplaceListings.price,
        marketplaceListings.originalPrice,
        marketplaceListings.imageUrl,
        marketplaceListings.category,
        marketplaceListings.freshness,
        marketplaceListings.organicCertified,
        users.firstName,
        users.lastName,
        users.username
      )
      .orderBy(
        desc(sql`CASE WHEN EXISTS(
          SELECT 1 FROM user_relationships ur 
          WHERE ur.follower_id = ${buyerId} 
          AND ur.followed_id = ${marketplaceListings.sellerId}
        ) THEN 1 ELSE 0 END`),
        desc(sql`COALESCE(AVG(${marketplaceReviews.rating}), 0)`),
        desc(marketplaceListings.createdAt)
      )
      .limit(limit);

    // Add recommendation reasons
    const recommendationsWithReasons = recommendations.map((product) => {
      let reason = "Popular choice";

      if (product.isFromFollowedSeller) {
        reason = "From a seller you follow";
      } else if (product.rating > 4) {
        reason = "Highly rated product";
      } else if (product.organic) {
        reason = "Organic certified";
      } else if (preferredCategories.includes(product.category)) {
        reason = "Based on your purchase history";
      }

      return {
        id: product.id,
        name: product.name,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        rating: Math.round(product.rating * 10) / 10,
        reviewCount: product.reviewCount,
        category: product.category,
        freshness: product.freshness || "fresh",
        organic: product.organic || false,
        inSeason: product.inSeason || false,
        reasonForRecommendation: reason,
      };
    });

    res.json(recommendationsWithReasons);
  } catch (error) {
    logger.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

// GET /api/buyer/purchase-insights
// Get purchase insights and analytics
router.get("/purchase-insights", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const buyerId = req.user.id;
    const currentMonth = new Date();
    currentMonth.setDate(1);

    // Get spending by category for current month
    const categorySpending = await db
      .select({
        category: marketplaceListings.category,
        spending: sql<number>`COALESCE(SUM(${orderItems.unitPrice} * ${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(
        marketplaceListings,
        eq(marketplaceListings.id, orderItems.listingId)
      )
      .where(
        and(eq(orders.userId, buyerId), gte(orders.createdAt, currentMonth))
      )
      .groupBy(marketplaceListings.category)
      .orderBy(
        desc(sql`SUM(${orderItems.unitPrice} * ${orderItems.quantity})`)
      );

    // Calculate total spending to get percentages
    const totalSpending = categorySpending.reduce(
      (sum, cat) => sum + cat.spending,
      0
    );

    // Add seasonal tips based on categories
    const seasonalTips: { [key: string]: string } = {
      vegetables:
        "Root vegetables store longer - consider bulk buying this season",
      fruits: "Citrus fruits are in peak season - great for vitamin C",
      grains: "Harvest season means better prices for bulk grain purchases",
      herbs: "Fresh herbs are abundant now - perfect for preserving",
    };

    const insights = categorySpending.map((cat) => ({
      category: cat.category || "Other",
      spending: cat.spending,
      percentage: totalSpending > 0 ? (cat.spending / totalSpending) * 100 : 0,
      trend: "stable" as const, // Could be enhanced with historical comparison
      seasonalTip: seasonalTips[cat.category || ""] || undefined,
    }));

    res.json(insights);
  } catch (error) {
    logger.error("Error fetching purchase insights:", error);
    res.status(500).json({ message: "Failed to fetch purchase insights" });
  }
});

export default router;
