import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.greenupp.app",
  appName: "GreenUpp",
  webDir: "dist/public",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#059669",
      showSpinner: true,
      androidSpinnerStyle: "small",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
