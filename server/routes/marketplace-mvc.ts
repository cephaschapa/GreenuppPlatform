import type { Express } from "express";
import { MarketplaceController } from "../controllers/MarketplaceController";
import { isAuthenticated } from "../middleware/auth";
import { upload } from "../services/uploadService";

export function setupMarketplaceRoutes(app: Express) {
  const controller = new MarketplaceController();

  // Public routes
  app.get("/api/marketplace/listings", controller.getListings.bind(controller));
  app.get(
    "/api/marketplace/listings/by-location",
    controller.getListingsByLocation.bind(controller)
  );
  app.get(
    "/api/marketplace/listings/:id",
    controller.getListing.bind(controller)
  );
  app.get(
    "/api/marketplace/sellers/:sellerId/listings",
    controller.getListingsBySeller.bind(controller)
  );
  app.get("/api/marketplace/reviews", controller.getReviews.bind(controller));
  app.get(
    "/api/marketplace/search/suggestions",
    controller.getSearchSuggestions.bind(controller)
  );
  app.get(
    "/api/marketplace/sellers/:sellerId/stats",
    controller.getSellerStats.bind(controller)
  );

  // Authenticated routes
  app.post(
    "/api/marketplace/listings",
    isAuthenticated,
    upload.array("images", 5), // Handle up to 5 images
    controller.createListing.bind(controller)
  );
  app.put(
    "/api/marketplace/listings/:id",
    isAuthenticated,
    upload.array("images", 5), // Handle up to 5 images for updates too
    controller.updateListing.bind(controller)
  );
  app.delete(
    "/api/marketplace/listings/:id",
    isAuthenticated,
    controller.deleteListing.bind(controller)
  );

  app.post(
    "/api/marketplace/reviews",
    isAuthenticated,
    controller.createReview.bind(controller)
  );
  app.put(
    "/api/marketplace/reviews/:id",
    isAuthenticated,
    controller.updateReview.bind(controller)
  );
  app.delete(
    "/api/marketplace/reviews/:id",
    isAuthenticated,
    controller.deleteReview.bind(controller)
  );

  app.get(
    "/api/marketplace/favorites",
    isAuthenticated,
    controller.getFavorites.bind(controller)
  );
  app.post(
    "/api/marketplace/favorites",
    isAuthenticated,
    controller.createFavorite.bind(controller)
  );
  app.delete(
    "/api/marketplace/favorites/:id",
    isAuthenticated,
    controller.deleteFavorite.bind(controller)
  );

  app.get(
    "/api/marketplace/messages",
    isAuthenticated,
    controller.getMessages.bind(controller)
  );
  app.post(
    "/api/marketplace/messages",
    isAuthenticated,
    controller.createMessage.bind(controller)
  );
  app.put(
    "/api/marketplace/messages/:id",
    isAuthenticated,
    controller.updateMessage.bind(controller)
  );
  app.delete(
    "/api/marketplace/messages/:id",
    isAuthenticated,
    controller.deleteMessage.bind(controller)
  );

  app.get(
    "/api/marketplace/messages/unread/count",
    isAuthenticated,
    controller.getUnreadMessageCount.bind(controller)
  );
}
