# Google Maps Setup Guide

## Overview

The Admin User Map feature requires a Google Maps API key to display interactive maps with user locations, farm fields, and pest outbreak data.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for interactive maps)
   - **Places API** (for location search)
   - **Geocoding API** (for address conversion)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. Configure API Key Restrictions (Recommended)

#### Application Restrictions:

- **HTTP referrers (web sites)**
- Add your domains:
  - `localhost:3000/*` (for development)
  - `localhost:5000/*` (for production build)
  - `your-production-domain.com/*`
  - `*.railway.app/*` (if using Railway)

#### API Restrictions:

Enable only the APIs you need:

- Maps JavaScript API
- Places API
- Geocoding API

### 3. Add Environment Variable

Add to your `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Note**: The `VITE_` prefix is required for Vite to expose the variable to the client.

### 4. Verify Setup

1. Restart your development server
2. Go to Admin Dashboard → "User Map" tab
3. You should see an interactive map with user location pins

## Features

### 🗺️ **Interactive Map**

- **Multiple map types**: Roadmap, Satellite, Hybrid, Terrain
- **Zoom and pan**: Full Google Maps navigation
- **Responsive design**: Works on desktop and mobile

### 📍 **User Location Pins**

- **Color-coded markers**:
  - 🟢 Green: Active farmers
  - 🔵 Blue: Active users (buyers, etc.)
  - 🔴 Red: Admin users
  - ⚫ Gray: Inactive users
- **Click for details**: User info, farm details, recent activity

### 🌾 **Farm Field Visualization**

- **Purple markers**: Individual farm fields
- **Field boundaries**: GeoJSON polygon support
- **Field details**: Name, size, owner information

### 🔍 **Advanced Filters**

- **User type**: All, Farmers, Buyers, Admins
- **Activity status**: Active, Inactive, All
- **Country**: Filter by specific countries
- **Search**: Find users by name, email, or farm name

### 📊 **Real-time Statistics**

- **Total users**: Complete user count
- **Active users**: Users active in last 30 days
- **Farmer count**: Agricultural users
- **Geographic spread**: Countries represented

### 🐛 **Pest Integration** (Optional)

- **Pest report overlay**: Show recent pest detections
- **Outbreak clusters**: Visualize pest outbreak areas
- **Risk assessment**: Color-coded threat levels

## Troubleshooting

### Map Not Loading

- Check browser console for API key errors
- Verify API key has correct restrictions
- Ensure all required APIs are enabled

### No User Pins

- Check if users have location data in `device_sessions`
- Verify backend API endpoints are working
- Check browser network tab for API errors

### Performance Issues

- User query is limited to 1000 users for performance
- Consider adding pagination for large datasets
- Implement clustering for dense marker areas

## Security Notes

- **Never commit API keys** to version control
- **Use domain restrictions** to prevent unauthorized usage
- **Monitor API usage** in Google Cloud Console
- **Set billing alerts** to avoid unexpected charges

## Cost Considerations

Google Maps pricing (as of 2024):

- **Maps JavaScript API**: $7 per 1,000 requests
- **First 28,500 requests/month**: FREE
- **Places API**: $17 per 1,000 requests (first 100/month free)

For typical admin usage, you'll likely stay within free tier limits.
