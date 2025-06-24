import { db } from "../db";
import { contactForm } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { ContactFormData } from "@shared/schema";

export class ContactModel {
  // Save contact form inquiry
  async saveContactInquiry(data: ContactFormData): Promise<any> {
    const [inquiry] = await db.insert(contactForm).values(data).returning();

    return inquiry;
  }

  // Get all contact inquiries (for admin use)
  async getAllContactInquiries(): Promise<any[]> {
    const results = await db
      .select()
      .from(contactForm)
      .orderBy(contactForm.timestamp);

    return results;
  }

  // Get contact inquiry by ID
  async getContactInquiry(id: number): Promise<any | undefined> {
    const results = await db
      .select()
      .from(contactForm)
      .where(eq(contactForm.id, id))
      .limit(1);

    return results[0];
  }
}
