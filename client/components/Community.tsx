import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Users,
  Rocket,
  Lightbulb,
  Code,
  Heart,
  Star,
  Trophy,
  Zap,
  Globe,
  GitBranch,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { GeometricShape, InteractiveShapeGrid } from "./GeometricShapes";
import { cn } from "@/lib/utils";

const communityStats = [
  {
    number: "10M+",
    label: "Active Users",
    sublabel: "across the globe",
    icon: Users,
  },
  {
    number: "150+",
    label: "Countries",
    sublabel: "worldwide reach",
    icon: Globe,
  },
  {
    number: "50K+",
    label: "Developers",
    sublabel: "building together",
    icon: Code,
  },
  {
    number: "1M+",
    label: "Projects",
    sublabel: "launched daily",
    icon: Rocket,
  },
];

const innovationFeatures = [
  {
    icon: Lightbulb,
    title: "Open Innovation",
    description:
      "Collaborative development with the brightest minds in Web3, fostering breakthrough solutions.",
    color: "purple",
    gradient: "from-purple-500/20 to-indigo-600/20",
    border: "border-purple-500/30",
    delay: 0.1,
  },
  {
    icon: GitBranch,
    title: "Open Source",
    description:
      "Transparent, community-driven development with full access to our codebase and documentation.",
    color: "mint",
    gradient: "from-emerald-400/20 to-teal-500/20",
    border: "border-emerald-400/30",
    delay: 0.2,
  },
  {
    icon: MessageCircle,
    title: "Community Governance",
    description:
      "Democratic decision-making where every voice matters in shaping the future of our platform.",
    color: "coral",
    gradient: "from-orange-400/20 to-red-500/20",
    border: "border-orange-400/30",
    delay: 0.3,
  },
  {
    icon: TrendingUp,
    title: "Ecosystem Growth",
    description:
      "Supporting developers, creators, and entrepreneurs to build the next generation of Web3 applications.",
    color: "cyan",
    gradient: "from-cyan-400/20 to-blue-500/20",
    border: "border-cyan-400/30",
    delay: 0.4,
  },
];

const achievements = [
  {
    icon: Trophy,
    title: "Best Web3 Platform",
    year: "2024",
    org: "Crypto Awards",
  },
  { icon: Star, title: "Innovation Leader", year: "2024", org: "DeFi Pulse" },
  { icon: Heart, title: "Community Choice", year: "2023", org: "Web3 Summit" },
  { icon: Zap, title: "Tech Pioneer", year: "2023", org: "Blockchain Weekly" },
];

