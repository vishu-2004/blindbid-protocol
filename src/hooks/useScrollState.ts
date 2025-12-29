import { useState, useEffect } from 'react';

interface ScrollState {
  isScrolled: boolean;
  scrollY: number;
}

export const useScrollState = (threshold: number = 50): ScrollState => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrolled: false,
    scrollY: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollState({
        isScrolled: currentScrollY > threshold,
        scrollY: currentScrollY,
      });
    };

    // Set initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrollState;
};
