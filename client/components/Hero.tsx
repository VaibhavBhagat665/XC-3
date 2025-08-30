import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles, Zap, Globe, Shield } from "lucide-react";
import { FloatingShapes, GeometricShape } from "./GeometricShapes";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/projects");
  };

  const handleExploreFeatures = () => {
    // Smooth scroll to features section
    const featuresSection = document.querySelector("#features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-slate-900/50">
      {/* Animated Background Shapes */}
      <FloatingShapes count={12} className="opacity-40" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147,51,234,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236,72,153,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-mint-green/20 via-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-coral-orange/15 via-lavender/10 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-mint-400 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative px-8 py-4 bg-background/80 backdrop-blur-xl rounded-full border border-purple-500/30">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-mint-400 bg-clip-text text-transparent">
                    Web3 Powered
                  </span>
                  <div className="flex items-center space-x-2 bg-emerald-400/20 px-3 py-1 rounded-full border border-emerald-400/30">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">
                      LIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.85] tracking-tight">
              <motion.span
                className="block bg-gradient-to-r from-purple-400 via-pink-400 to-coral-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                UNLOCK THE
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-mint-400 via-cyan-400 to-lavender bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                FUTURE OF WEB3
              </motion.span>
            </h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-2xl md:text-3xl font-bold text-muted-foreground mb-6"
            >
              One Hub, Endless Possibilities
            </motion.div>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
              Experience the next generation of{" "}
              <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                decentralized finance
              </span>{" "}
              with seamless cross-chain interactions and unparalleled security.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full font-semibold border border-purple-500/30">
                <Shield className="w-4 h-4 inline mr-2" />
                Bank-Level Security
              </span>
              <span className="px-4 py-2 bg-mint-400/20 text-mint-300 rounded-full font-semibold border border-mint-400/30">
                <Globe className="w-4 h-4 inline mr-2" />
                Multi-Chain Support
              </span>
              <span className="px-4 py-2 bg-coral-400/20 text-coral-300 rounded-full font-semibold border border-coral-400/30">
                <Zap className="w-4 h-4 inline mr-2" />
                Lightning Fast
              </span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-coral-500 text-white text-xl px-10 py-6 rounded-2xl font-bold shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all duration-500 hover:scale-105"
            >
              <motion.span
                className="relative z-10 flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                Get Started
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-mint-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleExploreFeatures}
              className="text-xl px-10 py-6 rounded-2xl font-bold border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 hover:scale-105 transition-all duration-500 backdrop-blur-sm"
            >
              <motion.span
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Globe className="w-6 h-6 mr-3" />
                Explore Features
              </motion.span>
            </Button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                icon: Shield,
                title: "Enterprise Security",
                description:
                  "Military-grade encryption and smart contract audits",
                color: "purple",
                gradient: "from-purple-500/20 to-indigo-500/20",
                border: "border-purple-500/30",
                text: "text-purple-300",
              },
              {
                icon: Globe,
                title: "Cross-Chain Ready",
                description:
                  "Seamlessly interact across 15+ blockchain networks",
                color: "mint",
                gradient: "from-mint-400/20 to-cyan-400/20",
                border: "border-mint-400/30",
                text: "text-mint-300",
              },
              {
                icon: Zap,
                title: "Lightning Speed",
                description: "Sub-second transactions with minimal gas fees",
                color: "coral",
                gradient: "from-coral-400/20 to-orange-400/20",
                border: "border-coral-400/30",
                text: "text-coral-300",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.6 + index * 0.2 }}
                className={cn(
                  "group relative p-8 bg-gradient-to-br backdrop-blur-xl border-2 rounded-3xl transition-all duration-500 hover:scale-105",
                  feature.gradient,
                  feature.border,
                )}
                whileHover={{ y: -5 }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-mint-400 rounded-3xl opacity-0 group-hover:opacity-20 transition duration-500 blur-sm" />
                <div className="relative">
                  <motion.div
                    className={cn(
                      "w-16 h-16 mx-auto mb-6 bg-gradient-to-br rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                      feature.gradient,
                    )}
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className={cn("w-8 h-8", feature.text)} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Decorative Geometric Shapes */}
          <div className="absolute top-1/4 left-10 opacity-60">
            <GeometricShape
              variant="cube"
              color="purple"
              size="lg"
              animation="float"
              delay={0}
            />
          </div>
          <div className="absolute top-1/3 right-16 opacity-50">
            <GeometricShape
              variant="sphere"
              color="pink"
              size="md"
              animation="rotate"
              delay={1}
            />
          </div>
          <div className="absolute bottom-1/4 left-1/4 opacity-70">
            <GeometricShape
              variant="diamond"
              color="mint"
              size="sm"
              animation="pulse"
              delay={2}
            />
          </div>
          <div className="absolute bottom-1/3 right-1/3 opacity-40">
            <GeometricShape
              variant="hexagon"
              color="coral"
              size="lg"
              animation="drift"
              delay={3}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
