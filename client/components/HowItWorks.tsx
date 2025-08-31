import { motion } from "framer-motion";
import {
  Upload,
  Brain,
  Coins,
  TrendingUp,
  ArrowRight,
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import { GeometricShape } from "./GeometricShapes";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Upload,
    title: "Register Project",
    description: "Upload your carbon offset project documentation for AI verification",
    details: [
      "Submit project documents",
      "Provide location & methodology",
      "Upload supporting evidence"
    ],
    color: "purple",
    gradient: "from-purple-500/20 to-indigo-600/20",
    border: "border-purple-500/30",
    iconBg: "from-purple-500 to-indigo-600",
    delay: 0.1,
  },
  {
    icon: Brain,
    title: "AI Verification",
    description: "Our Gemini AI analyzes and verifies your project in minutes",
    details: [
      "Document authenticity check",
      "Compliance verification",
      "Risk assessment & scoring"
    ],
    color: "mint",
    gradient: "from-emerald-400/20 to-teal-500/20",
    border: "border-emerald-400/30",
    iconBg: "from-emerald-400 to-teal-500",
    delay: 0.2,
  },
  {
    icon: Coins,
    title: "Mint Credits",
    description: "Verified projects generate tokenized carbon credits as ERC-1155 tokens",
    details: [
      "Smart contract deployment",
      "Token minting on-chain",
      "Credits ready for trading"
    ],
    color: "coral",
    gradient: "from-orange-400/20 to-red-500/20",
    border: "border-orange-400/30",
    iconBg: "from-orange-400 to-red-500",
    delay: 0.3,
  },
  {
    icon: TrendingUp,
    title: "Trade & Lend",
    description: "Use your carbon credits as collateral or trade them in our marketplace",
    details: [
      "Marketplace trading",
      "Collateral for loans",
      "Cross-chain transfers"
    ],
    color: "cyan",
    gradient: "from-cyan-400/20 to-blue-500/20",
    border: "border-cyan-400/30",
    iconBg: "from-cyan-400 to-blue-500",
    delay: 0.4,
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Minutes vs Months",
    description: "AI verification reduces time from 3-6 months to 2-5 minutes",
  },
  {
    icon: Shield,
    title: "Transparent & Secure",
    description: "Blockchain-based verification with immutable records",
  },
  {
    icon: FileText,
    title: "Cross-Chain Ready",
    description: "Deploy on Ethereum, Polygon, ZetaChain, and more",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/8 via-pink-500/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-mint-400/8 via-cyan-400/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-br from-coral-400/6 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
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
              HOW IT WORKS
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            From project registration to carbon credit trading in four simple steps.
            <span className="block mt-2 text-lg text-purple-400 font-semibold">
              Revolutionary AI verification meets blockchain transparency.
            </span>
          </motion.p>
        </motion.div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: step.delay,
                type: "spring",
                stiffness: 100,
              }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Connection Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 z-20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: step.delay + 0.5 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="w-8 h-8 text-purple-400/60" />
                  </motion.div>
                </div>
              )}

              {/* Card */}
              <motion.div
                className={cn(
                  "relative p-8 bg-gradient-to-br backdrop-blur-xl border-2 rounded-3xl transition-all duration-500 hover:scale-105",
                  step.gradient,
                  step.border,
                )}
                whileHover={{
                  rotateY: 5,
                  rotateX: 5,
                  z: 50,
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  className={cn(
                    "w-16 h-16 mb-6 bg-gradient-to-br rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg",
                    step.iconBg,
                  )}
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-white transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-300 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Details */}
                <div className="space-y-2">
                  {step.details.map((detail, i) => (
                    <motion.div
                      key={detail}
                      className="flex items-center text-sm text-muted-foreground group-hover:text-gray-300 transition-colors duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: step.delay + 0.6 + i * 0.1,
                      }}
                      viewport={{ once: true }}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mr-3",
                          `bg-${step.color}-400`,
                        )}
                      />
                      {detail}
                    </motion.div>
                  ))}
                </div>

                {/* Decorative Element */}
                <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  <GeometricShape
                    variant="diamond"
                    color={step.color as any}
                    size="sm"
                    animation="pulse"
                    delay={index * 0.2}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                WHY XC3?
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing carbon credit markets with cutting-edge technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative p-8 bg-gradient-to-br from-card/60 to-muted/40 backdrop-blur-xl border border-border/50 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <motion.div
                  className="w-12 h-12 mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 15 }}
                >
                  <benefit.icon className="w-6 h-6 text-purple-400" />
                </motion.div>

                <h4 className="text-xl font-bold text-foreground mb-3 group-hover:text-purple-300 transition-colors duration-300">
                  {benefit.title}
                </h4>

                <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative p-12 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-mint-900/20 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl max-w-4xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-mint-400 rounded-3xl opacity-20 blur-sm" />

            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-mint-400 bg-clip-text text-transparent">
                  Ready to Transform Carbon Markets?
                </span>
              </h3>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join the revolution in carbon credit verification and trading.
                Experience the power of AI and blockchain working together.
              </p>

              <motion.button
                className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-mint-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all duration-500"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 50px rgba(147,51,234,0.8)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center">
                  <Upload className="w-6 h-6 mr-3" />
                  Start Your Project
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-8 opacity-40">
        <GeometricShape
          variant="cube"
          color="purple"
          size="md"
          animation="float"
          delay={0}
        />
      </div>
      <div className="absolute bottom-1/3 right-8 opacity-50">
        <GeometricShape
          variant="sphere"
          color="mint"
          size="lg"
          animation="rotate"
          delay={2}
        />
      </div>
      <div className="absolute top-2/3 left-1/4 opacity-30">
        <GeometricShape
          variant="diamond"
          color="coral"
          size="sm"
          animation="pulse"
          delay={4}
        />
      </div>
    </section>
  );
}
