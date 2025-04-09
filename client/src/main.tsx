import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { OfflineProvider } from "@/components/OfflineProvider";

// Add Font Awesome
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesome);

// Set document title
document.title = "Greenupp - AI-Driven Agricultural Solutions";

// Add Web App Manifest for PWA
const manifest = document.createElement("link");
manifest.rel = "manifest";
manifest.href = "/manifest.json";
document.head.appendChild(manifest);

// Add Theme Color for PWA
const themeColor = document.createElement("meta");
themeColor.name = "theme-color";
themeColor.content = "#00cc66"; // Primary green color
document.head.appendChild(themeColor);

// Add Apple Touch Icon for PWA
const appleIcon = document.createElement("link");
appleIcon.rel = "apple-touch-icon";
appleIcon.href = "/apple-touch-icon.png";
document.head.appendChild(appleIcon);

// Render the app with Offline Provider
createRoot(document.getElementById("root")!).render(
  <OfflineProvider>
    <App />
  </OfflineProvider>
);
