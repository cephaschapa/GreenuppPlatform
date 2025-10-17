# ☁️ Cloudinary Image Storage Setup Guide

## 🎯 Overview

This guide walks you through setting up Cloudinary for GreenUpp's image storage. Cloudinary provides:

- ✅ **CDN delivery** - Images load faster worldwide
- ✅ **Auto-optimization** - Automatic format (WebP) and quality optimization
- ✅ **Image transformations** - Resize, crop, filters on-the-fly
- ✅ **Free tier** - 25GB storage, 25GB bandwidth/month
- ✅ **No server restarts** - Images never lost
- ✅ **Scalable** - Handles millions of images

---

## 📋 Setup Steps

### Step 1: Create Cloudinary Account (2 minutes)

1. Go to https://cloudinary.com
2. Click **Sign Up Free**
3. Fill in your details
4. Verify your email
5. You'll be redirected to the dashboard ✅

### Step 2: Get Your Credentials (1 minute)

On the Cloudinary Dashboard, you'll see:

```
Cloud Name: your_cloud_name
API Key: 123456789012345
API Secret: ABC123XYZ456etc
```

**Copy these!** You'll need them in the next step.

### Step 3: Add to Railway Environment Variables (2 minutes)

1. Go to **Railway Dashboard** → Your Project → greenupp service
2. Click **Variables** tab
3. Add these three variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=ABC123XYZ456etc
```

4. Railway will automatically redeploy ✅

### Step 4: Verify Setup (1 minute)

After Railway redeploys, check the logs:

```bash
railway logs
```

Look for:

```
✅ Cloudinary configured successfully
```

That's it! Cloudinary is now active! 🎉

---

## 🧪 Testing

### 1. Test Upload

1. Go to your app and upload an image:

   - Marketplace listing
   - Social profile picture
   - Social post image

2. Check Railway logs:

   ```
   [INFO] Uploading to Cloudinary: image.jpg
   [INFO] Image uploaded to Cloudinary: greenupp/marketplace/abc123
   [INFO] File uploaded to Cloudinary: https://res.cloudinary.com/...
   ```

3. The image URL should be a Cloudinary URL:
   ```
   https://res.cloudinary.com/your_cloud_name/image/upload/...
   ```

### 2. Test Display

1. Refresh the page
2. Image should load ✅
3. Check browser DevTools Network tab
4. Image should come from `cloudinary.com` domain

### 3. Test Persistence

1. Restart your Railway service
2. Images should STILL load ✅
3. No data loss!

---

## 📊 What's Implemented

### New Files

**`server/services/cloudinaryService.ts`** - Cloudinary integration

- `uploadImage()` - Upload local file
- `uploadMultiple()` - Upload multiple files
- `uploadFromBase64()` - Upload base64 encoded image
- `uploadFromBuffer()` - Upload from memory buffer
- `deleteImage()` - Delete image from Cloudinary
- `getThumbnailUrl()` - Generate thumbnail URLs
- `getOptimizedUrl()` - Get optimized version

### Updated Files

**`server/routes/upload-routes.ts`**

- ✅ Auto-detects Cloudinary configuration
- ✅ Uses Cloudinary when configured
- ✅ Falls back to local storage if not configured
- ✅ Supports folder organization (marketplace, social, profiles)
- ✅ Added base64 upload endpoint

### Upload Endpoints

```
POST /api/uploads/single
- Upload single file (multipart/form-data)
- Body: file (form data), folder (optional)
- Returns: { fileUrl, file: { url, ... } }

POST /api/uploads/multiple
- Upload multiple files (max 5)
- Body: files (form data), folder (optional)
- Returns: { files: [{ url, ... }] }

POST /api/uploads/base64
- Upload base64 encoded image
- Body: { base64, folder }
- Returns: { fileUrl, file: { url, ... } }
```

---

## 🎨 Features & Benefits

### Automatic Optimizations

**Every image uploaded gets**:

- ✅ Format auto-conversion (WebP for supported browsers)
- ✅ Quality optimization (smaller file size, same quality)
- ✅ Size limits (max 1920x1920 to save bandwidth)
- ✅ Lazy loading support

### On-the-Fly Transformations

Generate thumbnails without storing multiple versions:

```typescript
// Original image
https://res.cloudinary.com/demo/image/upload/sample.jpg

