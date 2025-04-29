import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  }
});

export const testRouter = Router();

// Test endpoint for single file upload
testRouter.post('/upload-single', upload.single('file'), (req, res) => {
  try {
    console.log('TEST - Single file upload endpoint called');
    
    if (!req.file) {
      console.log('TEST - No file was provided');
      return res.status(400).json({ error: 'No file provided' });
    }
    
    console.log(`TEST - Successfully received file: ${req.file.originalname}`);
    
    // Get the URL that would be used to access the file
    const fileUrl = `/uploads/${req.file.filename}`;
    
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('TEST - Error uploading file:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorObject: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Test endpoint for multiple file upload
testRouter.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  try {
    console.log('TEST - Multiple files upload endpoint called');
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      console.log('TEST - No files were provided');
      return res.status(400).json({ error: 'No files provided' });
    }
    
    console.log(`TEST - Successfully received ${files.length} files`);
    
    // Map each file to a response object
    const fileDetails = files.map(file => {
      const fileUrl = `/uploads/${file.filename}`;
      console.log(`TEST - Processed file: ${file.originalname} -> ${fileUrl}`);
      
      return {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: fileUrl
      };
    });
    
    return res.status(200).json({
      success: true,
      message: `${files.length} files uploaded successfully`,
      count: files.length,
      files: fileDetails
    });
  } catch (error) {
    console.error('TEST - Error uploading files:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorObject: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Test endpoint to check the uploads directory
testRouter.get('/uploads-info', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    
    const fileDetails = files.map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        url: `/uploads/${filename}`
      };
    });
    
    return res.status(200).json({
      success: true,
      uploadsDir: uploadDir,
      exists: fs.existsSync(uploadDir),
      totalFiles: files.length,
      files: fileDetails
    });
  } catch (error) {
    console.error('Error getting uploads info:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});