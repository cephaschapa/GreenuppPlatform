import { createRoot } from "react-dom/client";
import MinimalApp from "./MinimalApp";
import "./index.css";

// Set document title
document.title = "Greenupp - Minimal Test";

// Render a minimal app while we debug
createRoot(document.getElementById("root")!).render(
  <MinimalApp />
);
