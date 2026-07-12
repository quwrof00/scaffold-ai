"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { usePathname } from "next/navigation";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("scaffold-theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function resolve(t: Theme): "light" | "dark" {
      if (t === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return t;
    }

    function apply(t: Theme) {
      let resolved = resolve(t);
      if (pathname === "/login" || pathname === "/register") {
        resolved = "light";
      }
      setResolvedTheme(resolved);
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    }

    apply(theme);

    const listener = () => {
      if (theme === "system") apply("system");
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [theme, pathname]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("scaffold-theme", t);
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
