import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
  connectDb,
  disconnectDb,
  healthCheck,
} from "@repo/database/src/lib/db.js";
import { apiRouter } from "./routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const isProduction = process.env.VERCEL_ENV === "production";

const whitelist = [
  process.env.WS_URL,
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  ...(!isProduction
    ? [
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:8080",
      ]
    : []),
].filter(Boolean) as string[];

app.use(
  cors({
    origin: whitelist,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
  }),
);

app.use(express.json()); // parse json body
app.use(express.urlencoded({ extended: true })); // parse urlencoded body

// Health check endpoint
app.get("/health", async (req, res) => {
  const dbHealthy = await healthCheck();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? "healthy" : "unhealthy",
    database: dbHealthy ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1", apiRouter);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDb();
    console.log("Connected to database");

    // Start listening
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await disconnectDb();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await disconnectDb();
  process.exit(0);
});

startServer();
