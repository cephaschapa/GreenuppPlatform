import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { logger } from "../lib/logger";
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError,
} from "../lib/errors";

function setupSearchRoutes(app: Express) {
  // Global search endpoint
  app.get("/api/search/global", async (req, res) => {
    try {
      const { query, category, limit = "10" } = req.query;

      if (!query || typeof query !== "string") {
        return res.json([]);
      }

      const searchTerm = query.toLowerCase();
      const limitNum = parseInt(limit as string);
      const categoryFilter =
        category && category !== "all" ? (category as string) : undefined;

      const results: any[] = [];

      // Search marketplace listings
      if (!categoryFilter || categoryFilter === "marketplace") {
        try {
          const marketplaceResults = await storage.getMarketplaceListings();
          const filteredMarketplace = marketplaceResults
            .filter((listing: any) => {
              const titleMatch = listing.title
                ?.toLowerCase()
                .includes(searchTerm);
              const descMatch = listing.description
                ?.toLowerCase()
                .includes(searchTerm);
              const categoryMatch = listing.category
                ?.toLowerCase()
                .includes(searchTerm);
              return titleMatch || descMatch || categoryMatch;
            })
            .slice(0, Math.ceil(limitNum / 3))
            .map((listing: any) => ({
              id: `marketplace-${listing.id}`,
              type: "marketplace",
              title: listing.title,
              description: listing.description,
              url: `/dashboard/marketplace/${listing.id}`,
              icon: "shopping-bag",
              metadata: {
                price: listing.price ? `ZMW ${listing.price}` : undefined,
                category: listing.category,
                seller: listing.sellerName || "Unknown Seller",
              },
            }));

          results.push(...filteredMarketplace);
        } catch (error) {
          logger.error("Error searching marketplace:", error);
        }
      }

      // Search fields (if user is authenticated)
      if (!categoryFilter || categoryFilter === "fields") {
        try {
          // This would require user authentication and field data
          // For now, we'll add mock data
          if (
            searchTerm.includes("field") ||
            searchTerm.includes("maize") ||
            searchTerm.includes("corn")
          ) {
            results.push({
              id: "field-1",
              type: "field",
              title: "Maize Field",
              description: "Primary maize cultivation field",
              url: "/dashboard/fields",
              icon: "map",
              metadata: {
                size: "2.5 hectares",
                status: "Active",
                crop: "Maize",
              },
            });
          }
        } catch (error) {
          logger.error("Error searching fields:", error);
        }
      }

      // Search crops
      if (!categoryFilter || categoryFilter === "crops") {
        try {
          // This would search actual crop data
          if (searchTerm.includes("maize") || searchTerm.includes("corn")) {
            results.push({
              id: "crop-1",
              type: "crop",
              title: "Maize",
              description: "Zea mays - Primary crop",
              url: "/dashboard/crops",
              icon: "leaf",
              metadata: {
                variety: "Hybrid",
                stage: "Vegetative",
                plantedDate: "2024-01-01",
              },
            });
          }
        } catch (error) {
          logger.error("Error searching crops:", error);
        }
      }

      // Search tasks
      if (!categoryFilter || categoryFilter === "tasks") {
        try {
          // This would search actual task data
          if (
            searchTerm.includes("fertilizer") ||
            searchTerm.includes("apply")
          ) {
            results.push({
              id: "task-1",
              type: "task",
              title: "Apply Fertilizer",
              description: "Apply NPK fertilizer to maize field",
              url: "/dashboard/tasks",
              icon: "calendar",
              metadata: {
                dueDate: "2024-01-15",
                priority: "High",
                status: "Pending",
              },
            });
          }
        } catch (error) {
          logger.error("Error searching tasks:", error);
        }
      }

      // Search users (if authenticated)
      if (!categoryFilter || categoryFilter === "users") {
        try {
          // This would search actual user data
          if (
            searchTerm.includes("farmer") ||
            searchTerm.includes("supplier")
          ) {
            results.push({
              id: "user-1",
              type: "user",
              title: "John Farmer",
              description: "Local farmer with 5 years experience",
              url: "/dashboard/profile/1",
              icon: "users",
              metadata: {
                role: "Farmer",
                location: "Lusaka",
                rating: "4.5",
              },
            });
          }
        } catch (error) {
          logger.error("Error searching users:", error);
        }
      }

      // Search knowledge base
      if (!categoryFilter || categoryFilter === "knowledge") {
        try {
          // This would search actual knowledge base data
          if (
            searchTerm.includes("fertilizer") ||
            searchTerm.includes("pest")
          ) {
            results.push({
              id: "knowledge-1",
              type: "knowledge",
              title: "Fertilizer Application Guide",
              description: "Complete guide to applying fertilizers correctly",
              url: "/dashboard/knowledge/fertilizer-guide",
              icon: "file-text",
              metadata: {
                category: "Farming Guide",
                author: "Agricultural Expert",
                readTime: "5 min",
              },
            });
          }
        } catch (error) {
          logger.error("Error searching knowledge base:", error);
        }
      }

      // Search social posts
      if (!categoryFilter || categoryFilter === "social") {
        try {
          // This would search actual social posts
          if (
            searchTerm.includes("harvest") ||
            searchTerm.includes("success")
          ) {
            results.push({
              id: "social-1",
              type: "social",
              title: "Successful Harvest",
              description: "Great harvest this season!",
              url: "/dashboard/social",
              icon: "message-square",
              metadata: {
                author: "Farmer John",
                likes: "24",
                comments: "8",
              },
            });
          }
        } catch (error) {
          logger.error("Error searching social posts:", error);
        }
      }

      // Limit results and return
      const limitedResults = results.slice(0, limitNum);

      res.json(limitedResults);
    } catch (error) {
      logger.error("Error in global search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Search suggestions endpoint
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const { query, limit = "8" } = req.query;

      if (!query || typeof query !== "string") {
        return res.json([]);
      }

      const searchTerm = query.toLowerCase();
      const limitNum = parseInt(limit as string);

      const suggestions = new Set<string>();

      // Get marketplace suggestions
      try {
        const marketplaceResults = await storage.getMarketplaceListings();

        marketplaceResults.forEach((listing: any) => {
          // Add title words
          if (listing.title) {
            const titleWords = listing.title.toLowerCase().split(/\s+/);
            titleWords.forEach((word: string) => {
              if (word.startsWith(searchTerm) && word.length > 2) {
                suggestions.add(word);
              }
            });
          }

          // Add category
          if (
            listing.category &&
            listing.category.toLowerCase().includes(searchTerm)
          ) {
            suggestions.add(listing.category);
          }
        });
      } catch (error) {
        logger.error("Error getting marketplace suggestions:", error);
      }

      // Add common agricultural terms
      const commonTerms = [
        "fertilizer",
        "pesticide",
        "irrigation",
        "harvest",
        "seeds",
        "maize",
        "corn",
        "wheat",
        "soybeans",
        "tools",
        "equipment",
        "organic",
        "pest",
        "disease",
        "soil",
        "weather",
        "crop",
      ];

      commonTerms.forEach((term) => {
        if (term.includes(searchTerm)) {
          suggestions.add(term);
        }
      });

      // Convert to array and limit results
      const results = Array.from(suggestions)
        .slice(0, limitNum)
        .map((suggestion) => ({
          text: suggestion,
          type: "suggestion",
        }));

      res.json(results);
    } catch (error) {
      logger.error("Error fetching search suggestions:", error);
      res.status(500).json({ message: "Failed to retrieve suggestions" });
    }
  });

  // Search analytics endpoint (for tracking popular searches)
  app.post("/api/search/analytics", async (req, res) => {
    try {
      const { query, category, resultCount } = req.body;

      // In a real implementation, you would store this data for analytics
      logger.info("Search analytics:", {
        query,
        category,
        resultCount,
        timestamp: new Date().toISOString(),
        userAgent: req.get("User-Agent"),
      });

      res.json({ success: true });
    } catch (error) {
      logger.error("Error logging search analytics:", error);
      res.status(500).json({ message: "Failed to log analytics" });
    }
  });
}

export default setupSearchRoutes;
