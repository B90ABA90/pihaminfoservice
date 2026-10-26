import { createContext, useContext, useEffect, type ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Site is light-only.
  const theme: Theme = "light";
  useEffect(() => {
    document.documentElement.classList.add("light");
  }, []);
  const setTheme = (_t: Theme) => undefined;
  const toggle = () => undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  // Fallback (e.g. during HMR or when used outside provider) — no-op theme controls
  return {
    theme: typeof document !== "undefined" && document.documentElement.classList.contains("light") ? "light" : "dark",
    toggle: () => {
      if (typeof document !== "undefined") document.documentElement.classList.toggle("light");
    },
    setTheme: (t) => {
      if (typeof document !== "undefined") document.documentElement.classList.toggle("light", t === "light");
    },
  };
};
