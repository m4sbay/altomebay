"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
let transitionTimer: ReturnType<typeof setTimeout>;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  function toggleTheme() {
    const root = document.documentElement;
    // Read the applied theme so repeated clicks can interrupt the CSS transition.
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    clearTimeout(transitionTimer);
    root.dataset.themeTransition = "";
    setTheme(nextTheme);
    transitionTimer = setTimeout(() => delete root.dataset.themeTransition, 300);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Mode gelap"
      aria-pressed={mounted ? resolvedTheme === "dark" : false}
      disabled={!mounted}
      onClick={toggleTheme}
    >
      <Sun className="theme-icon theme-icon-sun" size={20} aria-hidden="true" />
      <Moon className="theme-icon theme-icon-moon" size={20} aria-hidden="true" />
    </button>
  );
}
