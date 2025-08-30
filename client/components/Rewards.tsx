import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Gift,
  Target,
  Zap,
  Star,
  Crown,
  Coins,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Percent,
} from "lucide-react";
import { GeometricShape } from "./GeometricShapes";
import { cn } from "@/lib/utils";

const rewardTiers = [
  {
    name: "Explorer",
    icon: Star,
    color: "purple",
    gradient: "from-purple-500/20 to-indigo-600/20",
    border: "border-purple-500/30",
    requirements: "$1K+ Assets",
    benefits: ["0.5% Cashback", "Basic Analytics", "Email Support"],
    badge: "🌟",
    delay: 0.1,
  },
  {
    name: "Adventurer",
    icon: Target,
    color: "mint",
    gradient: "from-emerald-400/20 to-teal-500/20",
    border: "border-emerald-400/30",
    requirements: "$10K+ Assets",
    benefits: ["1.5% Cashback", "Advanced Analytics", "Priority Support"],
    badge: "🚀",
    delay: 0.2,
  },
  {
    name: "Pioneer",
    icon: Crown,
    color: "coral",
    gradient: "from-orange-400/20 to-red-500/20",
    border: "border-orange-400/30",
    requirements: "$100K+ Assets",
    benefits: ["3% Cashback", "Pro Analytics", "24/7 VIP Support"],
    badge: "👑",
    delay: 0.3,
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Earn While You Hold",
    description:
      "Get rewarded for simply holding your favorite cryptocurrencies with competitive staking rewards.",
    metric: "Up to 15% APY",
    color: "purple",
    chart: [20, 45, 30, 60, 40, 80, 65, 95],
  },
  {
    icon: Gift,
    title: "Loyalty Rewards",
    description:
      "Unlock exclusive perks, early access to new features, and special event participation.",
    metric: "Weekly Rewards",
    color: "mint",
    chart: [10, 25, 40, 55, 70, 85, 90, 100],
  },
  {
    icon: TrendingUp,
    title: "Performance Bonuses",
    description:
      "Earn extra rewards based on your trading performance and portfolio growth achievements.",
    metric: "Monthly Bonuses",
    color: "coral",
    chart: [30, 20, 50, 45, 70, 65, 85, 90],
  },
  {
    icon: Zap,
    title: "Referral Program",
    description:
      "Share the wealth! Earn rewards for every friend you bring to the Web3 ecosystem.",
    metric: "25% Commission",
    color: "cyan",
    chart: [15, 35, 25, 60, 55, 75, 80, 95],
  },
];

const growthStats = [
  { label: "Total Rewards Distributed", value: "$500M+", growth: "+450%" },
  { label: "Active Reward Earners", value: "2.5M", growth: "+280%" },
  { label: "Average Monthly Earnings", value: "$1,250", growth: "+320%" },
  { label: "Reward Programs", value: "15+", growth: "+200%" },
];

