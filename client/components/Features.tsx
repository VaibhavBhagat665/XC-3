import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Users,
  Coins,
  Lock,
  Smartphone,
  BarChart3,
  Layers,
  Wallet,
  ArrowRightLeft,
} from "lucide-react";
import { GeometricShape } from "./GeometricShapes";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Wallet,
    title: "Universal Wallet",
    description:
      "One wallet for all your crypto assets across multiple chains. Seamlessly manage, send, and receive tokens.",
    color: "purple",
    gradient: "from-purple-500/20 via-indigo-500/15 to-purple-600/20",
    border: "border-purple-500/30",
    iconBg: "from-purple-500 to-indigo-600",
    delay: 0.1,
  },
  {
    icon: ArrowRightLeft,
    title: "Instant Swaps",
    description:
      "Lightning-fast token swaps with the best rates across DEXs. No slippage, maximum efficiency.",
    color: "mint",
    gradient: "from-emerald-400/20 via-teal-400/15 to-mint-400/20",
    border: "border-emerald-400/30",
    iconBg: "from-emerald-400 to-teal-500",
    delay: 0.2,
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "Military-grade encryption, hardware wallet support, and smart contract audits for ultimate protection.",
    color: "coral",
    gradient: "from-orange-400/20 via-red-400/15 to-coral-400/20",
    border: "border-orange-400/30",
    iconBg: "from-orange-400 to-red-500",
    delay: 0.3,
  },
  {
    icon: Globe,
    title: "Multi-Chain Bridge",
    description:
      "Connect and transfer assets across 15+ blockchains. Ethereum, BSC, Polygon, Avalanche, and more.",
    color: "cyan",
    gradient: "from-cyan-400/20 via-blue-400/15 to-sky-400/20",
    border: "border-cyan-400/30",
    iconBg: "from-cyan-400 to-blue-500",
    delay: 0.4,
  },
  {
    icon: TrendingUp,
    title: "DeFi Analytics",
    description:
      "Real-time portfolio tracking, yield farming insights, and advanced analytics to maximize your returns.",
    color: "pink",
    gradient: "from-pink-400/20 via-rose-400/15 to-pink-500/20",
    border: "border-pink-400/30",
    iconBg: "from-pink-400 to-rose-500",
    delay: 0.5,
  },
  {
    icon: Users,
    title: "Social Trading",
    description:
      "Follow top traders, copy strategies, and join trading communities. Learn from the best in Web3.",
    color: "lavender",
    gradient: "from-violet-400/20 via-purple-400/15 to-lavender/20",
    border: "border-violet-400/30",
    iconBg: "from-violet-400 to-purple-500",
    delay: 0.6,
  },
];

const advancedFeatures = [
  {
    icon: Lock,
    title: "Hardware Integration",
    description: "Seamless Ledger and Trezor support",
    metric: "99.9% Secure",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Native iOS and Android apps",
    metric: "1M+ Downloads",
  },
  {
    icon: BarChart3,
    title: "Advanced Trading",
    description: "Professional trading tools and API",
    metric: "$50B+ Volume",
  },
  {
    icon: Layers,
    title: "Layer 2 Ready",
    description: "Optimism, Arbitrum, Polygon support",
    metric: "90% Lower Fees",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-mint-400/10 via-cyan-400/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-mint-400 bg-clip-text text-transparent">
              POWERFUL FEATURES
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            Everything you need to navigate the decentralized web with
            confidence and security.
            <span className="block mt-2 text-lg text-purple-400 font-semibold">
              Built for the next generation of Web3 users.
            </span>
          </motion.p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: feature.delay,
                type: "spring",
                stiffness: 100,
              }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div
                className={cn(
                  "absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200 rounded-3xl blur-sm",
                  feature.iconBg.replace("to-", "via-purple-600 to-"),
                )}
              />

              {/* Card */}
              <motion.div
                className={cn(
                  "relative p-8 bg-gradient-to-br backdrop-blur-xl border-2 rounded-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2",
                  feature.gradient,
                  feature.border,
                )}
                whileHover={{
                  rotateY: 5,
                  rotateX: 5,
                  z: 50,
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Icon */}
                <motion.div
                  className={cn(
                    "w-16 h-16 mb-6 bg-gradient-to-br rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg",
                    feature.iconBg,
                  )}
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <GeometricShape
                    variant="diamond"
                    color={feature.color as any}
                    size="sm"
                    animation="pulse"
                    delay={index * 0.2}
                  />
                </div>

                {/* Hover Highlight */}
                <div className="absolute top-4 left-4 w-1/4 h-1/4 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Advanced Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ADVANCED CAPABILITIES
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Professional-grade tools and integrations for power users and
              institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-6 bg-gradient-to-br from-card/60 to-muted/40 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </motion.div>

                  <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h4>

                  <p className="text-sm text-muted-foreground mb-3 group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>

                  <div className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                    {feature.metric}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative p-12 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-coral-900/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl max-w-4xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-coral-500 rounded-3xl opacity-20 blur-sm" />

            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-coral-400 bg-clip-text text-transparent">
                  Ready to Experience Web3?
                </span>
              </h3>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join millions of users who trust us with their digital assets.
                Start your Web3 journey today.
              </p>

              <motion.button
                className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-coral-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all duration-500"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(147,51,234,0.8)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center">
                  <Zap className="w-6 h-6 mr-3" />
                  Get Started Now
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