// 300x300 thumbnail (auto-generated)
https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill/sample.jpg

// Optimized for web
https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/sample.jpg
```

**Use in your code**:

```tsx
import { CloudinaryService } from "@/services/cloudinaryService";

// Get thumbnail
const thumbUrl = CloudinaryService.getThumbnailUrl(imageUrl, 200, 200);

// Get optimized
const optimizedUrl = CloudinaryService.getOptimizedUrl(imageUrl);
```

### Folder Organization

Images are organized by type:

```
greenupp/
├── marketplace/     - Product listings
├── social/          - Social posts
├── profiles/        - User avatars
├── crops/           - Crop photos
└── general/         - Everything else
```

---

## 💰 Pricing & Limits

### Free Tier (Perfect for MVP)

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Cost**: $0

**This is plenty for**:

- ~25,000 high-quality images
- ~100,000 monthly views
- Small to medium user base

### Paid Plans (When You Scale)

| Plan         | Storage | Bandwidth | Cost/Month |
| ------------ | ------- | --------- | ---------- |
| **Free**     | 25 GB   | 25 GB     | $0         |
| **Plus**     | 50 GB   | 50 GB     | $99        |
| **Advanced** | 100 GB  | 100 GB    | $249       |

You can start free and upgrade as needed!

---

## 🔧 Advanced Configuration

### Custom Transformations

Add to `.env` for custom defaults:

```env
# Auto-optimize all images
CLOUDINARY_DEFAULT_QUALITY=auto

# Convert to WebP when possible
CLOUDINARY_AUTO_FORMAT=true

# Add watermark to all uploads (optional)
CLOUDINARY_WATERMARK_TEXT=GreenUpp
```

### Security

Cloudinary uploads are:

- ✅ Authenticated (requires login)
- ✅ Type-validated (images only)
- ✅ Size-limited (5MB max)
- ✅ Auto-scanned for malware

### Backup

Cloudinary includes:

- ✅ Automatic backups
- ✅ Version history
- ✅ 99.95% uptime SLA
- ✅ Disaster recovery

---

## 📈 Migration Path

### Current Users with Local Images

**Option 1: Start Fresh**

- Keep existing local images
- New uploads go to Cloudinary
- Gradually migrate old images

**Option 2: Migrate Existing**

```bash
# Script to migrate existing uploads to Cloudinary
node scripts/migrate-to-cloudinary.js
```

I can create this script if needed!

---

## 🚀 Going Live Checklist

### Before Deployment

- [x] Cloudinary package installed
- [x] CloudinaryService created
- [x] Upload routes updated
- [ ] Cloudinary account created
- [ ] Environment variables set in Railway
- [ ] Tested locally (optional)

### After Deployment

- [ ] Check logs for "Cloudinary configured"
- [ ] Upload test image
- [ ] Verify image loads
- [ ] Check Cloudinary dashboard for upload
- [ ] Test image persistence (restart service)

### Verification Commands

```bash
# Check Railway logs
railway logs | grep -i cloudinary

# Should see:
# ✅ Cloudinary configured successfully
# [INFO] Uploading to Cloudinary: image.jpg
# [INFO] Image uploaded to Cloudinary: greenupp/marketplace/xyz123
```

---

## 🎨 Usage Examples

### In Upload Forms

**Marketplace Listing**:

```tsx
const formData = new FormData();
formData.append("file", file);
formData.append("folder", "marketplace"); // Organizes in Cloudinary

const response = await fetch("/api/uploads/single", {
  method: "POST",
  body: formData,
});

const { fileUrl } = await response.json();
// fileUrl is now a Cloudinary URL with CDN ✅
```

**Social Post**:

```tsx
formData.append("folder", "social");
// Image goes to greenupp/social/ folder
```

**Profile Picture**:

```tsx
formData.append("folder", "profiles");
// Image goes to greenupp/profiles/ folder
```

### Display Optimized Images

```tsx
// In your component
<img
  src={imageUrl} // Works for both local and Cloudinary URLs
  alt="Product"
  loading="lazy"
/>

