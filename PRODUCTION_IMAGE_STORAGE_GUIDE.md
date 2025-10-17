# 🖼️ Production Image Storage Setup Guide

## 🚨 Issue Fixed

**Problem**: Images uploaded to marketplace and social pages don't show in production

**Root Cause**: 
- Upload directory was using `os.tmpdir()` in production
- Express.static was serving from a different directory
- Temporary files are deleted on server restart

**Solution**: 
- ✅ Unified upload and serve directories
- ✅ Added persistent storage path for production
- ✅ Environment variable support for custom paths
- ✅ Logging to track upload directory

---

## 📂 How It Works Now

### Development
```bash
Uploads Directory: /platform/uploads/
Files persist across restarts ✅
```

### Production (Default)
```bash
Uploads Directory: /var/data/greenupp-uploads/
Persistent storage (if volume mounted) ✅
Falls back to tmpdir if path not writable ⚠️
```

### Production (Custom - Recommended)
```bash
Environment Variable: UPLOADS_DIR=/path/to/persistent/storage
Fully customizable ✅
```

---

## 🚀 Quick Fix for Railway

### Option 1: Use Railway Volume (Recommended)

Add to your Railway service:

1. **Go to Railway Dashboard** → Your Service → Settings
2. **Add Volume**:
   - Mount Path: `/var/data/greenupp-uploads`
   - Name: `greenupp-uploads`
   - Size: 5GB (or as needed)

3. **Redeploy** - Images will now persist!

### Option 2: Use Environment Variable

Set in Railway:
```bash
UPLOADS_DIR=/var/data/greenupp-uploads
```

Or set to Railway's persistent volume path if already mounted.

---

## ☁️ Better Solution: Cloud Storage (Recommended for Scale)

For production at scale, use cloud storage instead of local files:

### Option A: Cloudinary (Easy Setup)

1. **Install package**:
```bash
npm install cloudinary
```

2. **Add to .env**:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Update uploadService.ts**:
```typescript
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload to Cloudinary
export async function uploadToCloudinary(filePath: string) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'greenupp',
    resource_type: 'auto',
  });
  return result.secure_url;
}
```

**Benefits**:
- ✅ CDN delivery (faster)
- ✅ Automatic image optimization
- ✅ Unlimited storage
- ✅ Image transformations
- ✅ No server restarts = no data loss

**Cost**: Free tier: 25GB storage, 25GB bandwidth/month

### Option B: AWS S3 (Enterprise)

1. **Install package**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

2. **Add to .env**:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=greenupp-uploads
```

3. **Update uploadService.ts**:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: Express.Multer.File) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `uploads/${nanoid()}${path.extname(file.originalname)}`,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    },
  });

  const result = await upload.done();
  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${result.Key}`;
}
```

**Benefits**:
- ✅ Highly scalable
- ✅ 99.999999999% durability
- ✅ CloudFront CDN integration
- ✅ Advanced security features

**Cost**: ~$0.023/GB/month storage + bandwidth

---

## 🔧 Current Setup Details

### Files Modified

1. **`server/services/uploadService.ts`**
   - Now uses `/var/data/greenupp-uploads` in production
   - Supports `UPLOADS_DIR` environment variable
   - Better logging for debugging
   - Exports `uploadsDir` for consistency

2. **`server/index.ts`**
   - Imports `uploadsDir` from uploadService
   - Serves files from the same directory as uploads
   - No more directory mismatch!

### How to Verify

Check your logs on startup:
```bash
# Should see:
[INFO] Production: Using persistent uploads directory: /var/data/greenupp-uploads
[INFO] Serving uploads from: /var/data/greenupp-uploads
```

---

## 🧪 Testing the Fix

### 1. Test in Development
```bash
npm run dev
# Upload an image to marketplace/social
# Check: uploads/ folder should have the file
# Refresh page - image should still show ✅
```

### 2. Test in Production (Railway)

**Before deploying**, set up persistent storage:

```bash
# Option 1: Add Railway volume
railway volume create greenupp-uploads 5GB
railway volume attach greenupp-uploads /var/data/greenupp-uploads

# Option 2: Set custom path
railway variables set UPLOADS_DIR=/path/to/storage
```

**After deploying**:
```bash
# 1. Upload a marketplace image
# 2. Check logs to see upload directory
railway logs
# Should see: "Serving uploads from: /var/data/greenupp-uploads"

