import { Router } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const testUploadRouter = Router();

// Route to check if uploads directory exists and is accessible
testUploadRouter.get('/api/test-uploads', (req, res) => {
  try {
    // Create the uploads directory path
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Check if directory exists
    let exists = false;
    let isDirectoryAccessible = false;
    
    try {
      exists = fs.existsSync(uploadsDir);
      
      // Check if directory is accessible by attempting to read its contents
      if (exists) {
        fs.readdirSync(uploadsDir);
        isDirectoryAccessible = true;
      }
    } catch (error) {
      console.error('Error checking uploads directory:', error);
    }
    
    res.json({
      success: true,
      uploadsDirExists: exists,
      isDirectoryAccessible,
      uploadsPath: uploadsDir,
      message: exists && isDirectoryAccessible 
        ? 'Uploads directory exists and is accessible' 
        : 'Issue with uploads directory'
    });
  } catch (error) {
    console.error('Error in test-uploads endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});