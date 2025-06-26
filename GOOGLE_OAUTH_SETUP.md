# Google OAuth Setup Guide

## Problem

The error "Unknown authentication strategy 'google'" occurs in production because the Google OAuth environment variables are not set, so the strategy is never registered.

## Solution

You need to set the following environment variables in your Railway production environment:

### Required Environment Variables

1. `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
2. `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

## How to Set Environment Variables in Railway

### Option 1: Railway Dashboard (Recommended)

1. Go to your Railway project dashboard
2. Navigate to your service
3. Click on the "Variables" tab
4. Add the following variables:
   - `GOOGLE_CLIENT_ID` = your_google_client_id_here
   - `GOOGLE_CLIENT_SECRET` = your_google_client_secret_here
5. Click "Save" and redeploy your service

### Option 2: Railway CLI

```bash
# Install Railway CLI if you haven't already
npm install -g @railway/cli

# Login to Railway
railway login

# Set environment variables
railway variables set GOOGLE_CLIENT_ID=your_google_client_id_here
railway variables set GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Deploy the changes
railway up
```

## Getting Google OAuth Credentials

If you don't have Google OAuth credentials yet:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - **Name**: Greenupp OAuth Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - `https://your-production-domain.com/api/auth/google/callback` (for production)
5. Click "Create"
6. Copy the Client ID and Client Secret

### Step 3: Set Environment Variables

Use the Client ID and Client Secret you just created to set the environment variables as described above.

## Verification

After setting the environment variables:

1. **Check if strategy is registered**:

   ```bash
   # Add this to your server logs temporarily
   console.log('Google OAuth Strategy:', !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET);
   ```

2. **Test the OAuth flow**:
   - Try logging in with Google on your production site
   - Check the server logs for any errors

## Troubleshooting

### Common Issues:

1. **"Unknown authentication strategy 'google'"** - Environment variables not set
2. **"Invalid redirect URI"** - Redirect URI not configured in Google Console
3. **"Invalid client"** - Client ID/Secret mismatch

### Debug Steps:

1. Check if environment variables are loaded:

   ```javascript
   console.log("GOOGLE_CLIENT_ID:", !!process.env.GOOGLE_CLIENT_ID);
   console.log("GOOGLE_CLIENT_SECRET:", !!process.env.GOOGLE_CLIENT_SECRET);
   ```

2. Verify the strategy registration in `server/auth.ts`:
   ```javascript
   // This should be true if variables are set
   if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
     console.log("Registering Google OAuth strategy");
     // ... strategy registration
   } else {
     console.log(
       "Google OAuth credentials not found, skipping strategy registration"
     );
   }
   ```

## Security Notes

- Never commit your OAuth secrets to version control
- Use different OAuth credentials for development and production
- Regularly rotate your OAuth secrets
- Monitor OAuth usage in Google Cloud Console

## Next Steps

After setting up Google OAuth:

1. Test the authentication flow
2. Set up Facebook OAuth if needed (similar process)
3. Configure additional OAuth providers as required
