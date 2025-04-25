import { Router, Request, Response, NextFunction } from 'express';
import { upload, getFileUrl, extractUserTags, extractHashtags } from '../services/uploadService';

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export const uploadRouter = Router();

// Single file upload endpoint
uploadRouter.post('/single', isAuthenticated, upload.single('image'), (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get URL for the uploaded file
    const fileUrl = getFileUrl(req.file.filename);

    // Return the file URL
    return res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl,
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
});

// Multiple files upload endpoint
uploadRouter.post('/multiple', isAuthenticated, upload.array('images', 5), (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Process each file and create an array of file info
    const files = req.files.map(file => {
      const fileUrl = getFileUrl(file.filename);
      return {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl
      };
    });

    // Return the file URLs and information
    return res.status(200).json({
      message: `${files.length} files uploaded successfully`,
      files
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return res.status(500).json({ message: 'Error uploading files' });
  }
});

// Extract tags and mentions from content
uploadRouter.post('/extract-tags', (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Content is required and must be a string' });
    }
    
    const userTags = extractUserTags(content);
    const hashtags = extractHashtags(content);
    
    return res.status(200).json({
      userTags,
      hashtags
    });
  } catch (error) {
    console.error('Error extracting tags:', error);
    return res.status(500).json({ message: 'Error extracting tags' });
  }
});