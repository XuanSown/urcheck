'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * GlassCursor — a glassmorphism circle that follows the mouse cursor
 * with a smooth, springy animation. Hidden on touch devices.
 */
export function GlassCursor() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-based smooth follow
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    // Don't show on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Detect hover over interactive elements for cursor scaling
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, label');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleElementHover, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  // Don't render on SSR or until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <motion.div
      ref={cursorRef}
      className="glass-cursor"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isHovering ? 1.5 : 1,
      }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { type: 'spring', stiffness: 300, damping: 20 },
      }}
    />
  );
}
