import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { logger } from "../lib/logger.js";

// Configure Cloudinary
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info("✅ Cloudinary configured successfully");
} else {
  logger.warn(
    "⚠️ Cloudinary not configured - set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable cloud storage"
  );
}

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
}

export class CloudinaryService {
  /**
   * Check if Cloudinary is properly configured
   */
  static isConfigured(): boolean {
    return isCloudinaryConfigured;
  }

  /**
   * Upload an image to Cloudinary
   * @param filePath - Local file path to upload
   * @param folder - Cloudinary folder (e.g., 'marketplace', 'social', 'profiles')
   * @returns Upload result with Cloudinary URL
   */
  static async uploadImage(
    filePath: string,
    folder: string = "greenupp"
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error("Cloudinary is not configured");
    }

    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        filePath,
        {
          folder: `greenupp/${folder}`,
          resource_type: "auto",
          transformation: [
            { quality: "auto", fetch_format: "auto" }, // Auto-optimize
            { width: 1920, height: 1920, crop: "limit" }, // Max 1920x1920
          ],
        }
      );

      logger.info(
        `Image uploaded to Cloudinary: ${result.public_id} (${result.bytes} bytes)`
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
      };
    } catch (error) {
      logger.error("Failed to upload to Cloudinary:", error);
      throw error;
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  static async uploadMultiple(
    filePaths: string[],
    folder: string = "greenupp"
  ): Promise<UploadResult[]> {
    const uploads = filePaths.map((filePath) =>
      this.uploadImage(filePath, folder)
    );
    return Promise.all(uploads);
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    if (!this.isConfigured()) {
      logger.warn("Cloudinary not configured, skipping delete");
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      logger.error(`Failed to delete from Cloudinary: ${publicId}`, error);
      throw error;
    }
  }

  /**
   * Generate a thumbnail URL from a Cloudinary URL
   */
  static getThumbnailUrl(
    cloudinaryUrl: string,
    width: number = 300,
    height: number = 300
  ): string {
    if (!cloudinaryUrl.includes("cloudinary.com")) {
      return cloudinaryUrl; // Not a Cloudinary URL, return as-is
    }

    // Insert transformation parameters into the URL
    const transformations = `w_${width},h_${height},c_fill,q_auto,f_auto`;
    return cloudinaryUrl.replace("/upload/", `/upload/${transformations}/`);
  }

  /**
   * Optimize an existing Cloudinary URL
   */
  static getOptimizedUrl(cloudinaryUrl: string): string {
    if (!cloudinaryUrl.includes("cloudinary.com")) {
      return cloudinaryUrl;
    }

    // Add quality and format auto-optimization
    return cloudinaryUrl.replace("/upload/", "/upload/q_auto,f_auto/");
  }

  /**
   * Upload from buffer (useful for base64 uploads)
   */
  static async uploadFromBuffer(
    buffer: Buffer,
    folder: string = "greenupp",
    originalFilename: string = "upload"
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error("Cloudinary is not configured");
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `greenupp/${folder}`,
          resource_type: "auto",
          public_id: `${nanoid()}_${path.parse(originalFilename).name}`,
          transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 1920, height: 1920, crop: "limit" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            logger.error("Failed to upload buffer to Cloudinary:", error);
            return reject(error);
          }

          logger.info(
            `Buffer uploaded to Cloudinary: ${result.public_id} (${result.bytes} bytes)`
          );

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.bytes,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload from base64 string
   */
  static async uploadFromBase64(
    base64String: string,
    folder: string = "greenupp"
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      throw new Error("Cloudinary is not configured");
    }

    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        base64String,
        {
          folder: `greenupp/${folder}`,
          resource_type: "auto",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 1920, height: 1920, crop: "limit" },
          ],
        }
      );

      logger.info(
        `Base64 uploaded to Cloudinary: ${result.public_id} (${result.bytes} bytes)`
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
      };
    } catch (error) {
      logger.error("Failed to upload base64 to Cloudinary:", error);
      throw error;
    }
  }
}
