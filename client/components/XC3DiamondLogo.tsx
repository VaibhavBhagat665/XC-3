import { cn } from "@/lib/utils";

interface XC3DiamondLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export function XC3DiamondLogo({
  size = "md",
  className,
  showText = true,
}: XC3DiamondLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-xl",
  };

  const orbitalSizes = {
    sm: { outer: 40, inner: 24 },
    md: { outer: 56, inner: 32 },
    lg: { outer: 80, inner: 48 },
    xl: { outer: 120, inner: 72 },
  };

  const currentSizes = orbitalSizes[size];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center group cursor-pointer",
        showText ? "space-y-2" : "",
        className,
      )}
    >
      {/* Orbital Rings Container */}
      <div
        className={cn(
          sizeClasses[size],
          "relative flex items-center justify-center",
        )}
      >
        {/* Outer Orbital Ring */}
        <div
          className="absolute border-2 border-cyan-400/30 rounded-full animate-spin group-hover:border-cyan-400/50 transition-colors duration-300"
          style={{
            width: `${currentSizes.outer}px`,
            height: `${currentSizes.outer}px`,
            animationDuration: "8s",
            animationDirection: "normal",
          }}
        >
          {/* Orbital Dots */}
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <div className="absolute bottom-0 right-1/2 w-2 h-2 bg-blue-400 rounded-full transform translate-x-1/2 translate-y-1/2 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        </div>

        {/* Inner Orbital Ring */}
        <div
          className="absolute border border-blue-400/40 rounded-full animate-spin group-hover:border-blue-400/60 transition-colors duration-300"
          style={{
            width: `${currentSizes.inner}px`,
            height: `${currentSizes.inner}px`,
            animationDuration: "6s",
            animationDirection: "reverse",
          }}
        >
          {/* Single orbital dot */}
          <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full transform translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
        </div>

        {/* Central Diamond */}
        <div className="relative group-hover:scale-110 transition-transform duration-300">
          <svg
            width={
              size === "sm"
                ? "32"
                : size === "md"
                  ? "48"
                  : size === "lg"
                    ? "64"
                    : "96"
            }
            height={
              size === "sm"
                ? "32"
                : size === "md"
                  ? "48"
                  : size === "lg"
                    ? "64"
                    : "96"
            }
            viewBox="0 0 100 100"
            className="drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300"
          >
            <defs>
              {/* Main Diamond Gradient */}
              <linearGradient
                id="diamondGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="30%" stopColor="#0ea5e9" />
                <stop offset="70%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>

              {/* Inner Facet Gradients */}
              <linearGradient id="topFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              <linearGradient
                id="sideFacet"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>

              <linearGradient
                id="bottomFacet"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>

              {/* Shine Effect */}
              <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

            {/* Main Diamond Shape */}
            <path
              d="M50 5 L85 35 L50 95 L15 35 Z"
              fill="url(#diamondGradient)"
              className="group-hover:brightness-110 transition-all duration-300"
            />

            {/* Top Facet */}
            <path
              d="M50 5 L85 35 L50 45 L15 35 Z"
              fill="url(#topFacet)"
              opacity="0.9"
            />

            {/* Left Facet */}
            <path
              d="M15 35 L50 45 L50 95 Z"
              fill="url(#sideFacet)"
              opacity="0.7"
            />

            {/* Right Facet */}
            <path
              d="M85 35 L50 45 L50 95 Z"
              fill="url(#bottomFacet)"
              opacity="0.8"
            />

            {/* Shine Effect */}
            <path
              d="M50 5 L70 25 L50 45 L30 25 Z"
              fill="url(#shine)"
              opacity="0.6"
            />

            {/* Edge Highlights */}
            <path
              d="M50 5 L85 35 L50 45 L15 35 Z"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-400/0 to-purple-400/0 group-hover:from-cyan-400/20 group-hover:via-blue-400/20 group-hover:to-purple-400/20 blur-xl scale-150 rounded-full transition-all duration-500" />
      </div>

      {/* XC3 Text */}
      {showText && (
        <div
          className={cn(
            "font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-300",
            textSizes[size],
          )}
        >
          XC3
        </div>
      )}
    </div>
  );
}