function AnimatedChart({
  data,
  color,
  delay = 0,
}: {
  data: number[];
  color: string;
  delay?: number;
}) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      pathLength: 1,
      transition: { duration: 2, delay, ease: "easeInOut" },
    });
  }, [controls, delay]);

  const pathData = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - value;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-16 relative">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id={`gradient-${color}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={`hsl(var(--${color === "purple" ? "deep-purple" : color === "mint" ? "mint-green" : color === "coral" ? "coral-orange" : "pastel-cyan"}))`}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={`hsl(var(--${color === "purple" ? "deep-purple" : color === "mint" ? "mint-green" : color === "coral" ? "coral-orange" : "pastel-cyan"}))`}
              stopOpacity="0.1"
            />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill={`url(#gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: delay + 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={`hsl(var(--${color === "purple" ? "deep-purple" : color === "mint" ? "mint-green" : color === "coral" ? "coral-orange" : "pastel-cyan"}))`}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={controls}
        />

        {/* Data points */}
        {data.map((value, index) => (
          <motion.circle
            key={index}
            cx={(index / (data.length - 1)) * 100}
            cy={100 - value}
            r="2"
            fill={`hsl(var(--${color === "purple" ? "deep-purple" : color === "mint" ? "mint-green" : color === "coral" ? "coral-orange" : "pastel-cyan"}))`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 1 + index * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
}

function CircularProgress({
  percentage,
  color,
  delay = 0,
}: {
  percentage: number;
  color: string;
  delay?: number;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
        />

        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`hsl(var(--${color === "purple" ? "deep-purple" : color === "mint" ? "mint-green" : color === "coral" ? "coral-orange" : "pastel-cyan"}))`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, delay, ease: "easeInOut" }}
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-lg font-bold text-foreground"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: delay + 1 }}
        >
          {percentage}%
        </motion.span>
      </div>
    </div>
  );
}

export function Rewards() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/8 via-pink-500/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-tl from-mint-400/8 via-cyan-400/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-br from-coral-400/6 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
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
                className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-coral-400/30 rounded-2xl flex items-center justify-center border border-purple-500/50"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(147,51,234,0.3)",
                    "0 0 40px rgba(251,146,60,0.4)",
                    "0 0 20px rgba(147,51,234,0.3)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <TrendingUp className="w-10 h-10 text-purple-400" />
              </motion.div>

              {/* Floating coins */}
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <motion.div
                  key={angle}
                  className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transformOrigin: "0 0",
                  }}
                  animate={{
                    rotate: angle + 360,
                    x: 35 * Math.cos((angle * Math.PI) / 180),
                    y: 35 * Math.sin((angle * Math.PI) / 180),
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
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
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-coral-400 bg-clip-text text-transparent">
              REWARDING
            </span>
            <br />
            <span className="bg-gradient-to-r from-mint-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              EXCELLENCE
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            Your commitment to Web3 should be rewarded. Earn while you learn,
            trade, and grow.
            <span className="block mt-2 text-lg text-purple-400 font-semibold">
              The more you engage, the more you earn.
            </span>
          </motion.p>
        </motion.div>

        {/* Growth Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32"
        >
          {growthStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group text-center relative"
            >
              <div className="relative p-6 bg-gradient-to-br from-card/60 to-muted/30 backdrop-blur-sm border border-border/30 rounded-2xl group-hover:border-purple-500/50 transition-all duration-300">
                <motion.div
                  className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-coral-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm font-bold text-foreground mb-2">
                  {stat.label}
                </div>
                <motion.div
                  className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/30"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                  viewport={{ once: true }}
                >
                  {stat.growth}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Reward Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TIER REWARDS
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Unlock exclusive benefits as you grow your Web3 portfolio and
              engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rewardTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: tier.delay,
                  type: "spring",
                  stiffness: 100,
                }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-coral-500 rounded-3xl opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200 blur-sm" />

                {/* Card */}
                <motion.div
                  className={cn(
                    "relative p-8 bg-gradient-to-br backdrop-blur-xl border-2 rounded-3xl transition-all duration-500 hover:scale-105",
                    tier.gradient,
                    tier.border,
                    index === 1 && "transform scale-105 border-mint-400/50", // Highlight middle tier
                  )}
                  whileHover={{
                    rotateY: 5,
                    rotateX: 5,
                    z: 50,
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="text-4xl">{tier.badge}</div>
                  </div>

                  {/* Icon with progress ring */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <CircularProgress
                        percentage={index === 0 ? 65 : index === 1 ? 85 : 95}
                        color={tier.color}
                        delay={tier.delay + 0.5}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <tier.icon
                          className={cn("w-6 h-6", `text-${tier.color}-400`)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-2xl font-bold text-foreground mb-2 group-hover:text-white transition-colors duration-300 text-center">
                    {tier.name}
                  </h4>

                  <div className="text-center mb-6">
                    <div
                      className={cn(
                        "text-lg font-semibold mb-4",
                        `text-${tier.color}-400`,
                      )}
                    >
                      {tier.requirements}
                    </div>

                    <div className="space-y-3">
                      {tier.benefits.map((benefit, i) => (
                        <motion.div
                          key={benefit}
                          className="flex items-center justify-center text-sm text-muted-foreground group-hover:text-gray-300 transition-colors duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: tier.delay + 0.8 + i * 0.1,
                          }}
                          viewport={{ once: true }}
                        >
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full mr-3",
                              `bg-${tier.color}-400`,
                            )}
                          />
                          {benefit}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Popular badge for middle tier */}
                  {index === 1 && (
                    <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-mint-400 to-cyan-400 text-white text-xs font-bold rounded-full transform rotate-12">
                      POPULAR
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits with Charts */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-coral-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                EARNING OPPORTUNITIES
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Multiple ways to earn rewards and grow your Web3 wealth
              automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{
                  opacity: 0,
                  x: index % 2 === 0 ? -40 : 40,
                  scale: 0.9,
                }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
                viewport={{ once: true }}
                className="group relative p-8 bg-gradient-to-br from-card/60 to-muted/40 backdrop-blur-xl border border-border/50 rounded-3xl hover:border-purple-500/50 transition-all duration-500 hover:scale-105"
              >
                {/* Icon */}
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    className={cn(
                      "w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg",
                      `from-${benefit.color}-500 to-${benefit.color}-600`,
                    )}
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <benefit.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  <div className="text-right">
                    <motion.div
                      className={cn(
                        "text-2xl font-black",
                        `text-${benefit.color}-400`,
                      )}
                      whileHover={{ scale: 1.1 }}
                    >
                      {benefit.metric}
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <h4 className="text-xl font-bold text-foreground mb-4 group-hover:text-white transition-colors duration-300">
                  {benefit.title}
                </h4>
                <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-300 leading-relaxed mb-6">
                  {benefit.description}
                </p>

                {/* Chart */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                  viewport={{ once: true }}
                >
                  <AnimatedChart
                    data={benefit.chart}
                    color={benefit.color}
                    delay={index * 0.2 + 0.3}
                  />
                </motion.div>

                {/* Growth indicator */}
                <motion.div
                  className="absolute top-4 right-4 px-2 py-1 bg-emerald-400/20 border border-emerald-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">
                      GROWING
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rewards CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative p-12 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-coral-900/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl max-w-5xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-coral-500 rounded-3xl opacity-20 blur-sm" />

            <div className="relative">
              <motion.div
                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-coral-500/20 rounded-full flex items-center justify-center border border-purple-500/30"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(147,51,234,0.3)",
                    "0 0 60px rgba(251,146,60,0.4)",
                    "0 0 20px rgba(147,51,234,0.3)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Gift className="w-12 h-12 text-purple-400" />
              </motion.div>

              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-coral-400 bg-clip-text text-transparent">
                  Start Earning Today
                </span>
              </h3>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                Don't wait for tomorrow's opportunities. Start earning rewards
                right now and watch your Web3 wealth grow exponentially.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-coral-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all duration-500"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 50px rgba(147,51,234,0.8)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3" />
                    Start Earning
                  </span>
                </motion.button>

                <motion.button
                  className="px-10 py-4 border-2 border-purple-500/50 text-purple-300 text-lg font-bold rounded-2xl hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3" />
                    View Analytics
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-8 opacity-40">
        <GeometricShape
          variant="prism"
          color="purple"
          size="md"
          animation="rotate"
          delay={0}
        />
      </div>
      <div className="absolute bottom-1/3 right-8 opacity-50">
        <GeometricShape
          variant="sphere"
          color="coral"
          size="lg"
          animation="float"
          delay={2}
        />
      </div>
      <div className="absolute top-2/3 left-1/4 opacity-30">
        <GeometricShape
          variant="cube"
          color="mint"
          size="sm"
          animation="pulse"
          delay={4}
        />
      </div>
    </section>
  );
}
