# GreenUpp Mobile App Setup Guide

## Overview

Convert your existing React/Vite PWA into a native Android app using Capacitor. This approach:

- ✅ Reuses 100% of your existing code
- ✅ No rewrite needed
- ✅ Access to native features (camera, GPS, notifications)
- ✅ Can publish to Google Play Store
- ✅ Offline-first capabilities
- ✅ Better performance than browser

## Option 1: Capacitor (RECOMMENDED) ⭐

### Why Capacitor?

- Modern, actively maintained by Ionic team
- Works seamlessly with existing React apps
- Better than Cordova (predecessor)
- Great documentation and community
- Native plugin ecosystem

### Installation Steps

#### 1. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npx cap init
```

When prompted:

- **App name**: GreenUpp
- **App ID**: com.greenupp.app (reverse domain)
- **Web directory**: dist/public

#### 2. Update package.json

```json
{
  "scripts": {
    "build:mobile": "vite build && cap sync",
    "android:dev": "cap open android",
    "android:run": "cap run android",
    "android:build": "npm run build:mobile && cd android && ./gradlew assembleRelease"
  }
}
```

#### 3. Configure Capacitor

Create `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.greenupp.app",
  appName: "GreenUpp",
  webDir: "dist/public",
  server: {
    androidScheme: "https",
    cleartext: true, // For local development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#059669", // Your green color
      showSpinner: true,
      androidSpinnerStyle: "small",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
```

#### 4. Add Android Platform

```bash
npx cap add android
```

This creates an `android/` folder with native Android project.

#### 5. Build Web Assets

```bash
npm run build
```

#### 6. Sync to Android

```bash
npx cap sync android
```

#### 7. Open Android Studio

```bash
npx cap open android
```

Android Studio will open. Click "Run" to test on emulator or connected device.

### Build APK for Distribution

#### Debug APK (for testing)

```bash
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release APK (for distribution)

```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Sign APK for Play Store

#### 1. Generate Keystore

```bash
keytool -genkey -v -keystore greenupp-release.keystore -alias greenupp -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=greenupp
storeFile=../greenupp-release.keystore
```

#### 3. Update `android/app/build.gradle`

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 4. Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

### Recommended Capacitor Plugins

```bash
# Core plugins
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard
npm install @capacitor/network @capacitor/splash-screen @capacitor/status-bar

# Useful for farming app
npm install @capacitor/camera @capacitor/geolocation @capacitor/filesystem
npm install @capacitor/share @capacitor/push-notifications

# Sync after installing plugins
npx cap sync
```

### Update Your Code for Mobile

```typescript
// src/lib/capacitor.ts
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'android', 'ios', or 'web'

// Example: Use native camera
import { Camera, CameraResultType } from "@capacitor/camera";

async function takePicture() {
  if (!isNative) {
    // Use web camera API
    return;
  }

  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
  });

  return image.webPath;
}
```

## Option 2: TWA (Trusted Web Activity)

If you just want a quick APK wrapper without native features:

### Using Bubblewrap (Google's TWA generator)

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize TWA
bubblewrap init --manifest https://greenupp.app/manifest.json

# Build APK
bubblewrap build

# Output: app-release-signed.apk
```

**Pros:**

- ✅ 5-minute setup
- ✅ No code changes
- ✅ Automatic PWA features

**Cons:**

- ❌ No native API access
- ❌ Limited customization
- ❌ Requires HTTPS domain

## Option 3: React Native (NOT RECOMMENDED for now)

Would require complete rewrite. Only consider if:

- Need complex native features
- Want iOS app too
- Have 3+ months for rewrite

## Performance Optimizations for Mobile App

