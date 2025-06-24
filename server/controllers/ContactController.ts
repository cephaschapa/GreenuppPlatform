import type { Request, Response } from "express";
import { ContactModel } from "../models/ContactModel";
import { logger } from "../lib/logger";
import { ValidationError, DatabaseError } from "../lib/errors";
import { contactFormSchema } from "@shared/schema";

export class ContactController {
  private model: ContactModel;

  constructor() {
    this.model = new ContactModel();
  }

  // Submit contact form
  async submitContactForm(req: Request, res: Response): Promise<void> {
    try {
      // Validate the request data
      const data = contactFormSchema.parse(req.body);

      // Save the contact inquiry
      const inquiry = await this.model.saveContactInquiry(data);

      logger.info(`Contact form submitted: ${inquiry.id}`);
      res.status(201).json({
        success: true,
        message: "Contact form submitted successfully",
        data: inquiry,
      });
    } catch (error) {
      logger.error("Error submitting contact form:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to submit contact form",
        });
      }
    }
  }

  // Get all contact inquiries (admin only)
  async getAllContactInquiries(req: Request, res: Response): Promise<void> {
    try {
      const inquiries = await this.model.getAllContactInquiries();
      res.json(inquiries);
    } catch (error) {
      logger.error("Error fetching contact inquiries:", error);
      res.status(500).json({ message: "Failed to retrieve contact inquiries" });
    }
  }

  // Get contact inquiry by ID (admin only)
  async getContactInquiry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const inquiryId = parseInt(id);

      if (isNaN(inquiryId)) {
        throw new ValidationError("Invalid inquiry ID");
      }

      const inquiry = await this.model.getContactInquiry(inquiryId);
      if (!inquiry) {
        res.status(404).json({ message: "Contact inquiry not found" });
        return;
      }

      res.json(inquiry);
    } catch (error) {
      logger.error("Error fetching contact inquiry:", error);
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve contact inquiry" });
      }
    }
  }
}
