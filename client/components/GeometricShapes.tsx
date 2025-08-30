import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GeometricShapeProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "cube" | "sphere" | "pyramid" | "hexagon" | "diamond" | "prism";
  color?: "purple" | "pink" | "mint" | "coral" | "blue" | "lavender" | "cyan";
  animation?: "float" | "rotate" | "pulse" | "drift" | "none";
  delay?: number;
  style?: React.CSSProperties;
}

export function GeometricShape({
  className,
  size = "md",
  variant = "cube",
  color = "purple",
  animation = "float",
  delay = 0,
  style,
}: GeometricShapeProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const colorClasses = {
    purple: "from-purple-500/30 to-indigo-600/40 border-purple-400/50",
    pink: "from-pink-500/30 to-rose-600/40 border-pink-400/50",
    mint: "from-emerald-400/30 to-teal-500/40 border-emerald-400/50",
    coral: "from-orange-400/30 to-red-500/40 border-orange-400/50",
    blue: "from-blue-500/30 to-cyan-600/40 border-blue-400/50",
    lavender: "from-violet-400/30 to-purple-500/40 border-violet-400/50",
    cyan: "from-cyan-400/30 to-blue-500/40 border-cyan-400/50",
  };

  const animations = {
    float: {
      animate: {
        y: [-5, 5, -5],
        rotateX: [0, 5, 0],
        rotateY: [0, 10, 0],
      },
      transition: {
        duration: 6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        repeat: Infinity,
        delay,
      },
    },
    rotate: {
      animate: {
        rotateX: [0, 360],
        rotateY: [0, 180],
        rotateZ: [0, 90],
      },
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        delay,
      },
    },
    pulse: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
      },
      transition: {
        duration: 4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        repeat: Infinity,
        delay,
      },
    },
    drift: {
      animate: {
        x: [-10, 10, -10],
        y: [-5, 15, -5],
        rotateZ: [0, 45, 0],
      },
      transition: {
        duration: 15,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        repeat: Infinity,
        delay,
      },
    },
    none: {},
  };

  const shapeStyles = {
    cube: `bg-gradient-to-br ${colorClasses[color]} border-2 backdrop-blur-sm`,
    sphere: `bg-gradient-to-br ${colorClasses[color]} border-2 backdrop-blur-sm rounded-full`,
    pyramid: `bg-gradient-to-br ${colorClasses[color]} border-2 backdrop-blur-sm transform rotate-45`,
    hexagon: `bg-gradient-to-br ${colorClasses[color]} border-2 backdrop-blur-sm`,
    diamond: `bg-gradient-to-br ${colorClasses[color]} border-2 backdrop-blur-sm transform rotate-45`,
    prism: `bg-gradient-to-br ${colorClasses[color]} border-2 backdrop-blur-sm skew-x-12`,
  };

  const shadowClasses = {
    purple: "shadow-[0_0_30px_rgba(147,51,234,0.3)]",
    pink: "shadow-[0_0_30px_rgba(236,72,153,0.3)]",
    mint: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    coral: "shadow-[0_0_30px_rgba(251,146,60,0.3)]",
    blue: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    lavender: "shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    cyan: "shadow-[0_0_30px_rgba(34,211,238,0.3)]",
  };

  return (
    <motion.div
      className={cn(
        sizeClasses[size],
        shapeStyles[variant],
        shadowClasses[color],
        "relative transition-all duration-700 hover:scale-110",
        className,
      )}
      style={{ transformStyle: "preserve-3d", ...style }}
      {...(animation !== "none" && (animations[animation] as any))}
      whileHover={{
        scale: 1.3,
        rotateY: 25,
        rotateX: 15,
        rotateZ: 5,
        transition: { duration: 0.4, type: "spring", stiffness: 300 },
      }}
      whileTap={{
        scale: 0.9,
        transition: { duration: 0.1 },
      }}
    >
      {/* Inner glow effect */}
      <div
        className={cn(
          "absolute inset-2 rounded-lg bg-gradient-to-br opacity-50",
          colorClasses[color].split(" ")[0] +
            " " +
            colorClasses[color].split(" ")[1],
        )}
      />

      {/* Highlight */}
      <div className="absolute top-2 left-2 w-1/3 h-1/3 bg-white/20 rounded-lg blur-sm" />
    </motion.div>
  );
}

