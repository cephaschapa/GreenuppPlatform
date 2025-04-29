import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sql } from "drizzle-orm";
import { db } from "../db";

// Test upload and post creation flow
export const testUploadPostRouter = Router();

// Setup multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extname}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images, videos, docs
  const allowedMimeTypes = [
    // Images
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    // Videos 
    "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-ms-wmv",
    // Documents
    "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// GET test page
testUploadPostRouter.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Test Upload and Post Creation</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          form { margin-bottom: 30px; border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
          label { display: block; margin-bottom: 10px; }
          input[type="text"], textarea { width: 100%; padding: 8px; margin-bottom: 15px; }
          input[type="file"] { margin-bottom: 15px; }
          button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
          button:hover { background: #45a049; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Test Upload and Post Creation Flow</h1>
        
        <h2>1. Single File Upload</h2>
        <form action="/api/test/upload-post/upload-single" method="post" enctype="multipart/form-data">
          <label for="file">Select file:</label>
          <input type="file" id="file" name="file" required>
          <button type="submit">Upload Single File</button>
        </form>
        
        <h2>2. Multiple File Upload</h2>
        <form action="/api/test/upload-post/upload-multiple" method="post" enctype="multipart/form-data">
          <label for="files">Select multiple files:</label>
          <input type="file" id="files" name="files" multiple required>
          <button type="submit">Upload Multiple Files</button>
        </form>
        
        <h2>3. Create Post with Media</h2>
        <form id="createPostForm" action="/api/test/upload-post/create-post" method="post">
          <label for="content">Post content:</label>
          <textarea id="content" name="content" rows="4" required></textarea>
          
          <label for="mediaUrls">Media URLs (one per line):</label>
          <textarea id="mediaUrls" name="mediaUrls" rows="4" placeholder="Paste URLs from previous uploads, one per line"></textarea>
          
          <label for="postType">Post Type:</label>
          <input type="text" id="postType" name="postType" value="media" placeholder="media, text, etc.">
          
          <label for="visibility">Visibility:</label>
          <input type="text" id="visibility" name="visibility" value="public" placeholder="public, private, etc.">
          
          <button type="submit">Create Post</button>
        </form>
        
        <h2>4. Complete Flow (Upload and Create Post)</h2>
        <form id="completeForm" action="/api/test/upload-post/complete-flow" method="post" enctype="multipart/form-data">
          <label for="complete_content">Post content:</label>
          <textarea id="complete_content" name="content" rows="4" required></textarea>
          
          <label for="complete_files">Select multiple files:</label>
          <input type="file" id="complete_files" name="files" multiple>
          
          <label for="complete_postType">Post Type:</label>
          <input type="text" id="complete_postType" name="postType" value="media" placeholder="media, text, etc.">
          
          <label for="complete_visibility">Visibility:</label>
          <input type="text" id="complete_visibility" name="visibility" value="public" placeholder="public, private, etc.">
          
          <button type="submit">Upload and Create Post</button>
        </form>
        
        <div id="result">
          <h2>Result:</h2>
          <pre id="resultContent"></pre>
        </div>
        
        <script>
          // JavaScript to handle form submission and display result
          document.addEventListener('DOMContentLoaded', function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
              form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const resultDiv = document.getElementById('resultContent');
                
                try {
                  const response = await fetch(form.action, {
                    method: form.method,
                    body: formData
                  });
                  
                  const data = await response.json();
                  resultDiv.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                  resultDiv.textContent = 'Error: ' + error.message;
                }
              });
            });
          });
        </script>
      </body>
    </html>
  `);
});

// Single file upload
testUploadPostRouter.post("/upload-single", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  
  // Log file details
  console.log("File upload details:", {
    originalname: req.file.originalname,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
  
  // Construct URL for the uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    success: true,
    file: {
      url: fileUrl,
      type: req.file.mimetype.startsWith("image/") ? "image" : 
            req.file.mimetype.startsWith("video/") ? "video" : "document",
      caption: req.file.originalname
    }
  });
});

// Multiple files upload
testUploadPostRouter.post("/upload-multiple", upload.array("files", 10), (req, res) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  
  // Convert files to array if not already
  const files = Array.isArray(req.files) ? req.files : [req.files];
  
  // Log upload details
  console.log(`Received ${files.length} files`);
  
  // Process each file
  const mediaItems = files.map(file => {
    const fileUrl = `/uploads/${file.filename}`;
    
    return {
      url: fileUrl,
      type: file.mimetype.startsWith("image/") ? "image" : 
            file.mimetype.startsWith("video/") ? "video" : "document",
      caption: file.originalname
    };
  });
  
  res.json({
    success: true,
    files: mediaItems
  });
});

// Create post with media URLs
testUploadPostRouter.post("/create-post", async (req, res) => {
  try {
    const { content, mediaUrls, postType, visibility } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }
    
    // Parse media URLs from textarea (one per line)
    let media = [];
    if (mediaUrls && mediaUrls.trim()) {
      const urls = mediaUrls.split(/\r?\n/).filter(url => url.trim());
      
      media = urls.map(url => ({
        url: url.trim(),
        type: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : 
              url.match(/\.(mp4|mov|avi|wmv)$/i) ? "video" : "document",
        caption: path.basename(url)
      }));
    }
    
    // Log the post data
    console.log("Creating post with data:", {
      content,
      media,
      postType: postType || "text",
      visibility: visibility || "public"
    });
    
    // Use userId = 1 for testing
    const userId = 1;
    const now = new Date().toISOString();
    
    // Prepare the media for JSONB storage
    let mediaForStorage = null;
    if (media.length > 0) {
      try {
        mediaForStorage = sql`${JSON.stringify(media)}::jsonb`;
        console.log("Media prepared for SQL storage as JSONB");
      } catch (error) {
        console.error("Error preparing media for storage:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Error processing media data",
          error: error.message
        });
      }
    }
    
    // Insert post into database
    const insertResult = await db.execute(sql`
      INSERT INTO posts (
        user_id, content, post_type, visibility, media,
        like_count, comment_count, share_count, published_at, created_at, updated_at
      ) VALUES (
        ${userId}, 
        ${content}, 
        ${postType || "text"}, 
        ${visibility || "public"}, 
        ${mediaForStorage},
        0, 0, 0, ${now}, ${now}, ${now}
      )
      RETURNING id
    `);
    
    // Get the created post ID
    const postId = insertResult.rows[0].id;
    
    res.json({
      success: true,
      post: {
        id: postId,
        content,
        postType: postType || "text",
        visibility: visibility || "public",
        media,
        createdAt: now
      }
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating post",
      error: error.message
    });
  }
});

// Complete flow: upload files and create post in one step
testUploadPostRouter.post("/complete-flow", upload.array("files", 10), async (req, res) => {
  try {
    const { content, postType, visibility } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }
    
    // Process uploaded files
    let media = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      media = req.files.map(file => {
        const fileUrl = `/uploads/${file.filename}`;
        
        return {
          url: fileUrl,
          type: file.mimetype.startsWith("image/") ? "image" : 
                file.mimetype.startsWith("video/") ? "video" : "document",
          caption: file.originalname
        };
      });
    }
    
    // Log the post data
    console.log("Creating post with data:", {
      content,
      mediaCount: media.length,
      postType: postType || "text",
      visibility: visibility || "public"
    });
    
    // Use userId = 1 for testing
    const userId = 1;
    const now = new Date().toISOString();
    
    // Prepare the media for JSONB storage
    let mediaForStorage = null;
    if (media.length > 0) {
      try {
        mediaForStorage = sql`${JSON.stringify(media)}::jsonb`;
        console.log("Media prepared for SQL storage as JSONB");
      } catch (error) {
        console.error("Error preparing media for storage:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Error processing media data",
          error: error.message
        });
      }
    }
    
    // Insert post into database
    const insertResult = await db.execute(sql`
      INSERT INTO posts (
        user_id, content, post_type, visibility, media,
        like_count, comment_count, share_count, published_at, created_at, updated_at
      ) VALUES (
        ${userId}, 
        ${content}, 
        ${postType || "text"}, 
        ${visibility || "public"}, 
        ${mediaForStorage},
        0, 0, 0, ${now}, ${now}, ${now}
      )
      RETURNING id
    `);
    
    // Get the created post ID
    const postId = insertResult.rows[0].id;
    
    res.json({
      success: true,
      post: {
        id: postId,
        content,
        postType: postType || (media.length > 0 ? "media" : "text"),
        visibility: visibility || "public",
        media,
        createdAt: now
      }
    });
  } catch (error) {
    console.error("Error in complete flow:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error in upload and post creation flow",
      error: error.message
    });
  }
});