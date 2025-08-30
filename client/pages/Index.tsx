// Updated
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { Security } from "../components/Security";
import { Community } from "../components/Community";
import { Rewards } from "../components/Rewards";
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

        {/* Security & Reliability Section */}
        <Security />

        {/* Community & Innovation Section */}
        <Community />

        {/* Rewards/Benefits Section */}
        <Rewards />

        {/* Footer */}
        <Footer />
      </div>
    </Layout>
  );
}
