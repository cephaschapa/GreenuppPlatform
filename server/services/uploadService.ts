import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import type { Request } from 'express';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
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
  return matches.map(match => match.substring(1));
}

// Function to extract hashtags from content
export function extractHashtags(content: string): string[] {
  // Extract #tag mentions
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex) || [];
  
  // Remove # and return hashtags
  return matches.map(match => match.substring(1));
}

// Function to process file upload and return public URL
export function getFileUrl(filename: string): string {
  // In production, this might be a CDN URL
  return `/uploads/${filename}`;
}