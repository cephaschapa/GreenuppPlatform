import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { register as registerServiceWorker } from './service-worker-registration';
import { registerOnlineStatusHandlers } from './lib/apiWrapper';

// Add Font Awesome
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesome);

// Set document title
document.title = "Greenupp - AI-Driven Agricultural Solutions";

// Register service worker for PWA functionality
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}

// Register network status event handlers
registerOnlineStatusHandlers();

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
