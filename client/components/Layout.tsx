import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { XC3DiamondLogo } from "./XC3DiamondLogo";
import {
  Globe,
  Github,
  MessageCircle,
  BookOpen,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Heart,
  Sparkles,
} from "lucide-react";
import { GlowingBorder, FloatingElement } from "./ScrollAnimations";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <Navigation />

      <main className="safe-top relative">{children}</main>

      <Footer />
    </div>
  );
}

function Footer() {
  const quickLinks = [
    { name: "Carbon Registry", href: "/projects", icon: "🌱", color: "green" },
    { name: "Trading Hub", href: "/market", icon: "📊", color: "blue" },
    { name: "DeFi Vault", href: "/lend", icon: "🏦", color: "purple" },
    { name: "Live Analytics", href: "/activity", icon: "📈", color: "cyan" },
  ];

  const communityLinks = [
    { name: "Documentation", href: "#", icon: BookOpen, color: "blue" },
    { name: "GitHub", href: "#", icon: Github, color: "gray" },
    { name: "Discord", href: "#", icon: MessageCircle, color: "purple" },
    { name: "Twitter", href: "#", icon: MessageCircle, color: "cyan" },
  ];


  return (
    <footer className="relative bg-gradient-to-br from-background via-card to-background border-t-2 border-border/20 overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <FloatingElement
          className="absolute top-16 right-16"
          duration={25}
          delay={0}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded-full border border-cyan-400/20" />
        </FloatingElement>
        <FloatingElement
          className="absolute bottom-16 left-16"
          duration={30}
          delay={3}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-2xl rotate-45 border border-purple-400/20" />
        </FloatingElement>

        {/* Minimal grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Top Section - Minimal Brand & Stats */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 pb-8 border-b border-border/20">
          {/* Brand */}
          <div className="flex items-center space-x-6 mb-8 lg:mb-0">
            <div className="relative">
              <XC3DiamondLogo
                size="xl"
                showText={false}
                className="hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                XC3
              </h3>
              <p className="text-lg text-muted-foreground font-medium">
                Universal Carbon Credits
              </p>
              <p className="text-sm text-muted-foreground/80">
                Making Web3 green & profitable 🌱
              </p>
            </div>
          </div>

        </div>

        {/* Links Section - Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Quick Access */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-foreground flex items-center">
              <Zap className="w-5 h-5 mr-2 text-cyan-400" />
              Quick Access
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`group flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-${link.color}-400/10 to-${link.color}-400/5 border border-${link.color}-400/20 hover:border-${link.color}-400/40 transition-all duration-300 hover:scale-105`}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </span>
                  <span
                    className={`font-medium text-muted-foreground group-hover:text-${link.color}-400 transition-colors duration-300`}
                  >
                    {link.name}
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 text-${link.color}-400/60 group-hover:text-${link.color}-400 group-hover:translate-x-1 transition-all duration-300 ml-auto`}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
{/*           <div className="space-y-6">
            <h4 className="text-xl font-bold text-foreground flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-400" />
              Community
            </h4>
            <div className="space-y-3">
              {communityLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={index}
                    href={link.href}
                    className={`group flex items-center space-x-3 p-2 rounded-lg hover:bg-${link.color}-400/10 transition-all duration-300`}
                  >
                    <IconComponent
                      className={`w-4 h-4 text-${link.color}-400 group-hover:scale-110 transition-transform duration-300`}
                    />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div> */}

          {/* Mission */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-foreground flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-400" />
              Our Mission
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Making environmental impact{" "}
              <span className="font-bold text-green-400">profitable</span>,
              <span className="font-bold text-cyan-400">accessible</span>, and
              <span className="font-bold text-purple-400">fun</span> for
              everyone in Web3.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">
                Making the world greener, one credit at a time
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section - Minimal & Clean */}
        <div className="border-t border-border/10 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Left side */}
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-8">
              <p className="text-sm text-muted-foreground font-medium">
                © 2025 XC3 Protocol. Built with 💚 for the planet.
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2 px-3 py-1 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                  <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span className="text-cyan-400 font-medium">
                    Powered by ZetaChain
                  </span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-400/10 rounded-full border border-green-400/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-medium">
                    All Systems Green
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - CTA */}
            <GlowingBorder
              color="cyan"
              intensity="medium"
              className="px-6 py-3 bg-gradient-to-r from-cyan-900/20 to-purple-900/20"
            >
              <a
                href="/"
                className="group flex items-center space-x-3 text-cyan-400 hover:text-cyan-300 transition-all duration-300"
              >
                <span className="font-bold">Start Your Carbon Journey</span>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </a>
            </GlowingBorder>
          </div>
        </div>
      </div>
    </footer>
  );
}
