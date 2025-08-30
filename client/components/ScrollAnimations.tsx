import React, { ReactNode } from "react";
import {
  useScrollReveal,
  useStaggeredReveal,
  useParallax,
  useScroll3D,
} from "../hooks/useScrollAnimations";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?:
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "zoom-in"
    | "zip-in"
    | "unzip";
  delay?: number;
  threshold?: number;
}

export function ScrollReveal({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  threshold = 0.01,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal(threshold);

  const animationClasses = {
    "fade-up": "scroll-reveal",
    "fade-down": "scroll-reveal",
    "fade-left": "scroll-reveal",
    "fade-right": "scroll-reveal",
    "zoom-in": "scroll-reveal",
    "zip-in": "scroll-zip-in",
    unzip: "scroll-unzip",
  };

  const initialTransforms = {
    "fade-up": "translateY(50px)",
    "fade-down": "translateY(-50px)",
    "fade-left": "translateX(50px)",
    "fade-right": "translateX(-50px)",
    "zoom-in": "scale(0.8)",
    "zip-in": "perspective(1000px) rotateX(45deg) scale(0.8)",
    unzip: "perspective(1000px) rotateX(-45deg) scale(1.2)",
  };

  return (
    <div
      ref={ref}
      className={`
        ${animationClasses[animation]}
        ${isVisible ? "active revealed" : ""}
        ${className}
      `}
      style={{
        transitionDelay: `${delay}ms`,
        transform: isVisible ? "none" : initialTransforms[animation],
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  gridCols?: number;
}

export function StaggeredGrid({
  children,
  className = "",
  staggerDelay = 100,
  gridCols = 3,
}: StaggeredGridProps) {
  const { ref, isItemVisible } = useStaggeredReveal(
    children.length,
    staggerDelay,
  );

  return (
    <div
      ref={ref}
      className={`grid gap-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className={`
            transition-all duration-800 ease-out
            ${
              isItemVisible(index)
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }
          `}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface ParallaxContainerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxContainer({
  children,
  speed = 0.5,
  className = "",
}: ParallaxContainerProps) {
  const { ref, offset } = useParallax(speed);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
}

interface Scroll3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function Scroll3D({
  children,
  className = "",
  intensity = 1,
}: Scroll3DProps) {
  const { ref, transform } = useScroll3D();

  return (
    <div
      ref={ref}
      className={`transform-3d ${className}`}
      style={{
        transform: `
          perspective(1000px) 
          rotateX(${transform.rotateX * intensity}deg) 
          rotateY(${transform.rotateY * intensity}deg) 
          scale(${transform.scale})
        `,
        transition: "transform 0.1s ease-out",
      }}
    >
      {children}
    </div>
  );
}

interface PageSectionProps {
  children: ReactNode;
  id: string;
  className?: string;
  background?: "default" | "gradient" | "dark" | "neon";
  fullHeight?: boolean;
}

export function PageSection({
  children,
  id,
  className = "",
  background = "default",
  fullHeight = false,
}: PageSectionProps) {
  const backgroundClasses = {
    default: "bg-background",
    gradient: "bg-web3-gradient",
    dark: "bg-gradient-to-br from-background via-card to-background",
    neon: "bg-neon-gradient",
  };

  return (
    <section
      id={id}
      className={`
        relative overflow-hidden
        ${backgroundClasses[background]}
        ${fullHeight ? "min-h-screen" : "min-h-[80vh]"}
        ${className}
      `}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 bg-cyan-400 rounded-full
              float ${i % 2 === 0 ? "float-delayed" : "float-delayed-2"}
            `}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className = "",
  amplitude = 20,
  duration = 6,
  delay = 0,
}: FloatingElementProps) {
  return (
    <div
      className={`${className}`}
      style={
        {
          animation: `float ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          "--float-amplitude": `${amplitude}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

interface GlowingBorderProps {
  children: ReactNode;
  className?: string;
  color?: "cyan" | "purple" | "blue" | "green";
  intensity?: "low" | "medium" | "high";
}

export function GlowingBorder({
  children,
  className = "",
  color = "cyan",
  intensity = "medium",
}: GlowingBorderProps) {
  const colorClasses = {
    cyan: "border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
    purple: "border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    blue: "border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    green: "border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]",
  };

  const intensityClasses = {
    low: "shadow-[0_0_10px_rgba(34,211,238,0.2)]",
    medium: "shadow-[0_0_20px_rgba(34,211,238,0.3)]",
    high: "shadow-[0_0_30px_rgba(34,211,238,0.5)]",
  };

  return (
    <div
      className={`
      relative border rounded-2xl backdrop-blur-sm
      ${colorClasses[color]}
      ${intensityClasses[intensity]}
      transition-all duration-300
      hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]
      ${className}
    `}
    >
      {children}
    </div>
  );
}

interface ZipTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  direction?: "up" | "down";
  duration?: number;
}

export function ZipTransition({
  children,
  isVisible,
  direction = "up",
  duration = 800,
}: ZipTransitionProps) {
  const directionTransform =
    direction === "up"
      ? "perspective(1000px) rotateX(-90deg) scaleY(0)"
      : "perspective(1000px) rotateX(90deg) scaleY(0)";

  return (
    <div
      className="transform-3d transition-all ease-out"
      style={{
        transform: isVisible
          ? "perspective(1000px) rotateX(0deg) scaleY(1)"
          : directionTransform,
        opacity: isVisible ? 1 : 0,
        transformOrigin: direction === "up" ? "top" : "bottom",
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}
