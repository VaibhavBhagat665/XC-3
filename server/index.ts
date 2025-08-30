import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getProjects,
  getProject,
  createProject,
  submitProject,
  startVerification,
  getProjectMetrics,
} from "./routes/projects";
import {
  uploadFile,
  uploadFiles,
  createProjectMetadata,
  getFileInfo,
  uploadMiddleware,
} from "./routes/upload";
import {
  getMarketListings,
  createListing,
  purchaseCredits,
  cancelListing,
  getMarketStats,
  getUserTradingHistory,
} from "./routes/market";
import {
  getLendingPositions,
  createPosition,
  addCollateral,
  repayLoan,
  liquidatePosition,
  getLendingStats,
  getUserPositions,
} from "./routes/lending";
import {
  getUserBalance,
  transferCredits,
  retireCredits,
  getUserTransactions,
} from "./routes/credits";
import {
  getUserActivity,
  getRecentActivity,
  getActivityStats,
} from "./routes/activity";

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Always allow during development or if no CORS_ORIGIN is set
        if (
          !process.env.CORS_ORIGIN ||
          process.env.NODE_ENV === "development"
        ) {
          return callback(null, true);
        }

        const allowedOrigins = [
          process.env.CORS_ORIGIN,
          process.env.CORS_ORIGIN.replace(/\/$/, ""), // Remove trailing slash
          process.env.CORS_ORIGIN +
            (process.env.CORS_ORIGIN.endsWith("/") ? "" : "/"), // Add trailing slash
          // Add common deployment URLs
          "https://xc-3-web.vercel.app",
          "https://xc3-1.onrender.com",
          "http://localhost:8080",
          "http://localhost:3000",
          "http://localhost:5173",
        ];

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`CORS: Origin ${origin} not allowed`);
          callback(null, true); // Allow for now to prevent issues
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Root route - API info (only in production when backend is standalone)
  // In development, this would interfere with the frontend routing
  if (process.env.NODE_ENV === "production") {
    app.get("/", (_req, res) => {
      res.json({
        name: "XC3 Carbon Credit API",
        version: "1.0.0",
        description: "Universal Carbon Credit Protocol API",
        status: "running",
        timestamp: new Date().toISOString(),
        endpoints: {
          health: "/api/ping",
          test: "/api/test",
          projects: "/api/projects",
          market: "/api/market",
          lending: "/api/lending",
          credits: "/api/credits",
          activity: "/api/activity",
          upload: "/api/upload",
          verification: "/api/verify",
          blockchain: "/api/blockchain",
          metrics: "/api/metrics",
        },
        documentation: "https://github.com/your-repo/docs",
      });
    });
  }

  // Health check
  app.get("/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping, timestamp: new Date().toISOString() });
  });

  // Test endpoint for debugging fetch issues
  app.get("/test", (_req, res) => {
    res.json({
      success: true,
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      server: "XC3 Backend",
      version: "1.0.0",
      cors: "enabled",
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Legacy demo route
  app.get("/demo", handleDemo);

  // Project routes
  app.get("/projects", getProjects);
  app.get("/projects/metrics", getProjectMetrics);
  app.get("/projects/:id", getProject);
  app.post("/projects", createProject);
  app.post("/projects/:id/submit", submitProject);
  app.post("/projects/:id/verify", startVerification);

  // File upload routes with error handling
  app.post(
    "/upload/file",
    (req, res, next) => {
      console.log("[DEBUG] Single file upload route hit:", req.method, req.url);
      next();
    },
    uploadMiddleware.single,
    (error: any, req: any, res: any, next: any) => {
      if (error) {
        console.error(
          "[DEBUG] Single file upload middleware error:",
          error.message,
        );
        return res.status(400).json({
          success: false,
          error: "File upload failed",
          message: error.message,
        });
      }
      next();
    },
    uploadFile,
  );

  app.post(
    "/upload/files",
    (req, res, next) => {
      console.log(
        "[DEBUG] Multiple files upload route hit:",
        req.method,
        req.url,
      );
      next();
    },
    uploadMiddleware.multiple,
    (error: any, req: any, res: any, next: any) => {
      if (error) {
        console.error(
          "[DEBUG] Multiple files upload middleware error:",
          error.message,
        );
        return res.status(400).json({
          success: false,
          error: "Files upload failed",
          message: error.message,
        });
      }
      next();
    },
    uploadFiles,
  );

  app.post("/upload/metadata", createProjectMetadata);
  app.get("/files/:hash", getFileInfo);

  // Debug route for upload testing
  app.get("/upload/test", (req, res) => {
    res.json({
      success: true,
      message: "Upload service is available",
      methods: ["POST /upload/file", "POST /upload/files"],
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/upload/test", (req, res) => {
    res.json({
      success: true,
      message: "POST method is working for upload service",
      body: req.body,
      headers: Object.keys(req.headers),
      timestamp: new Date().toISOString(),
    });
  });

  // Market routes
  app.get("/market/listings", getMarketListings);
  app.post("/market/listings", createListing);
  app.post("/market/listings/:id/purchase", purchaseCredits);
  app.post("/market/listings/:id/cancel", cancelListing);
  app.get("/market/stats", getMarketStats);
  app.get("/market/history/:address", getUserTradingHistory);

  // Lending routes
  app.get("/lending/positions", getLendingPositions);
  app.post("/lending/positions", createPosition);
  app.post("/lending/positions/:id/collateral", addCollateral);
  app.post("/lending/positions/:id/repay", repayLoan);
  app.post("/lending/positions/:id/liquidate", liquidatePosition);
  app.get("/lending/stats", getLendingStats);
  app.get("/lending/positions/:address", getUserPositions);

  // Credit wallet routes
  app.get("/credits/balance/:address", getUserBalance);
  app.post("/credits/transfer", transferCredits);
  app.post("/credits/retire", retireCredits);
  app.get("/credits/transactions/:address", getUserTransactions);

  // Activity routes
  app.get("/activity/:address", getUserActivity);
  app.get("/activity/recent", getRecentActivity);
  app.get("/activity/stats", getActivityStats);

  // AI Verification routes (mock for demo)
  app.post("/verify", (req, res) => {
    // Mock AI verification response
    setTimeout(() => {
      const score = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
      res.json({
        success: true,
        data: {
          score,
          explanation:
            score > 0.8
              ? "Document analysis successful. Project meets carbon credit standards."
              : "Document analysis complete. Some improvements may be needed.",
          model: "Local AI Verifier v1.0",
          confidence: score,
          artifacts: {
            ipfsHash: `Qm${Math.random().toString(36).substring(2)}`,
            processingTime: Math.floor(Math.random() * 5000) + 1000,
          },
        },
      });
    }, 2000); // Simulate 2-second processing time
  });

  // Blockchain simulation routes
  app.post("/blockchain/mint", (req, res) => {
    const { projectId, amount, recipient } = req.body;

    // Mock transaction hash
    const txHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;

    res.json({
      success: true,
      data: {
        transactionHash: txHash,
        tokenId: Date.now(),
        amount,
        recipient,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
      },
    });
  });

  // Get protocol metrics
  app.get("/metrics", (req, res) => {
    // Mock protocol metrics
    const metrics = {
      totalCreditsMinted: 2456000,
      creditsRetired: 856000,
      totalValueLocked: 12800000,
      activeProjects: 1247,
      averageVerificationScore: 0.88,
      networkStatus: {
        zetaChain: { status: "online", blockNumber: 12345678 },
        ethereum: { status: "online", blockNumber: 18765432 },
        polygon: { status: "online", blockNumber: 9876543 },
      },
    };

    res.json({
      success: true,
      data: metrics,
    });
  });

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Server error:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    },
  );

  // Log registered routes for debugging
  if (process.env.NODE_ENV === "development") {
    try {
      console.log("[DEBUG] XC3 Server started with API routes configured");
      console.log("[DEBUG] Key routes: /projects, /upload/files, /upload/file");
    } catch (error) {
      console.log(
        "[DEBUG] Route logging skipped:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  return app;
}