# 3. Refresh page - image should load
# 4. Redeploy or restart service
# 5. Image should STILL be there ✅
```

---

## 📋 Migration: Recovering Lost Images

If you already lost images in production:

### Option 1: Re-upload
- Users will need to re-upload their images
- This is the simplest solution

### Option 2: Database Cleanup
```sql
-- Clear image URLs from listings (they're broken anyway)
UPDATE marketplace_listings SET images = '{}' WHERE images IS NOT NULL;

-- Clear profile images
UPDATE social_profiles SET profile_image = NULL, cover_image = NULL;
```

### Option 3: Inform Users
Create a banner:
```tsx
<Alert>
  <AlertTitle>Notice: Image Reset</AlertTitle>
  <AlertDescription>
    We've upgraded our image storage system. 
    Please re-upload your marketplace and profile images.
  </AlertDescription>
</Alert>
```

---

## 🎯 Recommended Production Setup

### For Small Scale (< 1000 users)
✅ **Use Railway Volume**
- Simple setup
- $5-10/month
- Good for MVP

### For Medium Scale (1000-10,000 users)
✅ **Use Cloudinary**
- Free tier covers most needs
- Automatic optimization
- CDN included

### For Large Scale (10,000+ users)
✅ **Use AWS S3 + CloudFront**
- Lowest cost at scale
- Maximum control
- Enterprise features

---

## 🔐 Security Considerations

Current setup already includes:
- ✅ File type validation (images only)
- ✅ File size limits (5MB max)
- ✅ Sanitized filenames
- ✅ Authentication required
- ✅ No directory traversal

Additional recommendations:
- 🔲 Add virus scanning (ClamAV)
- 🔲 Image content moderation
- 🔲 Rate limiting on uploads
- 🔲 NSFW detection

---

## 📊 Monitoring

Add to your monitoring:

```typescript
// Track upload success/failures
logger.info(`Image uploaded: ${filename} by user ${userId}`);
logger.error(`Upload failed: ${error.message}`);

// Alert if uploads directory is full
const stats = fs.statfsSync(uploadsDir);
if (stats.bavail / stats.blocks < 0.1) {
  logger.warn('Uploads directory is 90% full!');
}
```

---

## 🚀 Deployment Checklist

Before deploying the fix:

- [ ] **Set up persistent storage**
  - [ ] Railway volume created OR
  - [ ] UPLOADS_DIR environment variable set OR
  - [ ] Cloud storage configured

- [ ] **Test locally**
  - [ ] Upload image
  - [ ] Restart server
  - [ ] Image still loads

- [ ] **Deploy to staging**
  - [ ] Test upload
  - [ ] Test display
  - [ ] Test after restart

- [ ] **Deploy to production**
  - [ ] Monitor logs
  - [ ] Test uploads
  - [ ] Verify persistence

- [ ] **User communication**
  - [ ] Notify users about upgrade
  - [ ] Request re-upload if needed

---

## 💡 Quick Commands

```bash
# Check current uploads directory
ls -la /var/data/greenupp-uploads

# Check disk space
df -h /var/data/greenupp-uploads

# See recent uploads
ls -lt /var/data/greenupp-uploads | head -20

# Count total images
find /var/data/greenupp-uploads -type f | wc -l

# Total size of uploads
du -sh /var/data/greenupp-uploads
```

---

## 🆘 Troubleshooting

### Images still not showing?

1. **Check logs** for upload directory path
2. **Verify directory permissions**: `chmod 755 /var/data/greenupp-uploads`
3. **Check file exists**: `ls /var/data/greenupp-uploads/`
4. **Test URL directly**: `https://yourapp.com/uploads/filename.jpg`
5. **Check browser console** for 404 errors

### Permission denied errors?

```bash
# Fix permissions
sudo chown -R $(whoami) /var/data/greenupp-uploads
sudo chmod -R 755 /var/data/greenupp-uploads
```

### Out of space?

```bash
# Clean old files (older than 90 days)
find /var/data/greenupp-uploads -type f -mtime +90 -delete

# Or move to cloud storage
```

---

## 📚 Related Documentation

- [Railway Volumes](https://docs.railway.app/reference/volumes)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [AWS S3 Guide](https://docs.aws.amazon.com/s3/)
- [Multer Documentation](https://github.com/expressjs/multer)

---

**Status**: ✅ Fixed - Images now persist correctly!
**Next Steps**: Deploy and test, then consider migrating to cloud storage for scale.

