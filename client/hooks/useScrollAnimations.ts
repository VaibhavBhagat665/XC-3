import { useEffect, useState, useRef, useCallback } from "react";

// Hook for scroll-based element reveals
export function useScrollReveal(threshold = 0.01) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once revealed, keep it visible
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "200px 0px 0px 0px", // Start animation well before element is visible
      },
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  return { ref: elementRef, isVisible };
}

// Hook for continuous scroll progress
export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollProgress;
}

// Hook for element-specific scroll progress
export function useElementScrollProgress(threshold = 0.1) {
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Calculate progress based on element position
      const elementTop = rect.top;
      const elementBottom = rect.bottom;

      // Element is in view if any part is visible
      const inView = elementTop < windowHeight && elementBottom > 0;
      setIsInView(inView);

      if (inView) {
        // Calculate progress: 0 when element starts entering, 1 when it fully exits
        const entryPoint = windowHeight;
        const exitPoint = -elementHeight;
        const totalDistance = entryPoint - exitPoint;
        const currentPosition = elementTop;

        const elementProgress = Math.max(
          0,
          Math.min(1, (entryPoint - currentPosition) / totalDistance),
        );

        setProgress(elementProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref: elementRef, progress, isInView };
}

// Hook for page transitions with "zip/unzip" effects
export function usePageTransition() {
  const [transitionState, setTransitionState] = useState<
    "idle" | "zipping" | "unzipping"
  >("idle");
  const [transitionProgress, setTransitionProgress] = useState(0);

  const triggerZipTransition = useCallback(() => {
    setTransitionState("zipping");
    setTransitionProgress(0);

    // Animate progress
    let progress = 0;
    const duration = 800; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(1, elapsed / duration);
      setTransitionProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTransitionState("idle");
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const triggerUnzipTransition = useCallback(() => {
    setTransitionState("unzipping");
    setTransitionProgress(0);

    // Animate progress
    let progress = 0;
    const duration = 1000; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(1, elapsed / duration);
      setTransitionProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTransitionState("idle");
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return {
    transitionState,
    transitionProgress,
    triggerZipTransition,
    triggerUnzipTransition,
  };
}

// Hook for staggered animations
export function useStaggeredReveal(itemCount: number, delay = 100) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reveal items with stagger delay
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems((prev) => new Set(prev).add(i));
            }, i * delay);
          }

          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.01,
        rootMargin: "150px 0px 0px 0px",
      },
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [itemCount, delay]);

  const isItemVisible = useCallback(
    (index: number) => visibleItems.has(index),
    [visibleItems],
  );

  return { ref: containerRef, isItemVisible };
}

// Hook for parallax effects
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const elementTop = rect.top;
      const windowHeight = window.innerHeight;

      // Calculate parallax offset
      const scrolled = windowHeight - elementTop;
      const rate = scrolled * speed;
      setOffset(rate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref: elementRef, offset };
}

// Hook for scroll direction detection
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return scrollDirection;
}

// Hook for smooth scroll to element
export function useSmoothScroll() {
  const scrollToElement = useCallback((elementId: string, offset = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.offsetTop - offset;

    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return { scrollToElement, scrollToTop };
}

// Hook for scroll-based 3D transforms
export function useScroll3D() {
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const windowCenter = window.innerHeight / 2;

      // Calculate distance from center
      const distance = elementCenter - windowCenter;
      const maxDistance = window.innerHeight;
      const normalizedDistance = Math.max(
        -1,
        Math.min(1, distance / maxDistance),
      );

      // Apply 3D transforms based on scroll position
      const rotateX = normalizedDistance * 15; // Max 15 degrees
      const rotateY = normalizedDistance * 8; // Max 8 degrees
      const scale = 1 - Math.abs(normalizedDistance) * 0.1; // Scale down when far from center

      setTransform({ rotateX, rotateY, scale: Math.max(0.9, scale) });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { ref: elementRef, transform };
}
