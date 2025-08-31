import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  MessageCircle,
  Mail,
  Globe,
  ArrowUpRight,
  Zap,
  Shield,
  Users,
  Code,
  Heart,
} from "lucide-react";
import { GeometricShape } from "./GeometricShapes";
import { cn } from "@/lib/utils";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Security", href: "#security" },
    { name: "Rewards", href: "#rewards" },
    { name: "API", href: "#api" },
  ],
  community: [
    { name: "Discord", href: "#discord", icon: MessageCircle },
    { name: "Twitter", href: "#twitter", icon: Twitter },
    { name: "GitHub", href: "#github", icon: Github },
    { name: "Blog", href: "#blog", icon: MessageCircle },
  ],
  company: [
    { name: "About", href: "#about" },
    { name: "Careers", href: "#careers" },
    { name: "Privacy", href: "#privacy" },
    { name: "Terms", href: "#terms" },
  ],
  resources: [
    { name: "Documentation", href: "#docs" },
    { name: "Help Center", href: "#help" },
    { name: "Status", href: "#status" },
    { name: "Whitepaper", href: "#whitepaper" },
  ],
};

const socialLinks = [
  {
    name: "Twitter",
    icon: Twitter,
    href: "#twitter",
    color: "from-blue-400 to-cyan-400",
  },
  {
    name: "Discord",
    icon: MessageCircle,
    href: "#discord",
    color: "from-indigo-400 to-purple-400",
  },
  {
    name: "GitHub",
    icon: Github,
    href: "#github",
    color: "from-gray-400 to-slate-400",
  },
  {
    name: "Telegram",
    icon: MessageCircle,
    href: "#telegram",
    color: "from-cyan-400 to-blue-400",
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
        <div className="pt-20 pb-12">
          {/* Top Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16"
          >
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center mb-6">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center border border-purple-500/30 mr-4"
                    whileHover={{
                      scale: 1.1,
                      boxShadow: "0 0 20px rgba(147,51,234,0.4)",
                    }}
                  >
                    <Zap className="w-6 h-6 text-purple-400" />
                  </motion.div>
                  <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-mint-400 bg-clip-text text-transparent">
                    XC3
                  </h3>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-md">
                  The future of carbon credit trading is here.
                  <span className="block mt-2 text-purple-400 font-semibold">
                    AI-verified, cross-chain carbon credits.
                  </span>
                </p>

                {/* Email Signup */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Subscribe
                  </motion.button>
                </div>
              </motion.div>

            </div>

            {/* Links Section */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Product */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-lg font-bold text-foreground mb-4">
                    Product
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.product.map((link, index) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-purple-400 transition-colors duration-300 flex items-center group"
                        >
                          {link.name}
                          <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Community */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-lg font-bold text-foreground mb-4">
                    Community
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.community.map((link, index) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-mint-400 transition-colors duration-300 flex items-center group"
                        >
                          {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                          {link.name}
                          <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Company */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-lg font-bold text-foreground mb-4">
                    Company
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link, index) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-coral-400 transition-colors duration-300 flex items-center group"
                        >
                          {link.name}
                          <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Resources */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-lg font-bold text-foreground mb-4">
                    Resources
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.resources.map((link, index) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <a
                          href={link.href}
                          className="text-muted-foreground hover:text-cyan-400 transition-colors duration-300 flex items-center group"
                        >
                          {link.name}
                          <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12"
          />

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            {/* Copyright */}
            <div className="flex items-center space-x-4">
              <div className="text-muted-foreground">
                © 2024 XC3. All rights reserved.
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-400">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
                <span>for sustainability</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center border border-border/30 group-hover:border-purple-500/50 transition-all duration-300",
                      social.color.replace(
                        "to-",
                        "to-transparent opacity-10 group-hover:opacity-20",
                      ),
                    )}
                  >
                    <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                  </div>

                  {/* Hover tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-background border border-border/50 rounded-lg text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {social.name}
                  </div>
                </motion.a>
              ))}
            </div>
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
