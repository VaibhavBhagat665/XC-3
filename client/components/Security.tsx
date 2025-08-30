import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Fingerprint,
  Award,
  CheckCircle,
  AlertTriangle,
  Zap,
  Users,
  Globe,
} from "lucide-react";
import { GeometricShape } from "./GeometricShapes";
import { cn } from "@/lib/utils";

const securityFeatures = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description:
      "Military-grade AES-256 encryption protects your data and transactions at all times.",
    percentage: "99.99%",
    label: "Security Rating",
    color: "purple",
    gradient: "from-purple-500/20 to-indigo-600/20",
    border: "border-purple-500/30",
  },
  {
    icon: Fingerprint,
    title: "Biometric Authentication",
    description:
      "Advanced biometric security including Face ID, Touch ID, and voice recognition.",
    percentage: "100%",
    label: "Hack-Free Record",
    color: "mint",
    gradient: "from-emerald-400/20 to-teal-500/20",
    border: "border-emerald-400/30",
  },
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description:
      "24/7 threat detection and automated response systems protect your assets.",
    percentage: "0.001s",
    label: "Response Time",
    color: "coral",
    gradient: "from-orange-400/20 to-red-500/20",
    border: "border-orange-400/30",
  },
  {
    icon: Lock,
    title: "Multi-Signature Wallets",
    description:
      "Enterprise-grade multi-sig wallets with customizable security policies.",
    percentage: "$50B+",
    label: "Assets Protected",
    color: "cyan",
    gradient: "from-cyan-400/20 to-blue-500/20",
    border: "border-cyan-400/30",
  },
];

const trustIndicators = [
  {
    icon: Award,
    title: "SOC 2 Certified",
    description: "Independently audited security controls",
  },
  {
    icon: CheckCircle,
    title: "Open Source",
    description: "Transparent, community-verified code",
  },
  {
    icon: Users,
    title: "10M+ Users",
    description: "Active community members",
  },
  {
    icon: Globe,
    title: "Global Compliance",
    description: "Regulated in 150+ countries",
  },
];

const securityStats = [
  { number: "0", label: "Security Breaches", sublabel: "in 5+ years" },
  { number: "$50B+", label: "Assets Secured", sublabel: "and growing" },
  { number: "99.99%", label: "Uptime", sublabel: "guaranteed SLA" },
  { number: "24/7", label: "Monitoring", sublabel: "threat detection" },
];

export function Security() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/8 via-pink-500/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-gradient-to-tl from-mint-400/8 via-cyan-400/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-gradient-to-br from-coral-400/6 to-transparent rounded-full blur-2xl" />
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center border border-purple-500/50"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(147,51,234,0.3)",
                    "0 0 40px rgba(147,51,234,0.5)",
                    "0 0 20px rgba(147,51,234,0.3)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Shield className="w-10 h-10 text-purple-400" />
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-mint-400 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
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
              BANK-LEVEL
            </span>
            <br />
            <span className="bg-gradient-to-r from-mint-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SECURITY
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
          >
            Your digital assets deserve the highest level of protection.
            <span className="block mt-2 text-lg text-purple-400 font-semibold">
              Trust in technology, backed by industry-leading security
              standards.
            </span>
          </motion.p>
        </motion.div>

        {/* Security Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24"
        >
          {securityStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <motion.div
                className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-coral-400 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
              >
                {stat.number}
              </motion.div>
              <div className="text-lg font-bold text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
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
              className="group relative"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-coral-500 rounded-3xl opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200 blur-sm" />

              {/* Card */}
              <motion.div
                className={cn(
                  "relative p-8 bg-gradient-to-br backdrop-blur-xl border-2 rounded-3xl transition-all duration-500 hover:scale-105",
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
                {/* Icon and Percentage */}
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    className={cn(
                      "w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg",
                      `from-${feature.color}-500 to-${feature.color}-600`,
                    )}
                    whileHover={{
                      rotate: [0, -10, 10, 0],
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <div className="text-right">
                    <motion.div
                      className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                      whileHover={{ scale: 1.1 }}
                    >
                      {feature.percentage}
                    </motion.div>
                    <div className="text-sm text-muted-foreground font-semibold">
                      {feature.label}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Security Badge */}
                <motion.div
                  className="absolute top-4 right-4 px-3 py-1 bg-emerald-400/20 border border-emerald-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">
                      SECURE
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/3 left-8 opacity-30">
        <GeometricShape
          variant="pyramid"
          color="purple"
          size="md"
          animation="float"
          delay={0}
        />
      </div>
      <div className="absolute bottom-1/4 right-8 opacity-40">
        <GeometricShape
          variant="hexagon"
          color="mint"
          size="lg"
          animation="rotate"
          delay={1}
        />
      </div>
    </section>
  );
}
