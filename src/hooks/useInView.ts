'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  rootMargin?: string;
  enabled?: boolean;
}

export function useInView(options: UseInViewOptions = {}): {
  ref: RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const { rootMargin = '200px', enabled = true } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const [observedInView, setObservedInView] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setObservedInView(true);
        }
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [enabled, rootMargin]);

  const inView = enabled && observedInView;

  return { ref, inView };
}
