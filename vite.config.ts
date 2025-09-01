import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Check if we should use integrated server or proxy to separate backend
  const useIntegratedServer =
    !process.env.VITE_API_URL || process.env.VITE_API_URL === "/api";

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        port: 24678,
      },
      fs: {
        allow: ["./client", "./shared", "./node_modules"],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
      },
      // Proxy to separate backend if VITE_API_URL is set to external server
      proxy: !useIntegratedServer
        ? {
            "/api": {
              target:
                process.env.VITE_API_URL?.replace("/api", "") ||
                "http://localhost:5000",
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api/, "/api"),
            },
          }
        : {},
    },
    build: {
      outDir: "dist/spa",
    },
    plugins: [
      react(),
      // Only use integrated Express server if not using external API
      ...(useIntegratedServer ? [expressPlugin()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    define: {
      // Ensure environment variables are properly defined
      "import.meta.env.VITE_API_URL": JSON.stringify(
        process.env.VITE_API_URL || "/api",
      ),
    },
  };
});

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const { createServer } = await import("./server/index.ts");
      const app = createServer();

      // Add Express app as middleware to Vite dev server BEFORE SPA fallback
      // This ensures API routes are handled before the frontend routing
      server.middlewares.use("/api", app);

      console.log(
        "[DEBUG] Express plugin configured - API routes should be available at /api/*",
      );
    },
  };
}
