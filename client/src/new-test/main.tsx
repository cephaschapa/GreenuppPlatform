import { createRoot } from "react-dom/client";
import App from "./App";

// Set document title
document.title = "Greenupp - Test";

// Simple render with no providers or hooks
createRoot(document.getElementById("root")!).render(
  <App />
);