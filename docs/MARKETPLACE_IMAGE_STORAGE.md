# Marketplace listing image storage

## How it works

- **Database:** `marketplace_listings.images` is a **PostgreSQL text array**. We store **URLs only** (strings), not binary or base64.

- **Upload flow (create/update listing):**
  1. Client sends `POST /api/marketplace/listings` (or `PUT .../:id`) with **multipart/form-data**.
  2. Field name for files: **`images`**. Up to **5 images** per request (multer limit). Max file size **5MB** each.
  3. Server receives files via multer into `uploadsDir`, then:
     - **If Cloudinary is configured** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`): each file is uploaded to Cloudinary folder `greenupp/marketplace`, and the returned **Cloudinary URL** is stored. Temp file is deleted.
     - **Otherwise:** the **local URL** is stored: `{baseUrl}/uploads/{filename}` (e.g. `https://www.greenupp.earth/uploads/abc123.jpg`). Files remain on disk in `uploadsDir`.

- **Serving local uploads:** `GET /uploads/:filename` is served by Express from `uploadsDir` (see `server/index.ts`). So full URL for a local image is `API_BASE_URL + /uploads/ + filename`.

- **Where files live on disk:**
  - Env `UPLOADS_DIR` if set.
  - Else production: `/var/data/greenupp-uploads` (expect a mounted volume).
  - Else dev: project `uploads` directory.
  - Fallback: `os.tmpdir()/greenupp-uploads` (not persistent).

## Expo / mobile

- Use **FormData** and append image files with key **`images`** (same as web). Pick files with `expo-image-picker` (or similar); attach the file URIs as Blob/File so the request is multipart. Auth (session or Bearer) must be sent so `POST /api/marketplace/listings` accepts the request.