export function Community() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <motion.div className="absolute inset-0" style={{ y, opacity }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-mint-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-br from-coral-400/8 to-transparent rounded-full blur-2xl" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-mint-400/30 rounded-full flex items-center justify-center border border-purple-500/50"
                animate={{
                  rotate: 360,
                  boxShadow: [
                    "0 0 20px rgba(147,51,234,0.3)",
                    "0 0 40px rgba(16,185,129,0.4)",
                    "0 0 20px rgba(147,51,234,0.3)",
                  ],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 3, repeat: Infinity },
                }}
              >
                <Users className="w-10 h-10 text-purple-400" />
              </motion.div>

              {/* Orbiting Elements */}
              {[0, 120, 240].map((angle, i) => (
                <motion.div
                  key={angle}
                  className="absolute w-3 h-3 bg-gradient-to-r from-mint-400 to-cyan-400 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transformOrigin: "0 0",
                  }}
                  animate={{
                    rotate: angle + 360,
                    x: 40 * Math.cos((angle * Math.PI) / 180),
                    y: 40 * Math.sin((angle * Math.PI) / 180),
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-mint-400 bg-clip-text text-transparent">
              COMMUNITY
            </span>
            <br />
            <span className="bg-gradient-to-r from-coral-400 via-cyan-400 to-lavender bg-clip-text text-transparent">
              DRIVEN
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            Together, we're building the future of decentralized finance.
            <span className="block mt-2 text-lg text-purple-400 font-semibold">
              Join millions of innovators, creators, and dreamers shaping Web3.
            </span>
          </motion.p>
        </motion.div>

        {/* Community Stats with Scroll Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32"
        >
          {communityStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              viewport={{ once: true }}
              className="group text-center relative"
            >
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-mint-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

              <div className="relative p-6 bg-gradient-to-br from-card/40 to-muted/20 backdrop-blur-sm border border-border/30 rounded-2xl group-hover:border-purple-500/50 transition-all duration-300">
                <motion.div
                  className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 15 }}
                >
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </motion.div>

                <motion.div
                  className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-mint-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-coral-400 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-lg font-bold text-foreground mb-1 group-hover:text-purple-300 transition-colors duration-300">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-gray-300 transition-colors duration-300">
                  {stat.sublabel}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Innovation Features */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <motion.h3
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                INNOVATION ECOSYSTEM
              </span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              Empowering developers and creators to build the next generation of
              Web3 applications.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {innovationFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  x: index % 2 === 0 ? -60 : 60,
                  rotateY: index % 2 === 0 ? -15 : 15,
                }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  delay: feature.delay,
                  type: "spring",
                  stiffness: 80,
                }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* 3D Hover Effect */}
                <motion.div
                  className={cn(
                    "relative p-8 bg-gradient-to-br backdrop-blur-xl border-2 rounded-3xl transition-all duration-500",
                    feature.gradient,
                    feature.border,
                  )}
                  whileHover={{
                    scale: 1.05,
                    rotateY: index % 2 === 0 ? 5 : -5,
                    rotateX: 5,
                    z: 50,
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Icon with Animation */}
                  <motion.div
                    className={cn(
                      "w-16 h-16 mb-6 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg",
                      `from-${feature.color}-500 to-${feature.color}-600`,
                    )}
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      scale: 1.1,
                      boxShadow: "0 0 30px rgba(147,51,234,0.4)",
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h4 className="text-2xl font-bold text-foreground mb-4 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h4>

                  <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Floating Particle Effect */}
                  <motion.div
                    className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-100"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Shapes Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-mint-400 bg-clip-text text-transparent">
                INTERACTIVE INNOVATION
              </span>
            </h3>
            <p className="text-muted-foreground">
              Interactive shapes that respond to your exploration - discover the
              power of Web3
            </p>
          </div>
          <InteractiveShapeGrid />
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-coral-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                PLATFORM ACHIEVEMENTS
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Delivering innovative solutions and exceptional performance in the
              Web3 ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-6 bg-gradient-to-br from-card/60 to-muted/40 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -10 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-coral-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{
                      rotate: 360,
                      boxShadow: "0 0 20px rgba(147,51,234,0.4)",
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <achievement.icon className="w-6 h-6 text-purple-400" />
                  </motion.div>

                  <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    {achievement.title}
                  </h4>

                  <div className="text-sm text-purple-400 font-semibold mb-1">
                    {achievement.year}
                  </div>

                  <div className="text-xs text-muted-foreground group-hover:text-gray-300 transition-colors duration-300">
                    {achievement.org}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative p-12 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-mint-900/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl max-w-5xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-mint-400 rounded-3xl opacity-20 blur-sm" />

            <div className="relative">
              <motion.div
                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-mint-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(147,51,234,0.3)",
                    "0 0 60px rgba(16,185,129,0.4)",
                    "0 0 20px rgba(147,51,234,0.3)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Heart className="w-12 h-12 text-purple-400" />
              </motion.div>

              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-mint-400 bg-clip-text text-transparent">
                  Join Our Global Community
                </span>
              </h3>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Be part of the Web3 revolution. Connect with developers, share
                ideas, and help build the decentralized future together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-mint-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all duration-500"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 50px rgba(147,51,234,0.8)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center">
                    <Users className="w-6 h-6 mr-3" />
                    Join Community
                  </span>
                </motion.button>

                <motion.button
                  className="px-10 py-4 border-2 border-purple-500/50 text-purple-300 text-lg font-bold rounded-2xl hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center">
                    <Code className="w-6 h-6 mr-3" />
                    Start Building
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-1/4 left-8 opacity-40">
        <GeometricShape
          variant="sphere"
          color="purple"
          size="sm"
          animation="drift"
          delay={0}
        />
      </div>
      <div className="absolute bottom-1/3 right-12 opacity-50">
        <GeometricShape
          variant="cube"
          color="mint"
          size="md"
          animation="float"
          delay={2}
        />
      </div>
      <div className="absolute top-2/3 left-1/4 opacity-30">
        <GeometricShape
          variant="diamond"
          color="coral"
          size="lg"
          animation="pulse"
          delay={4}
        />
      </div>
    </section>
  );
}
