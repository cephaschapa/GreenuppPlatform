# 🚂 Railway: Fix Missing Images - Quick Guide

## 🎯 Problem

Images uploaded to marketplace and social pages don't show after server restarts on Railway.

## ✅ Solution

Add a persistent volume for image storage.

---

## 📋 Steps to Fix (5 minutes)

### Step 1: Add Volume in Railway Dashboard

1. Go to **Railway Dashboard** → Your Project → greenupp service
2. Click **Settings** tab
3. Scroll to **Volumes** section
4. Click **+ New Volume**

**Configure Volume**:

```
Mount Path: /var/data/greenupp-uploads
Size: 5 GB (or more as needed)
```

5. Click **Add**

### Step 2: Redeploy

Railway will automatically redeploy. If not:

```bash
# Trigger redeploy
railway up
```

### Step 3: Verify

Check logs:

```bash
railway logs
```

Look for:

```
[INFO] Production: Using persistent uploads directory: /var/data/greenupp-uploads
[INFO] Serving uploads from: /var/data/greenupp-uploads
```

### Step 4: Test

1. Upload an image to marketplace or social
2. Refresh page - image should show ✅
3. Redeploy or restart service
4. Image should STILL show ✅

---

## 🎨 Alternative: Use Cloudinary (Recommended)

Instead of Railway volumes, use Cloudinary for better performance and CDN:

### Quick Setup

1. **Sign up**: https://cloudinary.com (free tier is generous)

2. **Get credentials** from Cloudinary dashboard

3. **Add to Railway** environment variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
UPLOADS_STRATEGY=cloudinary
```

4. **Install package**:

```bash
npm install cloudinary
```

5. **Code changes** (I can help with this next!)

**Benefits over Railway Volumes**:

- ✅ Faster (CDN delivery)
- ✅ Automatic image optimization
- ✅ Image transformations (resize, crop, etc.)
- ✅ Better for scaling
- ✅ Free tier: 25GB storage

---

## 📊 Current Status

### What's Fixed

- ✅ Upload and serve directories now match
- ✅ Supports persistent storage path
- ✅ Environment variable support
- ✅ Better logging

### What You Need to Do

- [ ] Add Railway volume OR
- [ ] Set up Cloudinary OR
- [ ] Set UPLOADS_DIR environment variable

---

## 💰 Cost Comparison

| Solution           | Cost        | Ease          | Scale                | Performance  |
| ------------------ | ----------- | ------------- | -------------------- | ------------ |
| **Railway Volume** | $5-10/month | ⭐⭐⭐ Easy   | Good for < 10K users | Local speed  |
| **Cloudinary**     | Free (25GB) | ⭐⭐ Moderate | Excellent            | CDN speed ⚡ |
| **AWS S3**         | ~$0.023/GB  | ⭐ Complex    | Unlimited            | CDN speed ⚡ |

**Recommendation**: Start with **Railway Volume** now (5 min fix), migrate to **Cloudinary** later for better performance.

---

## 🚀 Deploy Now

```bash
# 1. Build the fix
npm run build

# 2. Commit changes
git add .
git commit -m "fix: Unified upload/serve directories for production images"

# 3. Push to Railway
git push

# 4. Add volume in Railway dashboard (see Step 1 above)

# 5. Wait for deploy and test!
```

---

## 🆘 Need Help?

### Images still not showing?

- Check Railway logs: `railway logs`
- Verify volume is mounted: Check Railway dashboard
- Test upload endpoint: `POST /api/uploads/single`
- Check file permissions in Railway shell

### Want to migrate to Cloudinary?

Let me know and I'll help you implement it! It's the best long-term solution.

---

**Quick Win**: Add Railway volume now = Images work immediately! 🎉
