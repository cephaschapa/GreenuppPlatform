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
uploadRouter.post('/single', isAuthenticated, upload.single('file'), (req, res) => {
  try {
    console.log('Single file upload request received');
    
    // Check if file was uploaded
    if (!req.file) {
      console.warn('No file was provided in the request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get URL for the uploaded file
    const fileUrl = getFileUrl(req.file.filename);
    console.log(`Processed file: ${req.file.originalname} -> ${fileUrl}`);

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
    return res.status(500).json({ 
      message: 'Error uploading file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Multiple files upload endpoint
uploadRouter.post('/multiple', isAuthenticated, upload.array('files', 5), (req, res) => {
  try {
    console.log('Multiple files upload request received');
    
    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.warn('No files were provided in the request');
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    console.log(`Processing ${req.files.length} files for upload`);

    // Process each file and create an array of file info
    const files = req.files.map(file => {
      try {
        const fileUrl = getFileUrl(file.filename);
        console.log(`Processed file: ${file.originalname} -> ${fileUrl}`);
        return {
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: fileUrl
        };
      } catch (fileError: unknown) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
        throw new Error(`Error processing file ${file.originalname}: ${errorMessage}`);
      }
    });

    // Return the file URLs and information
    console.log(`Successfully processed ${files.length} files`);
    return res.status(200).json({
      message: `${files.length} files uploaded successfully`,
      files
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    // Return more detailed error message
    return res.status(500).json({ 
      message: 'Error uploading files', 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
    });
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