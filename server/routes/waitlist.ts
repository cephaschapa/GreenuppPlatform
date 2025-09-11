import { Router } from "express";
import { db } from "../db.js";
import { waitlistRegistrations } from "@shared/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schema for waitlist registration
const waitlistRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  organization: z.string().optional(),
  userType: z.enum(["farmer", "buyer", "supplier", "distributor", "other"]),
  location: z.string().min(2, "Please enter your location"),
  farmSize: z.string().optional(),
  primaryCrops: z.string().optional(),
  experience: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  additionalInfo: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  subscribeUpdates: z.boolean().default(true),
});

// POST /api/waitlist/register - Register for testing waitlist
router.post("/register", async (req, res) => {
  try {
    // Validate request body
    const validatedData = waitlistRegistrationSchema.parse(req.body);

    // Check if email already exists
    const existingRegistration = await db
      .select()
      .from(waitlistRegistrations)
      .where(eq(waitlistRegistrations.email, validatedData.email))
      .limit(1);

    if (existingRegistration.length > 0) {
      return res.status(400).json({
        message: "This email is already registered for the waitlist",
        code: "EMAIL_EXISTS",
      });
    }

    // Create new waitlist registration
    const [registration] = await db
      .insert(waitlistRegistrations)
      .values({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        organization: validatedData.organization || null,
        userType: validatedData.userType,
        location: validatedData.location,
        farmSize: validatedData.farmSize || null,
        primaryCrops: validatedData.primaryCrops || null,
        experience: validatedData.experience,
        interests: validatedData.interests,
        additionalInfo: validatedData.additionalInfo || null,
        agreeToTerms: validatedData.agreeToTerms,
        subscribeUpdates: validatedData.subscribeUpdates,
        status: "pending",
        registrationDate: new Date(),
      })
      .returning();

    // Log successful registration (for analytics)
    console.log(
      `New waitlist registration: ${validatedData.email} (${validatedData.userType})`
    );

    res.status(201).json({
      message: "Successfully registered for the testing waitlist!",
      registrationId: registration.id,
      status: registration.status,
    });
  } catch (error) {
    console.error("Waitlist registration error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    // Handle database errors
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return res.status(400).json({
        message: "This email is already registered for the waitlist",
        code: "EMAIL_EXISTS",
      });
    }

    res.status(500).json({
      message: "Failed to register for waitlist. Please try again.",
      code: "REGISTRATION_FAILED",
    });
  }
});

// GET /api/waitlist/stats - Get waitlist statistics (for admin dashboard)
router.get("/stats", async (req, res) => {
  try {
    // Get total registrations
    const totalRegistrations = await db
      .select({ count: count() })
      .from(waitlistRegistrations);

    // Get registrations by user type
    const userTypeStats = await db
      .select({
        userType: waitlistRegistrations.userType,
        count: count(),
      })
      .from(waitlistRegistrations)
      .groupBy(waitlistRegistrations.userType);

    // Get registrations by status
    const statusStats = await db
      .select({
        status: waitlistRegistrations.status,
        count: count(),
      })
      .from(waitlistRegistrations)
      .groupBy(waitlistRegistrations.status);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await db
      .select({ count: count() })
      .from(waitlistRegistrations)
      .where(
        sql`${waitlistRegistrations.registrationDate} >= ${thirtyDaysAgo}`
      );

    res.json({
      total: totalRegistrations[0]?.count || 0,
      recent: recentRegistrations[0]?.count || 0,
      byUserType: userTypeStats,
      byStatus: statusStats,
    });
  } catch (error) {
    console.error("Waitlist stats error:", error);
    res.status(500).json({
      message: "Failed to retrieve waitlist statistics",
    });
  }
});

// GET /api/waitlist/registrations - Get all registrations (admin only)
router.get("/registrations", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const registrations = await db
      .select()
      .from(waitlistRegistrations)
      .orderBy(desc(waitlistRegistrations.registrationDate))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(waitlistRegistrations);

    res.json({
      registrations,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        pages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Waitlist registrations error:", error);
    res.status(500).json({
      message: "Failed to retrieve registrations",
    });
  }
});

// PATCH /api/waitlist/registrations/:id - Update registration status (admin only)
router.patch("/registrations/:id", async (req, res) => {
  try {
    const registrationId = parseInt(req.params.id);
    const { status } = req.body;

    if (!["pending", "invited", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Must be one of: pending, invited, accepted, rejected",
      });
    }

    const [updatedRegistration] = await db
      .update(waitlistRegistrations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(waitlistRegistrations.id, registrationId))
      .returning();

    if (!updatedRegistration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    res.json({
      message: "Registration status updated successfully",
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error("Update registration error:", error);
    res.status(500).json({
      message: "Failed to update registration status",
    });
  }
});

export default router;
