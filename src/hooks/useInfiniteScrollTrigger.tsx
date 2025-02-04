import { useEffect, useRef, useCallback } from 'react';

export const useInfiniteScrollTrigger = (callback: () => void) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        callback();
      }
    },
    [callback],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  return { loaderRef };
};
