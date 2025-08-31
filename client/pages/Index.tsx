import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { Footer } from "../components/Footer";
import { Layout } from "../components/Layout";

export default function Index() {
  return (
    <Layout>
      <div className="relative">
        <Hero />

        <Features />

        <HowItWorks />

        <Footer />
      </div>
    </Layout>
  );
}
