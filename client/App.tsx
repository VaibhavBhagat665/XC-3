import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./components/Web3Provider";
import { ErrorBoundary } from "react-error-boundary";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Wallet from "./pages/Wallet";
import Market from "./pages/Market";
import Lending from "./pages/Lending";
import Activity from "./pages/Activity";
import NotFound from "./pages/NotFound";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-muted-foreground">
          Please refresh the page to try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="relative min-h-screen" style={{ position: 'relative' }}>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          // Log error but don't break the app
          console.warn("App error caught:", error, errorInfo);
        }}
      >
        <Web3Provider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/market" element={<Market />} />
                <Route path="/lend" element={<Lending />} />
                <Route path="/activity" element={<Activity />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </Web3Provider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
