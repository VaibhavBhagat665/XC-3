import { useState, useEffect } from "react";
import { Card } from "./ui/card";

export function Metrics() {
  const [metrics, setMetrics] = useState([
    {
      emoji: "🌱",
      label: "Credits Minted",
      value: "2.5M",
      subtitle: "verified worldwide",
      gradient: "from-green-400 to-green-600",
    },
    {
      emoji: "♻️",
      label: "Credits Retired",
      value: "856K",
      subtitle: "carbon offset",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      emoji: "💰",
      label: "Total Value",
      value: "$12.8M",
      subtitle: "locked in protocol",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      emoji: "🏗️",
      label: "Active Projects",
      value: "1,247",
      subtitle: "creating impact",
      gradient: "from-orange-400 to-red-500",
    },
    {
      emoji: "👥",
      label: "Community",
      value: "10K+",
      subtitle: "active users",
      gradient: "from-pink-400 to-rose-500",
    },
    {
      emoji: "🔗",
      label: "Blockchains",
      value: "12",
      subtitle: "networks connected",
      gradient: "from-cyan-400 to-teal-500",
    },
  ]);

  const networkStatus = [
    { name: "ZetaChain", status: "Active", emoji: "⚡", color: "green" },
    { name: "AI Verifier", status: "Online", emoji: "🤖", color: "blue" },
    {
      name: "Cross-Chain Bridge",
      status: "Healthy",
      emoji: "🌉",
      color: "purple",
    },
    { name: "DeFi Protocols", status: "Synced", emoji: "🏦", color: "orange" },
  ];

  // Simple data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value:
            metric.label === "Credits Minted"
              ? `${(2.5 + Math.random() * 0.1).toFixed(1)}M`
              : metric.value,
        })),
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
            <span className="text-xl">📊</span>
            <span className="text-blue-700 font-semibold">
              Live Network Data
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
            PLATFORM STATS
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time metrics from the XC3 carbon credit ecosystem
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${metric.gradient} p-8 rounded-3xl border-0 text-white hover:scale-105 transition-transform duration-200`}
            >
              <div className="text-4xl mb-4">{metric.emoji}</div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black">{metric.value}</h3>
                <p className="text-lg font-semibold opacity-90">
                  {metric.label}
                </p>
                <p className="text-sm opacity-75">{metric.subtitle}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Network Status */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🌐 Network Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {networkStatus.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="text-2xl">{item.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div
                    className={`text-sm ${
                      item.color === "green"
                        ? "text-green-600"
                        : item.color === "blue"
                          ? "text-blue-600"
                          : item.color === "purple"
                            ? "text-purple-600"
                            : "text-orange-600"
                    }`}
                  >
                    ● {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Stats Summary */}
        <div className="text-center mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-black text-gray-900">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">&lt;2s</div>
              <div className="text-gray-600">Response</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
            <div>
              <div className="text-3xl font-black text-gray-900">100%</div>
              <div className="text-gray-600">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
