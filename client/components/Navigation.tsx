import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ConnectKitButton } from "connectkit";
import { useWeb3, useChainInfo } from "../hooks/useWeb3";
import { useScrollDirection } from "../hooks/useScrollAnimations";
import { ChevronDown, Menu, X, Zap, ExternalLink } from "lucide-react";
import { XC3DiamondLogo } from "./XC3DiamondLogo";
import { useState, useEffect } from "react";

export function Navigation() {
  const location = useLocation();
  const { isConnected, switchToZeta, isZetaChain, connect, connectors } = useWeb3();
  const { chainName, chainColor } = useChainInfo();
  const scrollDirection = useScrollDirection();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for background blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: "��" },
    { path: "/projects", label: "Projects", icon: "🌱" },
    { path: "/wallet", label: "Wallet", icon: "💼" },
    { path: "/market", label: "Market", icon: "📈" },
    { path: "/lend", label: "Lending", icon: "🏦" },
    { path: "/activity", label: "Activity", icon: "⚡" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out
        ${scrollDirection === "down" && isScrolled ? "-translate-y-full" : "translate-y-0"}
        ${
          isScrolled
            ? "glass-nav shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            : "bg-transparent"
        }
      `}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-4 hover:scale-105 transition-transform duration-300 group"
          >
            <div className="relative">
              <XC3DiamondLogo
                size="md"
                showText={false}
                className="group-hover:scale-110 transition-transform duration-300"
              />

              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-2xl font-black text-neon leading-none">
                XC3
              </h1>
              <p className="text-xs text-muted-foreground leading-none">
                Carbon Credits
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative text-sm font-semibold transition-all duration-300 group px-4 py-2 rounded-xl
                  ${
                    isActive(item.path)
                      ? "text-cyan-400 bg-cyan-400/10"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <span className="relative z-10">{item.label}</span>

                {/* Active indicator */}
                {isActive(item.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl border border-cyan-400/30" />
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Chain Indicator */}
            {isConnected && (
              <Badge
                variant="outline"
                className={`
                  ${chainColor} border-current/30 bg-current/10 cursor-pointer 
                  hover:bg-current/20 transition-all duration-300 backdrop-blur-sm
                  hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]
                `}
                onClick={switchToZeta}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isZetaChain ? "bg-green-400 animate-pulse" : "bg-yellow-400"
                  }`}
                />
                {chainName}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Badge>
            )}

            {/* Connect Wallet Button */}
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => {
                const inIframe =
                  typeof window !== "undefined" &&
                  window.top &&
                  window.top !== window.self;
                return (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={show}
                      className="btn-neon group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        {isConnected ? (
                          <>
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            {ensName ?? truncatedAddress}
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Connect Wallet
                          </>
                        )}
                      </span>
                    </Button>
                    {!isConnected && (
                      <>
                        {inIframe && (
                          <Button
                            variant="ghost"
                            className="text-foreground hover:text-cyan-400 hover:bg-cyan-400/10"
                            onClick={() => {
                              try {
                                window.open(window.location.href, "_blank", "noopener");
                              } catch {}
                            }}
                            title="Open in new tab to enable browser wallet"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in new tab
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="btn-glow-secondary"
                          onClick={() => {
                            const mm = (connectors as any[])?.find((c) => c.id === "metaMask") ||
                                        (connectors as any[])?.find((c) => c.id === "injected");
                            if (mm) connect(mm);
                          }}
                          title="Connect with browser wallet"
                        >
                          Use Browser Wallet
                        </Button>
                      </>
                    )}
                  </div>
                );
              }}
            </ConnectKitButton.Custom>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-foreground hover:text-cyan-400 hover:bg-cyan-400/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            lg:hidden overflow-hidden transition-all duration-500 ease-out
            ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="pt-6 pb-4 space-y-2">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${
                    isActive(item.path)
                      ? "text-cyan-400 bg-cyan-400/10 border border-cyan-400/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>

                {/* Active pulse effect */}
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                )}
              </Link>
            ))}

            {/* Mobile Chain Indicator */}
            {isConnected && (
              <div className="px-4 py-3 mt-4 border-t border-border/30">
                <div
                  className={`
                    flex items-center justify-between p-3 rounded-xl cursor-pointer
                    ${chainColor} border border-current/30 bg-current/10
                    hover:bg-current/20 transition-all duration-300
                  `}
                  onClick={switchToZeta}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isZetaChain
                          ? "bg-green-400 animate-pulse"
                          : "bg-yellow-400"
                      }`}
                    />
                    <span className="font-semibold">{chainName}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Background Blur */}
      {isScrolled && (
        <div className="absolute inset-0 -z-10 bg-background/60 backdrop-blur-xl border-b border-border/30" />
      )}
    </nav>
  );
}
