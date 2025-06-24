import type { Express } from "express";
import { ContactController } from "../controllers/ContactController";
import { isAuthenticated } from "../middleware/auth";

export function setupContactRoutes(app: Express) {
  const controller = new ContactController();

  // Submit contact form (public)
  app.post("/api/contact", controller.submitContactForm.bind(controller));

  // Get all contact inquiries (admin only)
  app.get(
    "/api/contact",
    isAuthenticated,
    controller.getAllContactInquiries.bind(controller)
  );

  // Get contact inquiry by ID (admin only)
  app.get(
    "/api/contact/:id",
    isAuthenticated,
    controller.getContactInquiry.bind(controller)
  );
}
