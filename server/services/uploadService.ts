import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import type { Request } from "express";
import { fileURLToPath } from "url";
import os from "os";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine uploads directory based on environment
let uploadsDir: string;

if (process.env.UPLOADS_DIR) {
  // Use environment variable if set (recommended for production)
  uploadsDir = process.env.UPLOADS_DIR;
  console.log(`Using uploads directory from UPLOADS_DIR env var: ${uploadsDir}`);
} else if (process.env.NODE_ENV === "production") {
  // In production, use /var/data/greenupp-uploads for persistence
  // Railway/Docker should mount a volume here
  uploadsDir = "/var/data/greenupp-uploads";
  console.log(`Production: Using persistent uploads directory: ${uploadsDir}`);
} else {
  // In development, use the project uploads directory
  uploadsDir = path.join(__dirname, "../..", "uploads");
  console.log(`Development: Using project uploads directory: ${uploadsDir}`);
}

// Create uploads directory if it doesn't exist
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadsDir}`);
  }
} catch (error) {
  console.error("Could not create uploads directory:", error);
  // Fallback to temp directory (WARNING: files will be lost on restart!)
  uploadsDir = path.join(os.tmpdir(), "greenupp-uploads");
  console.warn(`FALLBACK: Using temporary directory (files will be lost on restart!): ${uploadsDir}`);
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (fallbackError) {
    console.error(
      "Could not create fallback uploads directory:",
      fallbackError
    );
    throw new Error("No writable directory available for uploads");
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueFilename = `${nanoid()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

// File filter to accept only images
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Create the multer upload instance with size limits
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Function to extract user tags from content
export function extractUserTags(content: string): string[] {
  // Extract @username mentions
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex) || [];

  // Remove @ and return usernames
  return matches.map((match) => match.substring(1));
}

// Function to extract hashtags from content
export function extractHashtags(content: string): string[] {
  // Extract #tag mentions
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex) || [];

  // Remove # and return hashtags
  return matches.map((match) => match.substring(1));
}

// Export uploads directory for use in server/index.ts
export { uploadsDir };

// Function to process file upload and return public URL
export function getFileUrl(filename: string): string {
  // Clean the filename to ensure no directory traversal
  const sanitizedFilename = path.basename(filename);

  // Always return the direct path with a leading slash for consistency
  // This standardizes the URL format for frontend consumption
  return `/uploads/${sanitizedFilename}`;
}
