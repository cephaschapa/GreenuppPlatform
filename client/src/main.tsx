import { createRoot } from "react-dom/client";
import "./index.css";

// Most basic React rendering without any external dependencies
const App = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-green-500 mb-4">Greenupp</h1>
      <p className="text-xl">AI-Driven Agricultural Solutions</p>
      <p className="mt-4 text-gray-400">
        Basic version for troubleshooting
      </p>
    </div>
  </div>
);

// Directly render without StrictMode or any providers
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
