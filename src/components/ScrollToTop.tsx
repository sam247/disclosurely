
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingRef = useRef(false);
  const lastPathnameRef = useRef<string>('');

  useEffect(() => {
    // Prevent rapid scroll operations during navigation
    if (isNavigatingRef.current) {
      return;
    }

    // Only scroll if pathname actually changed
    if (pathname === lastPathnameRef.current) {
      return;
    }

    // Mark as navigating
    isNavigatingRef.current = true;
    lastPathnameRef.current = pathname;

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll to prevent race conditions
    scrollTimeoutRef.current = setTimeout(() => {
      // Use requestAnimationFrame for smooth scroll
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        // Reset navigation flag after scroll completes
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      });
    }, 50);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