interface FloatingShapesProps {
  count?: number;
  className?: string;
}

export function FloatingShapes({ count = 8, className }: FloatingShapesProps) {
  const shapes = Array.from({ length: count }).map((_, i) => {
    const variants = [
      "cube",
      "sphere",
      "pyramid",
      "hexagon",
      "diamond",
      "prism",
    ] as const;
    const colors = [
      "purple",
      "pink",
      "mint",
      "coral",
      "blue",
      "lavender",
      "cyan",
    ] as const;
    const animations = ["float", "rotate", "pulse", "drift"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    return {
      id: i,
      variant: variants[i % variants.length],
      color: colors[i % colors.length],
      animation: animations[i % animations.length],
      size: sizes[i % sizes.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 0.5,
    };
  });

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
    >
      {shapes.map((shape) => (
        <GeometricShape
          key={shape.id}
          variant={shape.variant}
          color={shape.color}
          animation={shape.animation}
          size={shape.size}
          delay={shape.delay}
          className="absolute opacity-60"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
        />
      ))}
    </div>
  );
}

export function InteractiveShapeGrid() {
  const [hoveredShape, setHoveredShape] = useState<number | null>(null);
  const [clickedShape, setClickedShape] = useState<number | null>(null);

  const variants = [
    "cube",
    "sphere",
    "pyramid",
    "hexagon",
    "diamond",
    "prism",
  ] as const;
  const colors = [
    "purple",
    "pink",
    "mint",
    "coral",
    "blue",
    "lavender",
  ] as const;

  const shapeData = [
    {
      name: "Smart Contracts",
      description: "Self-executing code",
      sound: "C4",
    },
    {
      name: "DeFi Protocols",
      description: "Financial primitives",
      sound: "E4",
    },
    { name: "Cross-Chain", description: "Multi-network support", sound: "G4" },
    {
      name: "NFT Marketplace",
      description: "Digital asset trading",
      sound: "A4",
    },
    { name: "Yield Farming", description: "Automated returns", sound: "C5" },
    { name: "Governance", description: "Decentralized voting", sound: "E5" },
  ];

  const gridShapes = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    variant: variants[i],
    color: colors[i],
    ...shapeData[i],
  }));

  // Create audio context for better sound effects
  const playTone = (frequency: number) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Fallback: silent operation if audio context fails
    }
  };

  const getFrequency = (note: string) => {
    const frequencies: { [key: string]: number } = {
      C4: 261.63,
      E4: 329.63,
      G4: 392.0,
      A4: 440.0,
      C5: 523.25,
      E5: 659.25,
    };
    return frequencies[note] || 440;
  };

  return (
    <div className="grid grid-cols-3 gap-12 justify-items-center max-w-4xl mx-auto">
      {gridShapes.map((shape, i) => (
        <motion.div
          key={shape.id}
          initial={{ opacity: 0, scale: 0, rotateY: -180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{
            delay: i * 0.2,
            duration: 0.8,
            type: "spring",
            stiffness: 100,
          }}
          className="group relative"
        >
          {/* Interactive Shape Container */}
          <motion.div
            className="relative cursor-pointer"
            whileHover={{
              scale: hoveredShape === shape.id ? 1.4 : 1.2,
              rotateY: 360,
              transition: { duration: 0.8, type: "spring", stiffness: 200 },
            }}
            whileTap={{ scale: 0.9 }}
            onHoverStart={() => {
              setHoveredShape(shape.id);
              playTone(getFrequency(shape.sound));
            }}
            onHoverEnd={() => setHoveredShape(null)}
            onClick={() => {
              setClickedShape(shape.id);
              playTone(getFrequency(shape.sound) * 2); // Higher pitched click sound
              setTimeout(() => setClickedShape(null), 300);
            }}
          >
            <GeometricShape
              variant={shape.variant}
              color={shape.color}
              size="lg"
              animation="float"
              delay={i * 0.3}
              className="transition-all duration-500 hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]"
            />

            {/* Floating Particles */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: hoveredShape === shape.id ? 1 : 0,
                scale: hoveredShape === shape.id ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {[...Array(hoveredShape === shape.id ? 12 : 8)].map(
                (_, particleIndex) => (
                  <motion.div
                    key={particleIndex}
                    className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r ${
                      colors[i] === "purple"
                        ? "from-purple-400 to-pink-400"
                        : colors[i] === "pink"
                          ? "from-pink-400 to-coral-400"
                          : colors[i] === "mint"
                            ? "from-mint-400 to-cyan-400"
                            : colors[i] === "coral"
                              ? "from-coral-400 to-orange-400"
                              : colors[i] === "blue"
                                ? "from-blue-400 to-purple-400"
                                : "from-lavender to-pink-400"
                    } ${hoveredShape === shape.id ? "shadow-lg" : ""}`}
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      y:
                        hoveredShape === shape.id
                          ? [-30, -60, -30]
                          : [-20, -40, -20],
                      x: [0, Math.random() * 30 - 15, 0],
                      opacity: [0, 1, 0],
                      scale:
                        hoveredShape === shape.id ? [0, 1.5, 0] : [0, 1, 0],
                      rotate: [0, 360, 0],
                    }}
                    transition={{
                      duration: hoveredShape === shape.id ? 1.5 : 2,
                      repeat: Infinity,
                      delay: particleIndex * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ),
              )}
            </motion.div>

            {/* Info Tooltip */}
            <motion.div
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-xl text-white px-4 py-2 rounded-lg border border-purple-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10"
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              <div className="text-center">
                <div className="text-sm font-bold text-white">{shape.name}</div>
                <div className="text-xs text-gray-300">{shape.description}</div>
              </div>
              {/* Arrow */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 border-l border-t border-purple-500/30 rotate-45" />
            </motion.div>

            {/* Ripple Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-transparent"
              animate={
                clickedShape === shape.id
                  ? {
                      borderColor: [
                        "rgba(147,51,234,0)",
                        "rgba(147,51,234,1)",
                        "rgba(147,51,234,0)",
                      ],
                      scale: [1, 1.3, 1.6],
                      opacity: [0, 1, 0],
                    }
                  : hoveredShape === shape.id
                    ? {
                        borderColor: [
                          "rgba(147,51,234,0)",
                          "rgba(147,51,234,0.6)",
                          "rgba(147,51,234,0)",
                        ],
                        scale: [1, 1.1, 1.2],
                        opacity: [0, 0.8, 0],
                      }
                    : {}
              }
              transition={{
                duration: clickedShape === shape.id ? 0.6 : 1.2,
                repeat:
                  hoveredShape === shape.id || clickedShape === shape.id
                    ? Infinity
                    : 0,
                ease: "easeOut",
              }}
            />
          </motion.div>

          {/* Energy Waves */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: hoveredShape === shape.id ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {[...Array(hoveredShape === shape.id ? 4 : 3)].map(
              (_, waveIndex) => (
                <motion.div
                  key={waveIndex}
                  className={`absolute inset-0 border-2 rounded-lg ${
                    colors[i] === "purple"
                      ? "border-purple-400/40"
                      : colors[i] === "pink"
                        ? "border-pink-400/40"
                        : colors[i] === "mint"
                          ? "border-mint-400/40"
                          : colors[i] === "coral"
                            ? "border-coral-400/40"
                            : colors[i] === "blue"
                              ? "border-blue-400/40"
                              : "border-lavender/40"
                  }`}
                  animate={{
                    scale: hoveredShape === shape.id ? [1, 2, 3] : [1, 1.5, 2],
                    opacity:
                      hoveredShape === shape.id ? [0.8, 0.4, 0] : [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: hoveredShape === shape.id ? 1.5 : 2,
                    repeat: Infinity,
                    delay: waveIndex * 0.4,
                    ease: "easeOut",
                  }}
                />
              ),
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
