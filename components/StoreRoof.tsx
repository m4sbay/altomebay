"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import storeRoofImg from '../public/store_roof.png';

export interface StoreRoofProps {
  className?: string;
  topOffset?: number; // Negative value to shift the roof upwards (e.g. -15 raises it by 15px)
}

export function StoreRoof({
  className = '',
  topOffset = -15, // Default is shifted up slightly by 15px to fit higher on the page
}: StoreRoofProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isCollapsed = false;

    // Helper to get the actual rendered height of the fixed roof container
    const getRoofHeight = () => container.offsetHeight || 95;

    // Wait slightly for the image layout to paint and return accurate dimensions
    const initDimensions = () => {
      const initialHeight = getRoofHeight();
      
      const initialScrollY = window.scrollY;
      if (initialScrollY > 50) {
        isCollapsed = true;
        gsap.set(container, { y: -initialHeight, pointerEvents: 'none' });
      } else {
        gsap.set(container, { pointerEvents: 'auto', y: 0 });
        
        if (!prefersReducedMotion) {
          // Smooth slide-in with spring/overshoot easing on page load
          gsap.fromTo(
            container,
            { y: -initialHeight },
            { y: 0, duration: 1.2, ease: 'back.out(1.2)' }
          );
        }
      }
    };

    // Run initialization
    initDimensions();
    
    // Fallback: recheck heights after a brief moment to ensure image loading doesn't alter layout height unexpectedly
    const timer = setTimeout(initDimensions, 100);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const currentHeight = getRoofHeight();

      if (scrollY > 50 && !isCollapsed) {
        isCollapsed = true;
        gsap.killTweensOf(container);

        if (prefersReducedMotion) {
          gsap.set(container, { y: -currentHeight, pointerEvents: 'none' });
        } else {
          // Smooth slide up to hide and reveal navbar underneath
          gsap.to(container, {
            y: -currentHeight,
            duration: 0.5,
            ease: 'power3.inOut',
            onComplete: () => {
              gsap.set(container, { pointerEvents: 'none' });
            }
          });
        }
      } else if (scrollY <= 50 && isCollapsed) {
        isCollapsed = false;
        gsap.killTweensOf(container);

        if (prefersReducedMotion) {
          gsap.set(container, { y: 0, pointerEvents: 'auto' });
        } else {
          gsap.set(container, { pointerEvents: 'auto' });
          gsap.to(container, {
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      gsap.killTweensOf(container);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`store-roof-container ${className}`}
      style={{
        position: 'fixed',
        top: topOffset, // Controlled offset position
        left: 0,
        width: '100%',
        height: 'auto',
        overflow: 'hidden',
        display: 'block',
        zIndex: 50,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative w-full">
        <Image
          ref={imgRef}
          src={storeRoofImg}
          alt="Store Roof"
          className="w-full h-auto block"
          priority
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

export default StoreRoof;
