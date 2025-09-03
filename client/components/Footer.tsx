import { motion } from "framer-motion";
import {
  Github,
  Youtube,
  Linkedin,
  Heart,
  Zap,
} from "lucide-react";
import { GeometricShape } from "./GeometricShapes";

const socialLinks = [
  {
    name: "GitHub",
    icon: Github,
    href: "https://github.com/VaibhavBhagat665/XC-3",
    color: "from-gray-400 to-slate-400",
    hoverColor: "hover:text-gray-300",
  },
  // {
  //   name: "Demo Video",
  //   icon: Youtube,
  //   href: "https://a6e65c76b17a4526b10a50d4149de5f4-42956381-2536-49cb-8e92-438072.fly.dev/",
  //   color: "from-red-400 to-pink-400",
  //   hoverColor: "hover:text-red-300",
  // },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/in/vaibhavbhagat5/",
    color: "from-blue-400 to-cyan-400",
    hoverColor: "hover:text-blue-300",
  },
];

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-background via-slate-950 to-background border-t border-border/20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/5 via-pink-500/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-mint-400/5 via-cyan-400/3 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147,51,234,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236,72,153,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-20">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center border border-purple-500/30 mr-4"
                  whileHover={{
                    scale: 1.1,
                    boxShadow: "0 0 20px rgba(147,51,234,0.4)",
                  }}
                >
                  <Zap className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-mint-400 bg-clip-text text-transparent">
                  XC3
                </h3>
              </div>

              <p className="text-xl text-muted-foreground leading-relaxed mb-2 max-w-2xl mx-auto">
                The future of carbon credit trading is here.
              </p>
              <p className="text-lg text-purple-400 font-semibold">
                AI-verified, cross-chain carbon credits.
              </p>
            </motion.div>

            {/* Social Links */}
            <div className="flex items-center justify-center space-x-8 mb-12">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group relative"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Enhanced Glow effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-br ${social.color} rounded-2xl opacity-0 group-hover:opacity-40 transition-all duration-500 blur-lg animate-pulse`} />
                  <div className={`absolute -inset-0.5 bg-gradient-to-br ${social.color} rounded-2xl opacity-20 group-hover:opacity-60 transition-all duration-300 blur-md`} />

                  <div
                    className={`relative w-16 h-16 bg-gradient-to-br ${social.color} opacity-30 group-hover:opacity-50 rounded-2xl flex items-center justify-center border-2 border-white/20 group-hover:border-white/40 transition-all duration-300 backdrop-blur-sm shadow-lg group-hover:shadow-2xl`}
                  >
                    <social.icon className={`w-8 h-8 text-white/80 group-hover:text-white transition-all duration-300 drop-shadow-lg`} />
                  </div>

                  {/* Enhanced Hover tooltip */}
                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/80 border border-white/20 rounded-xl text-sm text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none backdrop-blur-sm shadow-xl">
                    {social.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                  </div>

                  {/* Pulsing ring effect */}
                  <div className={`absolute inset-0 rounded-2xl border-2 border-gradient-to-br ${social.color} opacity-0 group-hover:opacity-30 animate-ping transition-opacity duration-300`} />
                </motion.a>
              ))}
            </div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8 max-w-2xl mx-auto"
            />

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-4"
            >
              <div className="text-muted-foreground text-center">
                © 2025 XC3. All rights reserved.
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-400">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
                <span>for sustainability</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-8 opacity-20">
        <GeometricShape
          variant="hexagon"
          color="purple"
          size="sm"
          animation="float"
          delay={0}
        />
      </div>
      <div className="absolute top-8 right-8 opacity-30">
        <GeometricShape
          variant="diamond"
          color="mint"
          size="md"
          animation="pulse"
          delay={2}
        />
      </div>
      <div className="absolute bottom-1/2 right-1/4 opacity-10">
        <GeometricShape
          variant="sphere"
          color="coral"
          size="lg"
          animation="drift"
          delay={4}
        />
      </div>
    </footer>
  );
}
