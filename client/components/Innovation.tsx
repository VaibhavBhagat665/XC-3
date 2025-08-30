import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Cpu,
  Brain,
  Zap,
  Layers,
  Globe,
  Shield,
  Rocket,
  Code,
  Database,
  Network,
  Sparkles,
  ArrowRight,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  ScrollReveal,
  StaggeredGrid,
  PageSection,
  FloatingElement,
  GlowingBorder,
} from "./ScrollAnimations";

export function Innovation() {
  const techStack = [
    {
      icon: Brain,
      title: "AI-Powered Verification",
      description:
        "Advanced machine learning algorithms that analyze satellite data, IoT sensors, and project documentation with 99.9% accuracy",
      features: [
        "Satellite Image Analysis",
        "Real-time Monitoring",
        "Fraud Detection",
        "Automated Scoring",
      ],
      color: "cyan",
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-900/30 to-blue-900/30",
    },
    {
      icon: Globe,
      title: "Omnichain Infrastructure",
      description:
        "ZetaChain's cutting-edge technology enables seamless cross-chain transactions across 12+ blockchains with unified liquidity",
      features: [
        "Cross-Chain Messaging",
        "Unified Liquidity",
        "Instant Settlements",
        "Multi-Chain Support",
      ],
      color: "purple",
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-900/30 to-pink-900/30",
    },
    {
      icon: Shield,
      title: "Security Excellence",
      description:
        "Enterprise-grade security with multi-signature wallets, time-locked contracts, and comprehensive audit protocols",
      features: [
        "Multi-Sig Security",
        "Smart Contract Audits",
        "Time-Locked Vaults",
        "Insurance Coverage",
      ],
      color: "green",
      gradient: "from-green-400 to-lime-500",
      bgGradient: "from-green-900/30 to-lime-900/30",
    },
    {
      icon: Layers,
      title: "Modular Architecture",
      description:
        "Flexible, scalable infrastructure built for enterprise adoption with plug-and-play components and API-first design",
      features: [
        "Microservices",
        "API Gateway",
        "Plugin System",
        "Horizontal Scaling",
      ],
      color: "orange",
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-900/30 to-red-900/30",
    },
  ];

  const innovations = [
    {
      icon: Cpu,
      title: "Quantum-Ready Cryptography",
      status: "In Development",
      description:
        "Preparing for the quantum era with post-quantum cryptographic algorithms",
      progress: 65,
      color: "purple",
    },
    {
      icon: Network,
      title: "Carbon Oracle Network",
      status: "Beta Testing",
      description:
        "Decentralized oracle network for real-time environmental data feeds",
      progress: 85,
      color: "cyan",
    },
    {
      icon: Database,
      title: "IPFS Integration",
      status: "Live",
      description:
        "Distributed storage for carbon credit documentation and proofs",
      progress: 100,
      color: "green",
    },
    {
      icon: Code,
      title: "Smart Contract 3.0",
      status: "Research",
      description:
        "Next-generation contracts with built-in environmental impact tracking",
      progress: 30,
      color: "orange",
    },
  ];

  const metrics = [
    {
      value: "99.9%",
      label: "AI Accuracy",
      description: "In carbon credit verification",
      icon: Brain,
      color: "cyan",
    },
    {
      value: "<2s",
      label: "Cross-Chain Speed",
      description: "Average transaction time",
      icon: Zap,
      color: "yellow",
    },
    {
      value: "12+",
      label: "Blockchains",
      description: "Supported networks",
      icon: Globe,
      color: "purple",
    },
    {
      value: "100%",
      label: "Uptime",
      description: "Platform reliability",
      icon: Activity,
      color: "green",
    },
  ];

  return (
    <PageSection id="innovation" background="dark" className="overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <FloatingElement
          className="absolute top-1/4 right-10 opacity-15"
          duration={18}
          delay={0}
        >
          <div className="w-48 h-48 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-full border border-purple-400/30" />
        </FloatingElement>
        <FloatingElement
          className="absolute bottom-1/3 left-10 opacity-20"
          duration={22}
          delay={3}
        >
          <div className="w-36 h-36 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-3xl rotate-45 border border-green-400/30" />
        </FloatingElement>

        {/* Tech Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="text-center mb-20">
            <div className="flex justify-center mb-8">
              <GlowingBorder
                color="purple"
                className="inline-flex items-center space-x-3 bg-card/50 px-8 py-4"
              >
                <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />
                <span className="text-purple-400 font-bold text-lg">
                  Cutting-Edge Tech
                </span>
                <Sparkles
                  className="w-6 h-6 text-cyan-400 animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </GlowingBorder>
            </div>

            <h2 className="text-6xl md:text-8xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                INNOVATION
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                UNLEASHED
              </span>
            </h2>

            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
              Pushing the boundaries of what's possible in{" "}
              <span className="font-black text-purple-400">Web3</span>,
              <span className="font-black text-cyan-400"> AI</span>, and
              <span className="font-black text-green-400">
                {" "}
                environmental tech
              </span>
              ! 🚀
            </p>
          </div>
        </ScrollReveal>

        {/* Technology Stack */}
        <ScrollReveal animation="zip-in" delay={400}>
          <div className="mb-24">
            <h3 className="text-4xl md:text-5xl font-black text-center mb-16">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                TECH POWERHOUSE
              </span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {techStack.map((tech, index) => {
                const IconComponent = tech.icon;
                return (
                  <Card
                    key={index}
                    className={`group relative overflow-hidden p-8 bg-gradient-to-br ${tech.bgGradient} border-2 border-${tech.color}-400/30 hover:border-${tech.color}-400/60 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(var(--${tech.color}-400),0.4)] cursor-pointer`}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start space-x-6 mb-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${tech.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_30px_rgba(var(--${tech.color}-400),0.4)]`}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-black text-foreground mb-3">
                            {tech.title}
                          </h4>
                          <p className="text-muted-foreground text-lg leading-relaxed">
                            {tech.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {tech.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className={`flex items-center space-x-2 p-2 bg-${tech.color}-400/10 rounded-lg border border-${tech.color}-400/20`}
                          >
                            <div
                              className={`w-2 h-2 bg-${tech.color}-400 rounded-full`}
                            />
                            <span className="text-sm text-muted-foreground font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-${tech.color}-400/10 to-${tech.color}-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Innovation Pipeline */}
        <ScrollReveal animation="unzip" delay={600}>
          <div className="mb-24">
            <h3 className="text-4xl md:text-5xl font-black text-center mb-4">
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                INNOVATION PIPELINE
              </span>
            </h3>
            <p className="text-xl text-center text-muted-foreground mb-16 font-light">
              What we're building next to revolutionize carbon markets 🔬
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {innovations.map((innovation, index) => {
                const IconComponent = innovation.icon;
                return (
                  <Card
                    key={index}
                    className="group relative overflow-hidden p-8 bg-gradient-to-br from-card/50 to-muted/30 border-2 border-border/30 hover:border-current/60 transition-all duration-500 hover:scale-105 cursor-pointer"
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br from-${innovation.color}-400 to-${innovation.color}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          >
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-foreground">
                              {innovation.title}
                            </h4>
                            <span
                              className={`inline-block px-3 py-1 bg-${innovation.color}-400/20 text-${innovation.color}-400 rounded-full text-sm font-medium border border-${innovation.color}-400/30`}
                            >
                              {innovation.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6">
                        {innovation.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Progress
                          </span>
                          <span
                            className={`text-sm font-bold text-${innovation.color}-400`}
                          >
                            {innovation.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-border/30 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r from-${innovation.color}-400 to-${innovation.color}-500 h-2 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(var(--${innovation.color}-400),0.6)]`}
                            style={{ width: `${innovation.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-${innovation.color}-400/5 to-${innovation.color}-400/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Performance Metrics */}
        <ScrollReveal animation="fade-up" delay={800}>
          <div className="mb-24">
            <h3 className="text-4xl md:text-5xl font-black text-center mb-16">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                PERFORMANCE METRICS
              </span>
            </h3>

            <StaggeredGrid
              staggerDelay={150}
              gridCols={2}
              className="md:grid-cols-4 max-w-5xl mx-auto"
            >
              {metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card
                    key={index}
                    className="group text-center p-8 bg-gradient-to-br from-card/50 to-muted/30 border-2 border-border/30 hover:border-current/60 transition-all duration-500 hover:scale-105 cursor-pointer"
                  >
                    <div
                      className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-${metric.color}-400 to-${metric.color}-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-[0_0_30px_rgba(var(--${metric.color}-400),0.4)]`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div
                      className={`text-4xl font-black mb-2 text-${metric.color}-400 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {metric.value}
                    </div>
                    <div className="text-lg font-bold text-foreground mb-1">
                      {metric.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.description}
                    </div>
                  </Card>
                );
              })}
            </StaggeredGrid>
          </div>
        </ScrollReveal>

        {/* Innovation CTA */}
        <ScrollReveal animation="zip-in" delay={1000}>
          <GlowingBorder
            color="cyan"
            intensity="high"
            className="p-12 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-blue-900/20 border-4 border-transparent relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-purple-400/5 to-blue-400/5 animate-pulse" />

            <div className="relative z-10 text-center">
              <div className="flex justify-center items-center space-x-4 mb-8">
                <Rocket className="w-8 h-8 text-cyan-400 animate-bounce" />
                <h3 className="text-4xl md:text-5xl font-black">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    BUILD THE FUTURE
                  </span>
                </h3>
                <BarChart3 className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>

              <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                Want to contribute to our{" "}
                <span className="font-black text-cyan-400">open-source</span>{" "}
                initiatives? Join our team of innovators building the future of{" "}
                <span className="font-black text-purple-400">
                  environmental finance
                </span>
                !
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-xl px-12 py-6 rounded-3xl font-black shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:shadow-[0_0_60px_rgba(34,211,238,0.9)] transition-all duration-300 hover:scale-110"
                >
                  <span className="relative z-10 flex items-center">
                    <Code className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                    CONTRIBUTE CODE
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-10 py-6 rounded-3xl font-bold border-2 border-purple-400/50 text-purple-400 hover:bg-purple-400/10 hover:border-purple-400 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] backdrop-blur-sm"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  View Roadmap
                </Button>
              </div>
            </div>
          </GlowingBorder>
        </ScrollReveal>
      </div>
    </PageSection>
  );
}
