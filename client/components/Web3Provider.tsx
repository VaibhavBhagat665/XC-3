import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode, useEffect } from "react";
import { config } from "../lib/web3";

// Global error handler for unhandled fetch errors
if (typeof window !== "undefined") {
  // Suppress specific WalletConnect/AppKit fetch errors
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;
    if (
      error?.message?.includes("Failed to fetch") &&
      (error?.stack?.includes("AppKit") ||
        error?.stack?.includes("walletconnect") ||
        error?.stack?.includes("cloud.walletconnect") ||
        error?.stack?.includes("fetchProjectConfig") ||
        error?.stack?.includes("_sendAnalyticsEvent"))
    ) {
      // Prevent these errors from appearing in console
      event.preventDefault();
      return;
    }
  });

  // Also handle window errors
  window.addEventListener("error", (event) => {
    const error = event.error;
    if (
      error?.message?.includes("Failed to fetch") &&
      (error?.stack?.includes("AppKit") ||
        error?.stack?.includes("walletconnect") ||
        error?.stack?.includes("cloud.walletconnect"))
    ) {
      event.preventDefault();
      return;
    }
  });
}

interface Web3ProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on various network/API errors
        if (
          error?.message?.includes("401") ||
          error?.message?.includes("Unauthorized") ||
          error?.message?.includes("Failed to fetch") ||
          error?.message?.includes("fetch") ||
          error?.message?.includes("cca-lite.coinbase.com") ||
          error?.message?.includes("walletconnect") ||
          error?.message?.includes("cloud.walletconnect") ||
          error?.name === "TypeError"
        ) {
          return false;
        }
        return failureCount < 1; // Reduced retry attempts
      },
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 60 seconds
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Silently handle errors without breaking the app
      onError: (error: any) => {
        // Only log non-network errors
        if (!error?.message?.includes("Failed to fetch")) {
          console.warn("Query error (non-critical):", error?.message);
        }
      },
    },
  },
});

// Wrapper to handle ConnectKit errors gracefully
function ConnectKitWrapper({ children }: { children: ReactNode }) {
  try {
    return (
      <ConnectKitProvider
        theme="midnight"
        mode="dark"
        options={{
          initialChainId: 0, // Let user choose
          enforceSupportedChains: false,
          hideQuestionMarkCTA: true,
          hideTooltips: true,
          hideRecentBadge: true,
          walletConnectCTA: "link", // Show as link instead of prominent QR
          reducedMotion: false,
          disclaimer: false, // Disable external calls for disclaimer
        }}
        customTheme={{
          "--ck-font-family": "inherit",
          "--ck-border-radius": "16px",
          "--ck-primary-button-background":
            "linear-gradient(135deg, #00ffc8 0%, #8a2be2 100%)",
          "--ck-primary-button-hover-background":
            "linear-gradient(135deg, #00ffc8 0%, #8a2be2 100%)",
          "--ck-modal-background": "rgba(15, 15, 23, 0.95)",
          "--ck-body-background": "rgba(15, 15, 23, 0.95)",
          "--ck-overlay-background": "rgba(0, 0, 0, 0.8)",
          "--ck-connectbutton-background": "transparent",
          "--ck-connectbutton-color": "#00ffc8",
          "--ck-connectbutton-hover-background": "rgba(0, 255, 200, 0.1)",
        }}
      >
        {children}
      </ConnectKitProvider>
    );
  } catch (error) {
    console.warn("ConnectKit initialization error:", error);
    // Fallback: render children without ConnectKit wrapper
    return <>{children}</>;
  }
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitWrapper>{children}</ConnectKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
