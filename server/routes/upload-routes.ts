import { Router, Request, Response, NextFunction } from "express";
import {
  upload,
  getFileUrl,
  extractUserTags,
  extractHashtags,
} from "../services/uploadService";
import { CloudinaryService } from "../services/cloudinaryService";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { logger } from "../lib/logger";

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export const uploadRouter = Router();

// Single file upload endpoint
uploadRouter.post(
  "/single",
  isAuthenticated,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("Single file upload request received");

      // Check if file was uploaded
      if (!req.file) {
        console.warn("No file was provided in the request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      const folder = req.body.folder || "general"; // Allow specifying folder (marketplace, social, profiles, etc.)

      // Use Cloudinary if configured, otherwise use local storage
      let fileUrl: string;
      let cloudinaryData: any = null;

      if (CloudinaryService.isConfigured()) {
        logger.info(`Uploading to Cloudinary: ${req.file.originalname}`);

        // Upload to Cloudinary
        const result = await CloudinaryService.uploadImage(
          req.file.path,
          folder
        );
        fileUrl = result.url;
        cloudinaryData = result;

        // Delete local temp file after uploading to Cloudinary
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          logger.warn("Failed to delete temp file:", err);
        }

        logger.info(`File uploaded to Cloudinary: ${fileUrl}`);
      } else {
        // Fallback to local storage
        fileUrl = getFileUrl(req.file.filename);
        logger.info(`File uploaded locally: ${fileUrl}`);
      }

      // Return the file URL
      return res.status(200).json({
        message: "File uploaded successfully",
        fileUrl,
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
          cloudinary: cloudinaryData,
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({
        message: "Error uploading file",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Multiple files upload endpoint
uploadRouter.post(
  "/multiple",
  isAuthenticated,
  upload.array("files", 5),
  async (req, res) => {
    try {
      console.log("Multiple files upload request received");

      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.warn("No files were provided in the request");
        return res.status(400).json({ message: "No files uploaded" });
      }

      console.log(`Processing ${req.files.length} files for upload`);

      const folder = req.body.folder || "general";

      // Process each file and create an array of file info
      const filesPromises = req.files.map(async (file) => {
        try {
          let fileUrl: string;
          let cloudinaryData: any = null;

          if (CloudinaryService.isConfigured()) {
            // Upload to Cloudinary
            const result = await CloudinaryService.uploadImage(
              file.path,
              folder
            );
            fileUrl = result.url;
            cloudinaryData = result;

            // Delete local temp file
            try {
              fs.unlinkSync(file.path);
            } catch (err) {
              logger.warn("Failed to delete temp file:", err);
            }
          } else {
            // Fallback to local storage
            fileUrl = getFileUrl(file.filename);
          }

          console.log(`Processed file: ${file.originalname} -> ${fileUrl}`);
          return {
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: fileUrl,
            cloudinary: cloudinaryData,
          };
        } catch (fileError: unknown) {
          console.error(
            `Error processing file ${file.originalname}:`,
            fileError
          );
          const errorMessage =
            fileError instanceof Error ? fileError.message : "Unknown error";
          throw new Error(
            `Error processing file ${file.originalname}: ${errorMessage}`
          );
        }
      });

      const files = await Promise.all(filesPromises);

      // Return the file URLs and information
      console.log(`Successfully processed ${files.length} files`);
      return res.status(200).json({
        message: `${files.length} files uploaded successfully`,
        files,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      // Return more detailed error message
      return res.status(500).json({
        message: "Error uploading files",
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : null
            : null,
      });
    }
  }
);

// Base64 upload endpoint (for AI analysis, quick uploads, etc.)
uploadRouter.post("/base64", isAuthenticated, async (req, res) => {
  try {
    const { base64, folder = "general" } = req.body;

    if (!base64) {
      return res.status(400).json({ message: "base64 data is required" });
    }

    // Use Cloudinary if configured
    if (CloudinaryService.isConfigured()) {
      logger.info("Uploading base64 to Cloudinary");

      const result = await CloudinaryService.uploadFromBase64(base64, folder);

      return res.status(200).json({
        message: "File uploaded successfully",
        fileUrl: result.url,
        file: {
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.size,
        },
      });
    } else {
      // Local storage fallback - save base64 as file
      const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ message: "Invalid base64 image format" });
      }

      const extension = matches[1];
      const data = matches[2];
      const filename = `${nanoid()}.${extension}`;
      const buffer = Buffer.from(data, "base64");

      // Write to local uploads directory
      const { uploadsDir } = await import("../services/uploadService.js");
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = getFileUrl(filename);
      logger.info(`Base64 uploaded locally: ${fileUrl}`);

      return res.status(200).json({
        message: "File uploaded successfully",
        fileUrl,
        file: {
          filename,
          url: fileUrl,
          size: buffer.length,
        },
      });
    }
  } catch (error) {
    logger.error("Error uploading base64:", error);
    return res.status(500).json({
      message: "Error uploading file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Extract tags and mentions from content
uploadRouter.post("/extract-tags", (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res
        .status(400)
        .json({ message: "Content is required and must be a string" });
    }

    const userTags = extractUserTags(content);
    const hashtags = extractHashtags(content);

    return res.status(200).json({
      userTags,
      hashtags,
    });
  } catch (error) {
    console.error("Error extracting tags:", error);
    return res.status(500).json({ message: "Error extracting tags" });
  }
});
