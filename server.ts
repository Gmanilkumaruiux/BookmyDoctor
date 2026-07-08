import './server/utils/env'; // Validates environment variables using Zod schema at startup
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import aiRoutes from "./server/routes/aiRoutes";
import apiRoutes from "./server/routes/apiRoutes";
import { globalRateLimiter } from "./server/middlewares/rateLimiter";
import { errorHandler } from "./server/middlewares/errorHandler";
import logger from "./server/utils/logger";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust reverse proxy for accurate IP tracking and rate limiting
  app.set('trust proxy', 1);

  // Basic Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled to prevent blocking inline scripts, images & third-party fonts
    crossOriginEmbedderPolicy: false,
    frameguard: false, // Crucial: disabled to allow rendering within the Google AI Studio preview iframe
  }));

  // Enable CORS
  app.use(cors({
    origin: true, // Allow dev/staging origins dynamically
    credentials: true
  }));

  // Enable Gzip/Deflate compression for performance optimization
  app.use(compression());

  // JSON Body Parser
  app.use(express.json());

  // Centralized Request Logger using Winston
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Apply Global API Rate Limiter
  app.use("/api", globalRateLimiter);

  // Core API Endpoints - Supporting standard API and Versioned /api/v1 endpoints
  app.use("/api/v1/ai", aiRoutes);
  app.use("/api/ai", aiRoutes);

  app.use("/api/v1", apiRoutes);
  app.use("/api", apiRoutes);

  // Health check endpoint (Optional Improvement)
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Vite integration middleware (Vite Dev Server in development, Static dist in production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Centralized Error Handling Middleware
  app.use(errorHandler);

  // Setup graceful shutdown triggers
  const server = app.listen(PORT, () => {
  logger.info(`Enterprise Server running successfully on http://localhost:${PORT}`);
});
  // Graceful Shutdown
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      logger.info('HTTP Server closed safely. Releasing resources.');
      process.exit(0);
    });

    // Force shutdown if connections do not close in 10s
    setTimeout(() => {
      logger.error('Could not close active connections in time. Force shutting down.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
