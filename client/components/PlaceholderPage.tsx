import { Layout } from "./Layout";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowRight, Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  features: string[];
  comingSoon?: boolean;
}

export function PlaceholderPage({
  title,
  description,
  features,
  comingSoon = true,
}: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="w-20 h-20 glass-card rounded-2xl flex items-center justify-center mx-auto">
            <Construction className="w-10 h-10 text-neon-cyan" />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              {title} <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Status Badge */}
          {comingSoon && (
            <div className="inline-flex items-center space-x-2 glass rounded-full px-6 py-3 border border-neon-purple/30">
              <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
              <span className="text-neon-purple font-medium">Coming Soon</span>
            </div>
          )}

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="crypto-card text-left">
                <div className="space-y-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
                  </div>
                  <h3 className="font-semibold text-white">{feature}</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced functionality for managing and optimizing your
                    carbon credit operations.
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-4 pt-8">
            <p className="text-white/60">
              Want to see this page implemented? Continue prompting to build out
              the full functionality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-neon">
                Request Implementation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="btn-glass">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
