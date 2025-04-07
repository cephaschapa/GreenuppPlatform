import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import custom fonts
const spaceGrotesk = new FontFace(
  "Space Grotesk",
  "url(https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap)"
);
const inter = new FontFace(
  "Inter",
  "url(https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap)"
);
const robotoMono = new FontFace(
  "Roboto Mono",
  "url(https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap)"
);

// Load the fonts
Promise.all([spaceGrotesk.load(), inter.load(), robotoMono.load()]).then(() => {
  document.fonts.add(spaceGrotesk);
  document.fonts.add(inter);
  document.fonts.add(robotoMono);
});

// Add Font Awesome
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesome);

// Set document title
document.title = "Greenupp - AI-Driven Agricultural Solutions";

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