// For better performance, use optimized URL
<img
  src={CloudinaryService.getOptimizedUrl(imageUrl)}
  alt="Product"
  loading="lazy"
/>

// Generate thumbnail
<img
  src={CloudinaryService.getThumbnailUrl(imageUrl, 300, 300)}
  alt="Thumbnail"
/>
```

---

## 🔄 Rollback Plan

If you need to go back to local storage:

1. **Remove environment variables** from Railway:

   ```bash
   # In Railway Dashboard > Variables
   # Delete: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
   ```

2. **Redeploy** - Will automatically fall back to local storage

3. **Add Railway volume** (if not already done)

**Note**: Images in Cloudinary will remain accessible even after rollback!

---

## 📊 Monitoring & Analytics

### Cloudinary Dashboard

After setup, you can monitor:

- Total images uploaded
- Storage used
- Bandwidth used
- Most popular images
- Transformation usage

### Alerts

Set up alerts in Cloudinary for:

- 80% of free tier limit reached
- Unusual bandwidth spikes
- Failed uploads

---

## 🆘 Troubleshooting

### Issue: "Cloudinary is not configured"

**Solution**: Check environment variables

```bash
railway variables

# Should show:
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

### Issue: Upload fails with "Invalid credentials"

**Solution**: Double-check credentials in Cloudinary dashboard

- Cloud Name should not have spaces
- API Key should be numbers only
- API Secret is case-sensitive

### Issue: Images still go to local storage

**Solution**: Check logs for Cloudinary configuration

```bash
railway logs | grep Cloudinary

# Should see:
# ✅ Cloudinary configured successfully
```

If you see the warning instead, environment variables aren't set correctly.

### Issue: Can't delete images

**Solution**: Make sure you're storing the `publicId` when saving to database

```typescript
// When saving listing
const { fileUrl, file } = await uploadResponse.json();
await db.insert(listings).values({
  images: [fileUrl],
  imageIds: [file.publicId], // Store this for deletion
});

// When deleting
if (listing.imageIds) {
  await Promise.all(
    listing.imageIds.map((id) => CloudinaryService.deleteImage(id))
  );
}
```

---

## 🎯 Next Steps

### Immediate (After Setup)

1. ✅ Set up Cloudinary account
2. ✅ Add environment variables
3. ✅ Verify in logs
4. ✅ Test uploads

### Soon (Performance)

1. Add image optimization component
2. Implement lazy loading
3. Use responsive images
4. Add blur placeholders

### Later (Advanced)

1. Add video support
2. Implement image moderation
3. Add user-generated transformations
4. Set up backup/archive

---

## 💡 Pro Tips

### 1. Use Folders for Organization

```tsx
// Marketplace images
formData.append("folder", "marketplace");

// Profile pictures
formData.append("folder", "profiles");

// Crop photos
formData.append("folder", "crops");
```

### 2. Generate Thumbnails On-The-Fly

```tsx
// No need to upload multiple sizes!
const original = imageUrl;
const thumb = CloudinaryService.getThumbnailUrl(imageUrl, 150, 150);
const medium = CloudinaryService.getThumbnailUrl(imageUrl, 500, 500);
```

### 3. Monitor Usage

Check Cloudinary dashboard weekly to track:

- Storage growth
- Bandwidth usage
- When to upgrade tier

### 4. Set Transform Defaults

Cloudinary auto-optimizes by default:

- WebP for supported browsers
- Quality: auto
- Format: auto

---

## 📚 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Upload Widget](https://cloudinary.com/documentation/upload_widget)

---

## ✅ Summary

**What's Done**:

- ✅ Cloudinary package installed
- ✅ CloudinaryService created
- ✅ Upload routes updated (auto-detects Cloudinary)
- ✅ Supports both local and cloud storage
- ✅ Base64 uploads supported
- ✅ Multiple upload strategies
- ✅ Folder organization

**What You Need to Do**:

1. Create Cloudinary account (2 min)
2. Add 3 environment variables to Railway (1 min)
3. Redeploy and test (2 min)

**Total Setup Time**: ~5 minutes

**Result**: Production-ready image storage with CDN! 🚀

---

**Ready to go live?** Just add those 3 environment variables to Railway and you're done!
