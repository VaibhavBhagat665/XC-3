import { ReactNode, forwardRef } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  spacing?: "tight" | "normal" | "loose" | "none";
  preventOverlap?: boolean;
}

export const ResponsiveContainer = forwardRef<
  HTMLDivElement,
  ResponsiveContainerProps
>(
  (
    {
      children,
      className = "",
      size = "xl",
      spacing = "normal",
      preventOverlap = true,
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      full: "max-w-none",
    };

    const spacingClasses = {
      none: "",
      tight: "px-4 md:px-6",
      normal: "px-6 md:px-8 lg:px-12",
      loose: "px-8 md:px-12 lg:px-16 xl:px-20",
    };

    const overlapClasses = preventOverlap ? "no-overlap" : "";

    return (
      <div
        ref={ref}
        className={`
          mx-auto w-full
          ${sizeClasses[size]}
          ${spacingClasses[spacing]}
          ${overlapClasses}
          ${className}
        `}
      >
        {children}
      </div>
    );
  },
);

ResponsiveContainer.displayName = "ResponsiveContainer";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
  preventOverlap?: boolean;
}

export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
  className = "",
  preventOverlap = true,
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: "gap-3 md:gap-4",
    md: "gap-4 md:gap-6",
    lg: "gap-6 md:gap-8",
    xl: "gap-8 md:gap-10",
  };

  const gridColClasses = [
    cols.xs ? `grid-cols-${cols.xs}` : "",
    cols.sm ? `sm:grid-cols-${cols.sm}` : "",
    cols.md ? `md:grid-cols-${cols.md}` : "",
    cols.lg ? `lg:grid-cols-${cols.lg}` : "",
    cols.xl ? `xl:grid-cols-${cols.xl}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`
        grid 
        ${gridColClasses}
        ${gapClasses[gap]}
        ${preventOverlap ? "overlap-safe" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  size?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  weight?: "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black";
  className?: string;
  responsive?: boolean;
}

export function ResponsiveText({
  children,
  as: Component = "p",
  size = "base",
  weight = "normal",
  className = "",
  responsive = true,
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: responsive ? "text-xs sm:text-sm" : "text-xs",
    sm: responsive ? "text-sm sm:text-base" : "text-sm",
    base: responsive ? "text-base sm:text-lg" : "text-base",
    lg: responsive ? "text-lg sm:text-xl" : "text-lg",
    xl: responsive ? "text-xl sm:text-2xl" : "text-xl",
    "2xl": responsive ? "text-xl sm:text-2xl md:text-3xl" : "text-2xl",
    "3xl": responsive ? "text-2xl sm:text-3xl md:text-4xl" : "text-3xl",
    "4xl": responsive ? "text-3xl sm:text-4xl md:text-5xl" : "text-4xl",
    "5xl": responsive ? "text-4xl sm:text-5xl md:text-6xl" : "text-5xl",
    "6xl": responsive
      ? "text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
      : "text-6xl",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    extrabold: "font-extrabold",
    black: "font-black",
  };

  return (
    <Component
      className={`
      ${sizeClasses[size]}
      ${weightClasses[weight]}
      ${className}
    `}
    >
      {children}
    </Component>
  );
}

interface ResponsiveSpacingProps {
  children: ReactNode;
  y?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  x?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function ResponsiveSpacing({
  children,
  y = "md",
  x = "none",
  className = "",
}: ResponsiveSpacingProps) {
  const ySpacingClasses = {
    xs: "py-2 md:py-3",
    sm: "py-4 md:py-6",
    md: "py-6 md:py-8 lg:py-12",
    lg: "py-8 md:py-12 lg:py-16",
    xl: "py-12 md:py-16 lg:py-20",
    "2xl": "py-16 md:py-20 lg:py-24 xl:py-32",
  };

  const xSpacingClasses = {
    none: "",
    xs: "px-2 md:px-3",
    sm: "px-4 md:px-6",
    md: "px-6 md:px-8 lg:px-12",
    lg: "px-8 md:px-12 lg:px-16",
    xl: "px-12 md:px-16 lg:px-20",
    "2xl": "px-16 md:px-20 lg:px-24 xl:px-32",
  };

  return (
    <div
      className={`
      ${ySpacingClasses[y]}
      ${xSpacingClasses[x]}
      ${className}
    `}
    >
      {children}
    </div>
  );
}

interface MobileOptimizedProps {
  children: ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  showOnlyOnMobile?: boolean;
}

export function MobileOptimized({
  children,
  className = "",
  hideOnMobile = false,
  showOnlyOnMobile = false,
}: MobileOptimizedProps) {
  let visibilityClass = "";

  if (hideOnMobile) {
    visibilityClass = "hidden md:block";
  } else if (showOnlyOnMobile) {
    visibilityClass = "block md:hidden";
  }

  return (
    <div
      className={`
      ${visibilityClass}
      ${className}
      touch-manipulation // Improve touch performance
      select-none // Prevent text selection on mobile interactions
    `}
    >
      {children}
    </div>
  );
}

// Hook for responsive behavior
export function useResponsive() {
  const isMobile = () => window.innerWidth < 768;
  const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = () => window.innerWidth >= 1024;

  return {
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
  };
}

// Utility for preventing layout shift
interface NoLayoutShiftProps {
  children: ReactNode;
  height?: string;
  className?: string;
}

export function NoLayoutShift({
  children,
  height = "auto",
  className = "",
}: NoLayoutShiftProps) {
  return (
    <div
      className={`
        w-full
        ${className}
      `}
      style={{ minHeight: height }}
    >
      {children}
    </div>
  );
}
