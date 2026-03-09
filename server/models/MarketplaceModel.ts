import { db } from "../db";
import {
  marketplaceListings,
  marketplaceReviews,
  marketplaceFavorites,
  marketplaceMessages,
  locations,
} from "@shared/schema";
import {
  eq,
  and,
  or,
  desc,
  asc,
  ilike,
  gte,
  lte,
  count,
  sql,
} from "drizzle-orm";
import type {
  MarketplaceListing,
  MarketplaceReview,
  MarketplaceFavorite,
  MarketplaceMessage,
} from "@shared/schema";

export class MarketplaceModel {
  // Listings methods
  async getListings(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: number;
    condition?: string;
    status?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceListing[]> {
    let query = db.select().from(marketplaceListings);

    const conditions = [];

    if (params?.category && params.category !== "all") {
      conditions.push(eq(marketplaceListings.category, params.category));
    }

    if (params?.search) {
      conditions.push(
        or(
          ilike(marketplaceListings.title, `%${params.search}%`),
          ilike(marketplaceListings.description, `%${params.search}%`)
        )
      );
    }

    if (params?.minPrice !== undefined) {
      conditions.push(
        gte(marketplaceListings.price, params.minPrice.toString())
      );
    }

    if (params?.maxPrice !== undefined) {
      conditions.push(
        lte(marketplaceListings.price, params.maxPrice.toString())
      );
    }

    if (params?.sellerId) {
      conditions.push(eq(marketplaceListings.sellerId, params.sellerId));
    }

    if (params?.condition) {
      conditions.push(eq(marketplaceListings.condition, params.condition));
    }

    if (params?.status) {
      conditions.push(eq(marketplaceListings.status, params.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (params?.sortBy) {
      switch (params.sortBy) {
        case "newest":
          query = query.orderBy(desc(marketplaceListings.createdAt));
          break;
        case "oldest":
          query = query.orderBy(asc(marketplaceListings.createdAt));
          break;
        case "price-low":
          query = query.orderBy(asc(marketplaceListings.price));
          break;
        case "price-high":
          query = query.orderBy(desc(marketplaceListings.price));
          break;
        default:
          query = query.orderBy(desc(marketplaceListings.createdAt));
      }
    } else {
      query = query.orderBy(desc(marketplaceListings.createdAt));
    }

    // Apply pagination
    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (params?.offset) {
      query = query.offset(params.offset);
    }

    return await query;
  }

  async getListingsByLocation(
    lat: number,
    lng: number,
    radiusKm: number = 50
  ): Promise<MarketplaceListing[]> {
    // Join with locations; Haversine uses location's lat/lng (listings have locationId only)
    const rows = await db
      .select({ listing: marketplaceListings })
      .from(marketplaceListings)
      .innerJoin(
        locations,
        eq(marketplaceListings.locationId, locations.id)
      )
      .where(
        and(
          sql`${locations.latitude} IS NOT NULL`,
          sql`${locations.longitude} IS NOT NULL`,
          sql`(
            6371 * acos(
              cos(radians(${lat})) * cos(radians(${locations.latitude})) *
              cos(radians(${locations.longitude}) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(${locations.latitude}))
            )
          ) <= ${radiusKm}`
        )
      )
      .orderBy(desc(marketplaceListings.createdAt));

    return rows.map((r) => r.listing);
  }

  async getListingsBySeller(sellerId: number): Promise<MarketplaceListing[]> {
    return await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, sellerId))
      .orderBy(desc(marketplaceListings.createdAt));
  }

  async getListing(id: number): Promise<MarketplaceListing | undefined> {
    const results = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, id))
      .limit(1);

    return results[0];
  }

  async createListing(data: {
    sellerId: number;
    title: string;
    description?: string;
    price: string;
    category: string;
    condition?: string;
    quantity?: number;
    quantityUnit?: string;
    locationId?: number;
    contactPhone?: string;
    deliveryAvailable?: boolean;
    isNegotiable?: boolean;
    isFeatured?: boolean;
    expiresAt?: Date;
    status?: string;
    images?: string[];
    tags?: string[];
    sourceCropId?: number;
    traceabilityQrCode?: string;
    certifications?: string[];
    blockchainVerified?: boolean;
    traceabilityBatchId?: string;
  }): Promise<MarketplaceListing> {
    const [listing] = await db
      .insert(marketplaceListings)
      .values({
        ...data,
        status: data.status || "active",
        isNegotiable: data.isNegotiable ?? false,
        deliveryAvailable: data.deliveryAvailable ?? false,
        isFeatured: data.isFeatured ?? false,
        blockchainVerified: data.blockchainVerified ?? false,
      })
      .returning();

    return listing;
  }

