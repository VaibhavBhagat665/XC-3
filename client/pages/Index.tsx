import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { TierRewards } from "../components/TierRewards";
import { Footer } from "../components/Footer";
import { Layout } from "../components/Layout";

export default function Index() {
  return (
    <Layout>
      <div className="relative">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Tier Rewards Section */}
        <TierRewards />

        {/* Footer */}
        <Footer />
      </div>
    </Layout>
  );
}
