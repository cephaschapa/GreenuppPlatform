import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Google Fonts
const addGoogleFont = (family: string) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  document.head.appendChild(link);
};

// Load the fonts
addGoogleFont("Space+Grotesk:wght@400;500;600;700");
addGoogleFont("Inter:wght@300;400;500;600;700");
addGoogleFont("Roboto+Mono:wght@400;500");

// Add Font Awesome
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesome);

// Set document title
document.title = "Greenupp - AI-Driven Agricultural Solutions";

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