  async updateListing(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      price: string;
      category: string;
      condition: string;
      quantity: number;
      quantityUnit: string;
      locationId: number;
      contactPhone: string;
      deliveryAvailable: boolean;
      isNegotiable: boolean;
      isFeatured: boolean;
      expiresAt: Date;
      status: string;
      images: string[];
      tags: string[];
      sourceCropId: number;
      traceabilityQrCode: string;
      certifications: string[];
      blockchainVerified: boolean;
      traceabilityBatchId: string;
    }>
  ): Promise<MarketplaceListing | undefined> {
    const [listing] = await db
      .update(marketplaceListings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceListings.id, id))
      .returning();

    return listing;
  }

  async deleteListing(id: number): Promise<boolean> {
    const result = await db
      .delete(marketplaceListings)
      .where(eq(marketplaceListings.id, id));

    return result.rowCount > 0;
  }

  // Reviews methods
  async getReviews(
    listingId?: number,
    sellerId?: number
  ): Promise<MarketplaceReview[]> {
    let query = db.select().from(marketplaceReviews);

    if (listingId && sellerId) {
      query = query.where(
        and(
          eq(marketplaceReviews.listingId, listingId),
          eq(marketplaceReviews.sellerId, sellerId)
        )
      );
    } else if (listingId) {
      query = query.where(eq(marketplaceReviews.listingId, listingId));
    } else if (sellerId) {
      query = query.where(eq(marketplaceReviews.sellerId, sellerId));
    }

    return await query.orderBy(desc(marketplaceReviews.createdAt));
  }

  async getReview(id: number): Promise<MarketplaceReview | undefined> {
    const results = await db
      .select()
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, id))
      .limit(1);

    return results[0];
  }

  async createReview(data: {
    listingId?: number;
    sellerId: number;
    reviewerId: number;
    rating: number;
    review?: string;
  }): Promise<MarketplaceReview> {
    const [review] = await db
      .insert(marketplaceReviews)
      .values(data)
      .returning();

    return review;
  }

  async updateReview(
    id: number,
    data: Partial<{
      rating: number;
      review: string;
    }>
  ): Promise<MarketplaceReview | undefined> {
    const [review] = await db
      .update(marketplaceReviews)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceReviews.id, id))
      .returning();

    return review;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await db
      .delete(marketplaceReviews)
      .where(eq(marketplaceReviews.id, id));

    return result.rowCount > 0;
  }

  // Favorites methods
  async getFavorites(userId: number): Promise<MarketplaceFavorite[]> {
    return await db
      .select()
      .from(marketplaceFavorites)
      .where(eq(marketplaceFavorites.userId, userId))
      .orderBy(desc(marketplaceFavorites.createdAt));
  }

  async getFavorite(id: number): Promise<MarketplaceFavorite | undefined> {
    const results = await db
      .select()
      .from(marketplaceFavorites)
      .where(eq(marketplaceFavorites.id, id))
      .limit(1);

    return results[0];
  }

  async createFavorite(data: {
    userId: number;
    listingId: number;
  }): Promise<MarketplaceFavorite> {
    const [favorite] = await db
      .insert(marketplaceFavorites)
      .values(data)
      .returning();

    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const result = await db
      .delete(marketplaceFavorites)
      .where(eq(marketplaceFavorites.id, id));

    return result.rowCount > 0;
  }

  // Messages methods
  async getMessages(params?: {
    listingId?: number;
    senderId?: number;
    recipientId?: number;
    userId?: number; // For getting all messages for a user
  }): Promise<MarketplaceMessage[]> {
    let query = db.select().from(marketplaceMessages);

    if (params?.listingId) {
      query = query.where(eq(marketplaceMessages.listingId, params.listingId));
    }

    if (params?.senderId) {
      query = query.where(eq(marketplaceMessages.senderId, params.senderId));
    }

    if (params?.recipientId) {
      query = query.where(
        eq(marketplaceMessages.recipientId, params.recipientId)
      );
    }

    if (params?.userId) {
      query = query.where(
        or(
          eq(marketplaceMessages.senderId, params.userId),
          eq(marketplaceMessages.recipientId, params.userId)
        )
      );
    }

    return await query.orderBy(desc(marketplaceMessages.createdAt));
  }

  async getMessage(id: number): Promise<MarketplaceMessage | undefined> {
    const results = await db
      .select()
      .from(marketplaceMessages)
      .where(eq(marketplaceMessages.id, id))
      .limit(1);

    return results[0];
  }

  async createMessage(data: {
    listingId?: number;
    senderId: number;
    recipientId: number;
    message: string;
  }): Promise<MarketplaceMessage> {
    const [message] = await db
      .insert(marketplaceMessages)
      .values(data)
      .returning();

    return message;
  }

  async updateMessage(
    id: number,
    data: Partial<{
      message: string;
      read: boolean;
    }>
  ): Promise<MarketplaceMessage | undefined> {
    const [message] = await db
      .update(marketplaceMessages)
      .set(data)
      .where(eq(marketplaceMessages.id, id))
      .returning();

    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(marketplaceMessages)
      .where(eq(marketplaceMessages.id, id));

    return result.rowCount > 0;
  }

  // Utility methods
  async getUnreadMessageCount(userId: number): Promise<number> {
    const results = await db
      .select({ count: count() })
      .from(marketplaceMessages)
      .where(
        and(
          eq(marketplaceMessages.recipientId, userId),
          eq(marketplaceMessages.read, false)
        )
      );

    return results[0]?.count || 0;
  }

  async getSellerStats(sellerId: number): Promise<{
    totalListings: number;
    activeListings: number;
    totalReviews: number;
    averageRating: number;
  }> {
    const [listingsCount] = await db
      .select({ count: count() })
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, sellerId));

    const [activeListingsCount] = await db
      .select({ count: count() })
      .from(marketplaceListings)
      .where(
        and(
          eq(marketplaceListings.sellerId, sellerId),
          eq(marketplaceListings.status, "active")
        )
      );

    const [reviewsCount] = await db
      .select({ count: count() })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.sellerId, sellerId));

    const [avgRating] = await db
      .select({ avg: sql<number>`avg(rating)` })
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.sellerId, sellerId));

    return {
      totalListings: listingsCount?.count || 0,
      activeListings: activeListingsCount?.count || 0,
      totalReviews: reviewsCount?.count || 0,
      averageRating: avgRating?.avg || 0,
    };
  }
}