### 1. Update Vite Config for Mobile

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: "es2015", // Better mobile browser support
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
  },
});
```

### 2. Add Mobile-Specific Styles

```css
/* src/index.css */
@media (max-width: 768px) {
  /* Increase touch target sizes */
  button,
  a {
    min-height: 44px;
    min-width: 44px;
  }

  /* Prevent zoom on input focus */
  input,
  textarea,
  select {
    font-size: 16px;
  }
}
```

### 3. Handle Mobile-Specific Features

```typescript
// src/hooks/use-mobile.ts
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export function useMobile() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  return {
    isNative,
    platform: Capacitor.getPlatform(),
    isAndroid: Capacitor.getPlatform() === "android",
  };
}
```

## Android App Manifest Configuration

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:label="GreenUpp"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## App Icons and Splash Screen

### Generate Icons

1. Create 1024x1024 PNG of your logo
2. Use https://icon.kitchen/ or https://appicon.co/
3. Place generated icons in `android/app/src/main/res/`

Or use Capacitor asset generator:

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --android
```

Place your assets in:

- `assets/icon.png` (1024x1024)
- `assets/splash.png` (2732x2732)

## Testing Strategy

### 1. Test in Browser

```bash
npm run dev
```

### 2. Test in Android Emulator

```bash
npm run build
npx cap sync
npx cap run android
```

### 3. Test on Real Device

1. Enable USB debugging on Android device
2. Connect via USB
3. Run: `npx cap run android --target YOUR_DEVICE_ID`

### 4. Test Release Build

```bash
cd android
./gradlew installRelease
```

## Publishing to Google Play Store

### 1. Create Play Console Account

- Cost: $25 one-time fee
- URL: https://play.google.com/console

### 2. Prepare App Bundle (Better than APK)

```bash
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 3. Create Store Listing

Required:

- App title: "GreenUpp - Smart Farming for Zambia"
- Short description (80 chars)
- Full description (4000 chars)
- Screenshots (at least 2)
- Feature graphic (1024x500)
- App icon (512x512)
- Privacy policy URL

### 4. Upload AAB

1. Go to Play Console → Your App → Production
2. Create new release
3. Upload `app-release.aab`
4. Fill in release notes
5. Submit for review

Review typically takes 1-3 days.

## Quick Start Commands

```bash
# First time setup
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android

# Daily development
npm run build              # Build web assets
npx cap sync              # Sync to Android
npx cap open android      # Open in Android Studio

# Build APK
cd android
./gradlew assembleDebug   # For testing
./gradlew assembleRelease # For distribution

# Build App Bundle (for Play Store)
./gradlew bundleRelease
```

## Troubleshooting

### Issue: Blank white screen

**Solution**: Check `capacitor.config.ts` webDir points to correct build output

### Issue: API calls fail

**Solution**: Add CORS headers to your Railway backend for mobile app domain

### Issue: Geolocation not working

**Solution**: Add permissions to AndroidManifest.xml

### Issue: Large APK size

**Solution**: Enable ProGuard and split APKs by architecture

## Estimated Timeline

| Task              | Time          |
| ----------------- | ------------- |
| Install Capacitor | 15 min        |
| Configure Android | 30 min        |
| Test in emulator  | 15 min        |
| Add app icons     | 30 min        |
| Build & sign APK  | 30 min        |
| Play Store setup  | 2 hours       |
| **Total**         | **4-5 hours** |

## Next Steps

1. **Now**: Install Capacitor and test basic build
2. **This week**: Add mobile-specific optimizations
3. **This month**: Publish to Play Store
4. **Future**: Add iOS support (requires Mac)

## Cost Breakdown

- Capacitor: **FREE** ✅
- Android Studio: **FREE** ✅
- Play Store account: **$25** (one-time)
- Code signing certificate: **FREE** (self-signed) ✅
- **Total**: **$25**

## Recommendation

Start with **Capacitor** approach:

1. ✅ Works with your existing code
2. ✅ 4-5 hours to first APK
3. ✅ Can add native features later
4. ✅ Professional app experience
5. ✅ Publish to Play Store

Avoid TWA unless you need a super quick wrapper (but limited features).

**Want me to start the Capacitor setup now?** I can initialize it and create the Android project for you. 🚀📱
