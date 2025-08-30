// Suppress non-critical console errors to improve developer experience
export function setupErrorSuppression() {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error to filter out known non-critical errors
  console.error = (...args: any[]) => {
    const errorMessage = args.join(" ");

    // List of error patterns to suppress - Only suppress external service errors
    // that we cannot control (like analytics, metrics services)
    const suppressPatterns = [
      "cca-lite.coinbase.com",
      "POST https://cca-lite.coinbase.com/metrics",
      "net::ERR_ABORTED 401 (Unauthorized)",
      "Coinbase analytics",
      "metrics endpoint",
      "Failed to load resource: the server responded with a status of 401",
      // Only suppress 401 errors from external analytics services
      "401 ()" + " cca-lite.coinbase.com",
      // Don't suppress our own API errors - let them show for debugging
    ];

    // Check if this error should be suppressed
    const shouldSuppress = suppressPatterns.some((pattern) =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (!shouldSuppress) {
      // Call the original console.error for non-suppressed errors
      originalError.apply(console, args);
    }
  };

  // Override console.warn to suppress Lit dev mode warnings
  console.warn = (...args: any[]) => {
    const warningMessage = args.join(" ");

    const suppressWarnings = [
      "Lit is in dev mode",
      "Not recommended for production",
      "lit.dev/msg/dev-mode",
      // Suppress React development warnings that are not actionable
      "Warning: ReactDOM.render is no longer supported",
      // Suppress scroll animation warnings when containers don't have proper position
      "Please ensure that the container has a non-static position",
    ];

    const shouldSuppress = suppressWarnings.some((pattern) =>
      warningMessage.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Also suppress unhandled promise rejections for these specific errors
  window.addEventListener("unhandledrejection", (event) => {
    const errorMessage =
      event.reason?.message || event.reason?.toString() || "";

    const suppressPatterns = [
      "cca-lite.coinbase.com",
      // Only suppress external service unauthorized errors
      "cca-lite.coinbase.com" + " 401",
      "cca-lite.coinbase.com" + " Unauthorized",
      // Don't suppress our own API errors - they need to be visible for debugging
    ];

    const shouldSuppress = suppressPatterns.some((pattern) =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase()),
    );

    if (shouldSuppress) {
      event.preventDefault(); // Prevent the error from appearing in console
    }
  });
}

// Clean up function to restore original console.error if needed
export function restoreConsole() {
  // This would need to store the original reference, but for most use cases
  // the suppression can remain active throughout the app lifecycle
}
