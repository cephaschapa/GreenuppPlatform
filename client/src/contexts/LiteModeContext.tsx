import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LiteModeContextType {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
  setLiteMode: (enabled: boolean) => void;
}

const LiteModeContext = createContext<LiteModeContextType | null>(null);

export function LiteModeProvider({ children }: { children: ReactNode }) {
  const [isLiteMode, setIsLiteMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("greenupp_lite_mode");
    return saved === "true";
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem("greenupp_lite_mode", String(isLiteMode));
    
    // Add data attribute to body for CSS targeting
    if (isLiteMode) {
      document.body.setAttribute("data-lite-mode", "true");
    } else {
      document.body.removeAttribute("data-lite-mode");
    }
  }, [isLiteMode]);

  const toggleLiteMode = () => {
    setIsLiteMode(prev => !prev);
  };

  const setLiteMode = (enabled: boolean) => {
    setIsLiteMode(enabled);
  };

  return (
    <LiteModeContext.Provider value={{ isLiteMode, toggleLiteMode, setLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
}

export function useLiteMode() {
  const context = useContext(LiteModeContext);
  if (!context) {
    throw new Error("useLiteMode must be used within a LiteModeProvider");
  }
  return context;
}

