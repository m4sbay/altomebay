"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from "@/components/ui/Button";
import { storeConfig } from "@/lib/content";
import { buildWhatsAppLink } from "@/lib/links";
import { trackEvent } from "@/lib/analytics";

export function Nav() {
  const navbarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navbar = navbarRef.current;
    const logo = logoRef.current;
    const button = buttonRef.current;
    if (!navbar || !logo || !button) return;

    let isCentered = true;

    // Helper to safely get the numeric value of a GSAP property and avoid NaN calculations
    const getNumProperty = (el: HTMLElement, prop: string): number => {
      const val = gsap.getProperty(el, prop);
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return parseFloat(val) || 0;
      return 0;
    };

    // Calculate translation coordinates using viewport bounds to shift items from center to the very edges of the screen
    const getSideOffsets = () => {
      const rect_nav = navbar.getBoundingClientRect();
      const rect_logo = logo.getBoundingClientRect();
      const rect_btn = button.getBoundingClientRect();

      const padding = window.innerWidth >= 640 ? 24 : 16; // matching sm:px-6 (24px) vs px-4 (16px)

      // Subtract current translations to get original layout positions
      const current_logo_x = getNumProperty(logo, "x");
      const base_logo_left = rect_logo.left - current_logo_x;
      const logoX = (rect_nav.left + padding) - base_logo_left;

      const current_btn_x = getNumProperty(button, "x");
      const base_btn_left = rect_btn.left - current_btn_x;
      const buttonX = (rect_nav.right - padding - rect_btn.width) - base_btn_left;

      return { logoX, buttonX };
    };

    const initPosition = () => {
      const scrollY = window.scrollY;
      const { logoX, buttonX } = getSideOffsets();

      if (scrollY > 50) {
        isCentered = false;
        gsap.set(logo, { x: logoX });
        gsap.set(button, { x: buttonX });
      } else {
        isCentered = true;
        gsap.set(logo, { x: 0 });
        gsap.set(button, { x: 0 });
      }
    };

    // Run positioning logic on mount
    initPosition();
    const timer = setTimeout(initPosition, 100);

    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 50 && isCentered) {
        isCentered = false;
        const { logoX, buttonX } = getSideOffsets();
        gsap.killTweensOf([logo, button]);
        
        // Slide logo to left margin and button to right margin
        gsap.to(logo, { x: logoX, duration: 0.6, ease: 'power2.out' });
        gsap.to(button, { x: buttonX, duration: 0.6, ease: 'power2.out' });
      } else if (scrollY <= 50 && !isCentered) {
        isCentered = true;
        gsap.killTweensOf([logo, button]);
        
        // Slide both back to the center
        gsap.to(logo, { x: 0, duration: 0.6, ease: 'power2.out' });
        gsap.to(button, { x: 0, duration: 0.6, ease: 'power2.out' });
      }
    };

    const handleResize = () => {
      const { logoX, buttonX } = getSideOffsets();
      if (!isCentered) {
        gsap.set(logo, { x: logoX });
        gsap.set(button, { x: buttonX });
      } else {
        gsap.set(logo, { x: 0 });
        gsap.set(button, { x: 0 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      gsap.killTweensOf([logo, button]);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-base/90 backdrop-blur">
      <div
        ref={navbarRef}
        className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 px-4 py-3 sm:px-6 relative"
      >
        <span
          ref={logoRef}
          className="text-h3 font-bold text-ink block select-none"
        >
          {storeConfig.name}
        </span>
        <div
          ref={buttonRef}
          className="inline-block"
        >
          <Button
            href={buildWhatsAppLink()}
            variant="whatsapp"
            icon="whatsapp"
            onClick={() => trackEvent("whatsapp_click", { source: "nav" })}
          >
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
