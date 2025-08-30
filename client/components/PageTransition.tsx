import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePageTransition } from "../hooks/useScrollAnimations";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const { transitionState, triggerZipTransition, triggerUnzipTransition } =
    usePageTransition();

  useEffect(() => {
    // Handle route changes with zip/unzip transitions
    if (location.pathname !== currentPath) {
      setIsVisible(false);
      triggerZipTransition();

      // Wait for zip animation to complete before showing new content
      setTimeout(() => {
        setCurrentPath(location.pathname);
        setIsVisible(true);
        triggerUnzipTransition();
      }, 400);
    } else {
      // Initial page load
      setIsVisible(true);
      triggerUnzipTransition();
    }
  }, [
    location.pathname,
    currentPath,
    triggerZipTransition,
    triggerUnzipTransition,
  ]);

  return (
    <div className="relative min-h-screen">
      {/* Page Content */}
      <div
        className={`
          transition-all duration-800 ease-out transform-3d
          ${
            isVisible
              ? "opacity-100 scale-100 translate-y-0 rotate-x-0"
              : "opacity-0 scale-95 translate-y-8 rotate-x-2"
          }
        `}
        style={{
          transformOrigin: "center center",
          perspective: "1000px",
        }}
      >
        {children}
      </div>

      {/* Transition Overlay */}
      {transitionState !== "idle" && (
        <div
          className={`
            fixed inset-0 z-50 pointer-events-none
            transition-all duration-600 ease-out
            ${
              transitionState === "zipping"
                ? "bg-background/90 backdrop-blur-xl"
                : "bg-transparent"
            }
          `}
        >
          {/* Zip Effect Lines */}
          {transitionState === "zipping" && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    absolute h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400
                    animate-pulse opacity-80
                  `}
                  style={{
                    width: `${20 + i * 10}%`,
                    top: `${40 + i * 4}%`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Unzip Effect Particles */}
          {transitionState === "unzipping" && (
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    absolute w-1 h-1 bg-cyan-400 rounded-full
                    animate-ping opacity-60
                  `}
                  style={{
                    left: `${10 + (i % 4) * 25}%`,
                    top: `${20 + Math.floor(i / 4) * 20}%`,
                    animationDelay: `${i * 50}ms`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for smooth scroll to sections with zip effect
export function useScrollToSection() {
  const { triggerZipTransition } = usePageTransition();

  const scrollToSection = (sectionId: string, offset = 100) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Trigger zip effect
    triggerZipTransition();

    // Scroll after a short delay
    setTimeout(() => {
      const elementPosition = element.offsetTop - offset;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }, 200);
  };

  return { scrollToSection };
}

// Component for section transitions
interface SectionTransitionProps {
  children: ReactNode;
  id: string;
  className?: string;
}

export function SectionTransition({
  children,
  id,
  className = "",
}: SectionTransitionProps) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        threshold: 0.01,
        rootMargin: "200px 0px 0px 0px",
      },
    );

    const element = document.getElementById(id);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [id]);

  return (
    <div
      id={id}
      className={`
        transition-all duration-1000 ease-out transform-3d
        ${
          isInView
            ? "opacity-100 translate-y-0 scale-100 rotate-x-0"
            : "opacity-0 translate-y-12 scale-98 rotate-x-1"
        }
        ${className}
      `}
      style={{
        perspective: "1000px",
        transformOrigin: "center top",
      }}
    >
      {children}
    </div>
  );
}

// Staggered reveal for grid items
interface StaggerRevealProps {
  children: ReactNode[];
  delay?: number;
  className?: string;
}

export function StaggerReveal({
  children,
  delay = 100,
  className = "",
}: StaggerRevealProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [containerInView, setContainerInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !containerInView) {
          setContainerInView(true);

          // Stagger the reveal of items
          children.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => new Set(prev).add(index));
            }, index * delay);
          });
        }
      },
      {
        threshold: 0.01,
        rootMargin: "150px 0px 0px 0px",
      },
    );

    const container = document.querySelector(`[data-stagger-container]`);
    if (container) {
      observer.observe(container);
    }

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [children.length, delay, containerInView]);

  return (
    <div data-stagger-container className={`relative ${className || ""}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`
            transition-all duration-800 ease-out
            ${
              visibleItems.has(index)
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }
          `}
          style={{
            transitionDelay: visibleItems.has(index)
              ? "0ms"
              : `${index * delay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
