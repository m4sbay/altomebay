/**
 * Hooks — Custom React Hooks
 *
 * Koleksi custom hooks yang bisa dipakai ulang di seluruh project.
 * Ikuti konvensi: nama hook dimulai dengan `use`.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────
// useIsMobile
// Deteksi viewport mobile — dari HeroWidgets.tsx
// ─────────────────────────────────────────────
export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

// ─────────────────────────────────────────────
// useMediaQuery
// Generic media query hook
// ─────────────────────────────────────────────
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// ─────────────────────────────────────────────
// useInterval
// Safe interval dengan cleanup otomatis
// ─────────────────────────────────────────────
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => savedCallback.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ─────────────────────────────────────────────
// useLocalStorage
// Persist state ke localStorage
// ─────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error("useLocalStorage error:", error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}

// ─────────────────────────────────────────────
// useClickOutside
// Deteksi klik di luar elemen — untuk dropdown, modal
// ─────────────────────────────────────────────
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);

  return ref;
}

// ─────────────────────────────────────────────
// useKeyPress
// Deteksi tombol keyboard
// ─────────────────────────────────────────────
export function useKeyPress(targetKey: string, callback: () => void) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === targetKey) callback();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [targetKey, callback]);
}

// ─────────────────────────────────────────────
// useToggle
// Boolean toggle yang simpel
// ─────────────────────────────────────────────
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}

// ─────────────────────────────────────────────
// useCopyToClipboard
// Copy text ke clipboard dengan feedback state
// ─────────────────────────────────────────────
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      } catch {
        console.error("Copy failed");
      }
    },
    [resetDelay],
  );

  return { copied, copy };
}

// ─────────────────────────────────────────────
// useScrollY
// Track posisi scroll — untuk efek parallax / navbar
// ─────────────────────────────────────────────
export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

// ─────────────────────────────────────────────
// useInView
// Deteksi apakah elemen masuk viewport — untuk animasi
// ─────────────────────────────────────────────
export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}
